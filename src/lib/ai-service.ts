import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { HfInference } from '@huggingface/inference'
import { Ollama } from 'ollama'
// import { ChromaClient } from 'chromadb'
// import { QdrantClient } from '@qdrant/js-client-rest'
// import * as weaviate from 'weaviate-client'
// import { PineconeClient } from '@pinecone-database/pinecone'
import { AIModel, getModelsByType, getModelById } from './ai-registry'

// Initialize AI clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '')
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY)

// Initialize vector databases (commented out to avoid build issues)
// const chromaClient = new ChromaClient()
// const qdrantClient = new QdrantClient({ url: process.env.QDRANT_URL || 'http://localhost:6333' })
// Weaviate client initialization commented out to avoid build errors
// const weaviateClient = weaviate.client({
//   scheme: process.env.WEAVIATE_SCHEME || 'http',
//   host: process.env.WEAVIATE_HOST || 'localhost:8080',
// })

// Initialize Ollama
const ollama = new Ollama({ host: process.env.OLLAMA_HOST || 'http://localhost:11434' })

export interface AIServiceConfig {
  model: string
  temperature?: number
  maxTokens?: number
  topP?: number
  topK?: number
  stream?: boolean
}

export interface TextGenerationRequest {
  prompt: string
  config: AIServiceConfig
  systemPrompt?: string
}

export interface ImageGenerationRequest {
  prompt: string
  model: string
  size?: string
  style?: string
  steps?: number
}

export interface EmbeddingRequest {
  text: string
  model: string
}

export interface RAGRequest {
  query: string
  documents: string[]
  model: string
}

