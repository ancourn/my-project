// Comprehensive AI Model Registry
export interface AIModel {
  id: string
  name: string
  provider: string
  type: 'text' | 'image' | 'embedding' | 'multimodal' | 'code' | 'audio'
  category: 'proprietary' | 'open-source' | 'local'
  description: string
  maxTokens?: number
  supportsStreaming?: boolean
  supportsFunctions?: boolean
  costPer1kTokens?: {
    input: number
    output: number
  }
  endpoint?: string
  apiKeyRequired?: boolean
  features: string[]
}

export const AI_MODELS: AIModel[] = [
  // Proprietary Models
  {
    id: 'gpt-4',
    name: 'GPT-4',
    provider: 'OpenAI',
    type: 'text',
    category: 'proprietary',
    description: 'Most capable GPT-4 model',
    maxTokens: 8192,
    supportsStreaming: true,
    supportsFunctions: true,
    costPer1kTokens: { input: 0.03, output: 0.06 },
    apiKeyRequired: true,
    features: ['reasoning', 'coding', 'creative writing', 'analysis']
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'OpenAI',
    type: 'text',
    category: 'proprietary',
    description: 'Latest GPT-4 model with knowledge up to April 2024',
    maxTokens: 128000,
    supportsStreaming: true,
    supportsFunctions: true,
    apiKeyRequired: true,
    features: ['reasoning', 'coding', 'creative writing', 'analysis', 'large-context']
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'OpenAI',
    type: 'text',
    category: 'proprietary',
    description: 'Fast and capable model for most tasks',
    maxTokens: 4096,
    supportsStreaming: true,
    supportsFunctions: true,
    costPer1kTokens: { input: 0.0015, output: 0.002 },
    apiKeyRequired: true,
    features: ['chat', 'coding', 'quick-tasks']
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    type: 'text',
    category: 'proprietary',
    description: 'Most intelligent Claude model',
    maxTokens: 200000,
    supportsStreaming: true,
    apiKeyRequired: true,
    features: ['reasoning', 'analysis', 'coding', 'creative-writing']
  },
  {
    id: 'claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    provider: 'Anthropic',
    type: 'text',
    category: 'proprietary',
    description: 'Balance of intelligence and speed',
    maxTokens: 200000,
    supportsStreaming: true,
    apiKeyRequired: true,
    features: ['chat', 'coding', 'analysis']
  },
  {
    id: 'claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'Anthropic',
    type: 'text',
    category: 'proprietary',
    description: 'Fastest and most compact model',
    maxTokens: 200000,
    supportsStreaming: true,
    apiKeyRequired: true,
    features: ['chat', 'quick-tasks']
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    provider: 'Google',
    type: 'text',
    category: 'proprietary',
    description: 'Multimodal model with reasoning capabilities',
    maxTokens: 32768,
    supportsStreaming: true,
    apiKeyRequired: true,
    features: ['reasoning', 'multimodal', 'coding', 'analysis']
  },
  {
    id: 'gemini-ultra',
    name: 'Gemini Ultra',
    provider: 'Google',
    type: 'text',
    category: 'proprietary',
    description: 'Most capable Gemini model',
    maxTokens: 32768,
    supportsStreaming: true,
    apiKeyRequired: true,
    features: ['reasoning', 'multimodal', 'coding', 'analysis', 'complex-tasks']
  },

  // Open Source Models (HuggingFace)
  {
    id: 'llama-2-7b',
    name: 'Llama 2 7B',
    provider: 'Meta',
    type: 'text',
    category: 'open-source',
    description: '7 billion parameter Llama 2 model',
    maxTokens: 4096,
    endpoint: 'https://api-inference.huggingface.co/models/meta-llama/Llama-2-7b-chat-hf',
    apiKeyRequired: false,
    features: ['chat', 'reasoning', 'coding']
  },
  {
    id: 'llama-2-13b',
    name: 'Llama 2 13B',
    provider: 'Meta',
    type: 'text',
    category: 'open-source',
    description: '13 billion parameter Llama 2 model',
    maxTokens: 4096,
    endpoint: 'https://api-inference.huggingface.co/models/meta-llama/Llama-2-13b-chat-hf',
    apiKeyRequired: false,
    features: ['chat', 'reasoning', 'coding', 'analysis']
  },
  {
    id: 'llama-2-70b',
    name: 'Llama 2 70B',
    provider: 'Meta',
    type: 'text',
    category: 'open-source',
    description: '70 billion parameter Llama 2 model',
    maxTokens: 4096,
    endpoint: 'https://api-inference.huggingface.co/models/meta-llama/Llama-2-70b-chat-hf',
    apiKeyRequired: false,
    features: ['chat', 'reasoning', 'coding', 'analysis', 'complex-tasks']
  },
  {
    id: 'mistral-7b',
    name: 'Mistral 7B',
    provider: 'Mistral AI',
    type: 'text',
    category: 'open-source',
    description: '7 billion parameter Mistral model',
    maxTokens: 8192,
    endpoint: 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
    apiKeyRequired: false,
    features: ['chat', 'reasoning', 'coding', 'multilingual']
  },
  {
    id: 'mixtral-8x7b',
    name: 'Mixtral 8x7B',
    provider: 'Mistral AI',
    type: 'text',
    category: 'open-source',
    description: 'Mixture of experts model with 8x7 billion parameters',
    maxTokens: 32768,
    endpoint: 'https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1',
    apiKeyRequired: false,
    features: ['chat', 'reasoning', 'coding', 'multilingual', 'analysis']
  },
  {
    id: 'qwen-72b',
    name: 'Qwen 72B',
    provider: 'Alibaba',
    type: 'text',
    category: 'open-source',
    description: '72 billion parameter Qwen model',
    maxTokens: 32768,
    endpoint: 'https://api-inference.huggingface.co/models/Qwen/Qwen-72B-Chat',
    apiKeyRequired: false,
    features: ['chat', 'reasoning', 'coding', 'multilingual', 'chinese-specialized']
  },
  {
    id: 'falcon-40b',
    name: 'Falcon 40B',
    provider: 'TII',
    type: 'text',
    category: 'open-source',
    description: '40 billion parameter Falcon model',
    maxTokens: 2048,
    endpoint: 'https://api-inference.huggingface.co/models/tiiuae/falcon-40b-instruct',
    apiKeyRequired: false,
    features: ['chat', 'reasoning', 'coding']
  },
  {
    id: 'bloom-176b',
    name: 'BLOOM 176B',
    provider: 'BigScience',
    type: 'text',
    category: 'open-source',
    description: '176 billion parameter BLOOM model',
    maxTokens: 2048,
    endpoint: 'https://api-inference.huggingface.co/models/bigscience/bloom',
    apiKeyRequired: false,
    features: ['chat', 'reasoning', 'multilingual']
  },

  // Local Models (Ollama)
  {
    id: 'ollama-llama2',
    name: 'Ollama Llama 2',
    provider: 'Ollama',
    type: 'text',
    category: 'local',
    description: 'Local Llama 2 model via Ollama',
    maxTokens: 4096,
    endpoint: 'http://localhost:11434/api/generate',
    apiKeyRequired: false,
    features: ['chat', 'reasoning', 'coding', 'private']
  },
  {
    id: 'ollama-mistral',
    name: 'Ollama Mistral',
    provider: 'Ollama',
    type: 'text',
    category: 'local',
    description: 'Local Mistral model via Ollama',
    maxTokens: 8192,
    endpoint: 'http://localhost:11434/api/generate',
    apiKeyRequired: false,
    features: ['chat', 'reasoning', 'coding', 'private', 'fast']
  },
  {
    id: 'ollama-codellama',
    name: 'Ollama Code Llama',
    provider: 'Ollama',
    type: 'code',
    category: 'local',
    description: 'Local Code Llama model via Ollama',
    maxTokens: 4096,
    endpoint: 'http://localhost:11434/api/generate',
    apiKeyRequired: false,
    features: ['coding', 'code-generation', 'debugging', 'private']
  },

  // Image Generation Models
  {
    id: 'dall-e-3',
    name: 'DALL-E 3',
    provider: 'OpenAI',
    type: 'image',
    category: 'proprietary',
    description: 'Advanced image generation model',
    apiKeyRequired: true,
    features: ['image-generation', 'high-quality', 'text-to-image']
  },
  {
    id: 'stable-diffusion-xl',
    name: 'Stable Diffusion XL',
    provider: 'Stability AI',
    type: 'image',
    category: 'open-source',
    description: 'Open source image generation model',
    endpoint: 'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0',
    apiKeyRequired: false,
    features: ['image-generation', 'high-quality', 'text-to-image', 'open-source']
  },
  {
    id: 'kandinsky-2.2',
    name: 'Kandinsky 2.2',
    provider: 'Kandinsky',
    type: 'image',
    category: 'open-source',
    description: 'Advanced image generation model',
    endpoint: 'https://api-inference.huggingface.co/models/kandinsky-community/kandinsky-2-2-decoder',
    apiKeyRequired: false,
    features: ['image-generation', 'artistic', 'text-to-image']
  },

  // Embedding Models
  {
    id: 'text-embedding-ada-002',
    name: 'Text Embedding Ada 002',
    provider: 'OpenAI',
    type: 'embedding',
    category: 'proprietary',
    description: 'OpenAI text embedding model',
    apiKeyRequired: true,
    features: ['embedding', 'semantic-search', 'similarity']
  },
  {
    id: 'sentence-transformers-all-MiniLM-L6-v2',
    name: 'Sentence Transformers MiniLM',
    provider: 'HuggingFace',
    type: 'embedding',
    category: 'open-source',
    description: 'Lightweight sentence embedding model',
    endpoint: 'https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2',
    apiKeyRequired: false,
    features: ['embedding', 'semantic-search', 'similarity', 'lightweight']
  },

  // Code Models
  {
    id: 'code-llama-7b',
    name: 'Code Llama 7B',
    provider: 'Meta',
    type: 'code',
    category: 'open-source',
    description: '7 billion parameter code generation model',
    maxTokens: 4096,
    endpoint: 'https://api-inference.huggingface.co/models/codellama/CodeLlama-7b-hf',
    apiKeyRequired: false,
    features: ['coding', 'code-generation', 'debugging', 'multiple-languages']
  },
  {
    id: 'code-llama-34b',
    name: 'Code Llama 34B',
    provider: 'Meta',
    type: 'code',
    category: 'open-source',
    description: '34 billion parameter code generation model',
    maxTokens: 4096,
    endpoint: 'https://api-inference.huggingface.co/models/codellama/CodeLlama-34b-hf',
    apiKeyRequired: false,
    features: ['coding', 'code-generation', 'debugging', 'multiple-languages', 'complex-code']
  },
  {
    id: 'starcoder',
    name: 'StarCoder',
    provider: 'HuggingFace',
    type: 'code',
    category: 'open-source',
    description: 'Open source code generation model',
    maxTokens: 4096,
    endpoint: 'https://api-inference.huggingface.co/models/bigcode/starcoder',
    apiKeyRequired: false,
    features: ['coding', 'code-generation', 'multiple-languages', 'open-source']
  }
]

export const getModelsByType = (type: AIModel['type']): AIModel[] => {
  return AI_MODELS.filter(model => model.type === type)
}

export const getModelsByProvider = (provider: string): AIModel[] => {
  return AI_MODELS.filter(model => model.provider.toLowerCase() === provider.toLowerCase())
}

export const getModelsByCategory = (category: AIModel['category']): AIModel[] => {
  return AI_MODELS.filter(model => model.category === category)
}

export const getModelById = (id: string): AIModel | undefined => {
  return AI_MODELS.find(model => model.id === id)
}

export const getAvailableModels = (): AIModel[] => {
  // Filter models based on available API keys and local setup
  return AI_MODELS.filter(model => {
    if (model.apiKeyRequired) {
      // Check if required API key is available
      switch (model.provider) {
        case 'OpenAI':
          return !!process.env.OPENAI_API_KEY
        case 'Anthropic':
          return !!process.env.ANTHROPIC_API_KEY
        case 'Google':
          return !!process.env.GOOGLE_AI_API_KEY
        default:
          return true
      }
    }
    return true
  })
}