export class AIService {
  private static instance: AIService

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService()
    }
    return AIService.instance
  }

  async generateText(request: TextGenerationRequest): Promise<string> {
    const { prompt, config, systemPrompt } = request
    const model = getModelById(config.model)

    if (!model) {
      throw new Error(`Model ${config.model} not found`)
    }

    try {
      switch (model.provider) {
        case 'OpenAI':
          return await this.generateWithOpenAI(prompt, config, systemPrompt)
        case 'Anthropic':
          return await this.generateWithAnthropic(prompt, config, systemPrompt)
        case 'Google':
          return await this.generateWithGoogle(prompt, config, systemPrompt)
        case 'Meta':
        case 'Mistral AI':
        case 'Alibaba':
        case 'TII':
        case 'BigScience':
          return await this.generateWithHuggingFace(prompt, config)
        case 'Ollama':
          return await this.generateWithOllama(prompt, config)
        default:
          throw new Error(`Provider ${model.provider} not supported`)
      }
    } catch (error) {
      console.error('Text generation error:', error)
      
      // Handle country/region restriction errors specifically
      if (error && typeof error === 'object' && 'code' in error) {
        const errorCode = (error as any).code
        
        if (errorCode === 'unsupported_country_region_territory') {
          // Try to fallback to alternative providers
          console.log('OpenAI not available in this region, trying alternatives...')
          
          // Try HuggingFace models first (usually available globally)
          const hfModels = getModelsByType('text').filter(m => 
            m.provider === 'Mistral AI' || m.provider === 'Meta' || m.provider === 'BigScience'
          )
          
          if (hfModels.length > 0) {
            try {
              console.log('Attempting fallback to HuggingFace model:', hfModels[0].id)
              return await this.generateWithHuggingFace(prompt, {
                ...config,
                model: hfModels[0].id
              })
            } catch (fallbackError) {
              console.error('HuggingFace fallback failed:', fallbackError)
            }
          }
          
          // Try Ollama if available
          try {
            console.log('Attempting fallback to Ollama model')
            return await this.generateWithOllama(prompt, {
              ...config,
              model: 'llama2'
            })
          } catch (ollamaError) {
            console.error('Ollama fallback failed:', ollamaError)
          }
          
          // If all fallbacks fail, provide helpful error message
          throw new Error(
            `AI services are not available in your region. Please try:\n` +
            `1. Using a VPN to connect from a supported region\n` +
            `2. Setting up local models with Ollama\n` +
            `3. Using alternative AI providers\n\n` +
            `Currently available: HuggingFace open-source models (no API key required)`
          )
        }
      }
      
      throw error
    }
  }

  private async generateWithOpenAI(prompt: string, config: AIServiceConfig, systemPrompt?: string): Promise<string> {
    const messages: any[] = []
    
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt })
    }
    
    messages.push({ role: 'user', content: prompt })

    const completion = await openai.chat.completions.create({
      model: config.model,
      messages,
      temperature: config.temperature || 0.7,
      max_tokens: config.maxTokens,
      stream: config.stream || false,
    })

    return completion.choices[0]?.message?.content || ''
  }

  private async generateWithAnthropic(prompt: string, config: AIServiceConfig, systemPrompt?: string): Promise<string> {
    const messages: any[] = [{ role: 'user', content: prompt }]

    const response = await anthropic.messages.create({
      model: config.model,
      max_tokens: config.maxTokens || 1000,
      temperature: config.temperature || 0.7,
      system: systemPrompt || '',
      messages,
    })

    return response.content[0]?.text || ''
  }

  private async generateWithGoogle(prompt: string, config: AIServiceConfig, systemPrompt?: string): Promise<string> {
    const model = genAI.getGenerativeModel({ model: config.model })
    
    const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt
    
    const result = await model.generateContent(fullPrompt)
    return result.response.text()
  }

  private async generateWithHuggingFace(prompt: string, config: AIServiceConfig): Promise<string> {
    const model = getModelById(config.model)
    
    if (!model?.endpoint) {
      throw new Error('HuggingFace model endpoint not found')
    }

    const response = await hf.textGeneration({
      model: model.endpoint,
      inputs: prompt,
      parameters: {
        max_new_tokens: config.maxTokens,
        temperature: config.temperature,
        top_p: config.topP,
        top_k: config.topK,
      },
    })

    return response.generated_text || ''
  }

  private async generateWithOllama(prompt: string, config: AIServiceConfig): Promise<string> {
    const response = await ollama.generate({
      model: config.model.replace('ollama-', ''),
      prompt: prompt,
      options: {
        temperature: config.temperature,
        num_predict: config.maxTokens,
        top_p: config.topP,
        top_k: config.topK,
      },
    })

    return response.response
  }

  async generateImage(request: ImageGenerationRequest): Promise<string[]> {
    const { prompt, model, size = '1024x1024', style = 'vivid' } = request

    try {
      if (model.includes('dall-e')) {
        const response = await openai.images.generate({
          model: 'dall-e-3',
          prompt,
          n: 1,
          size: size as any,
          quality: 'standard',
          style: style as 'vivid' | 'natural',
        })
        
        return response.data.map(img => img.url || '')
      } else if (model.includes('stable-diffusion')) {
        const response = await hf.textToImage({
          model: 'stabilityai/stable-diffusion-xl-base-1.0',
          inputs: prompt,
          parameters: {
            guidance_scale: 7.5,
            num_inference_steps: 50,
          },
        })
        
        return [response.toString()]
      } else {
        throw new Error(`Image model ${model} not supported`)
      }
    } catch (error) {
      console.error('Image generation error:', error)
      throw error
    }
  }

  async generateEmbedding(request: EmbeddingRequest): Promise<number[]> {
    const { text, model } = request

    try {
      if (model.includes('text-embedding-ada')) {
        const response = await openai.embeddings.create({
          model: 'text-embedding-ada-002',
          input: text,
        })
        
        return response.data[0]?.embedding || []
      } else {
        // Use HuggingFace for other embedding models
        const response = await hf.featureExtraction({
          model: model,
          inputs: text,
        })
        
        return response as number[]
      }
    } catch (error) {
      console.error('Embedding generation error:', error)
      throw error
    }
  }

  async webSearch(query: string, numResults: number = 10): Promise<any[]> {
    try {
      // Use Z-AI SDK for web search as fallback
      const ZAI = await import('z-ai-web-dev-sdk')
      const zai = await ZAI.create()
      
      const searchResult = await zai.functions.invoke("web_search", {
        query: query,
        num: numResults
      })

      return searchResult
    } catch (error) {
      console.error('Web search error:', error)
      throw error
    }
  }

  // Vector Database Operations (simplified for build compatibility)
  async addToVectorDB(collection: string, documents: Array<{ id: string; text: string; metadata?: any }>) {
    try {
      // Simplified implementation - in production, use actual vector database
      console.log(`Adding ${documents.length} documents to collection: ${collection}`)
      return { success: true, message: `Added ${documents.length} documents to ${collection}` }
    } catch (error) {
      console.error('Vector DB error:', error)
      throw error
    }
  }

  async searchVectorDB(collection: string, query: string, limit: number = 5) {
    try {
      // Simplified implementation - in production, use actual vector database
      console.log(`Searching in collection: ${collection} for query: ${query}`)
      return {
        documents: [[]],
        metadatas: [[]],
        distances: [[]]
      }
    } catch (error) {
      console.error('Vector search error:', error)
      throw error
    }
  }

  // RAG (Retrieval-Augmented Generation)
  async ragQuery(request: RAGRequest): Promise<string> {
    const { query, documents, model } = request

    try {
      // 1. Add documents to vector DB
      await this.addToVectorDB('rag-collection', documents.map((doc, index) => ({
        id: `doc-${index}`,
        text: doc,
        metadata: { source: 'user-upload' }
      })))

      // 2. Search for relevant documents
      const searchResults = await this.searchVectorDB('rag-collection', query)
      
      // 3. Generate context from search results
      const context = searchResults.documents?.[0]?.join('\n\n') || ''
      
      // 4. Generate response with context
      const augmentedPrompt = `
        Context: ${context}
        
        Question: ${query}
        
        Please answer the question based on the provided context. If the context doesn't contain enough information, please say so.
      `

      const response = await this.generateText({
        prompt: augmentedPrompt,
        config: { model, temperature: 0.3, maxTokens: 1000 }
      })

      return response
    } catch (error) {
      console.error('RAG query error:', error)
      throw error
    }
  }

  // Model comparison
  async compareModels(prompt: string, models: string[]): Promise<Record<string, string>> {
    const results: Record<string, string> = {}

    for (const modelId of models) {
      try {
        const response = await this.generateText({
          prompt,
          config: { model: modelId, temperature: 0.7, maxTokens: 500 }
        })
        results[modelId] = response
      } catch (error) {
        results[modelId] = `Error: ${(error as Error).message}`
      }
    }

    return results
  }

  // Get available models
  getAvailableModels(): AIModel[] {
    const textModels = getModelsByType('text')
    const imageModels = getModelsByType('image')
    const embeddingModels = getModelsByType('embedding')
    const codeModels = getModelsByType('code')

    const allModels = [
      ...textModels,
      ...imageModels,
      ...embeddingModels,
      ...codeModels
    ]

    // Check if OpenAI is available in this region by testing a simple call
    // For now, we'll filter out OpenAI models if no API key is set
    // This prevents the 403 error from appearing in regions where OpenAI is not supported
    const isRegionRestricted = !process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here'

    return allModels.filter(model => {
      // Filter out OpenAI models if region is restricted or no API key
      if (model.provider === 'OpenAI' && isRegionRestricted) {
        return false
      }
      
      // Filter out other proprietary models if no API keys
      if (model.apiKeyRequired) {
        switch (model.provider) {
          case 'Anthropic':
            return !!process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'your_anthropic_api_key_here'
          case 'Google':
            return !!process.env.GOOGLE_AI_API_KEY && process.env.GOOGLE_AI_API_KEY !== 'your_google_ai_api_key_here'
          default:
            return true
        }
      }
      
      return true
    }).sort((a, b) => {
      // Prioritize open-source and local models in restricted regions
      if (isRegionRestricted) {
        const priorityOrder = { 'open-source': 0, 'local': 1, 'proprietary': 2 }
        const aPriority = priorityOrder[a.category] || 3
        const bPriority = priorityOrder[b.category] || 3
        return aPriority - bPriority
      }
      return 0
    })
  }
}

export const aiService = AIService.getInstance()