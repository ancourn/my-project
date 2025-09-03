import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile, unlink } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'

interface AnalysisResult {
  summary: string
  keyPoints: string[]
  sentiment: string
  entities: Array<{ text: string; type: string; confidence: number }>
  wordCount: number
  readingTime: number
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const analysisType = formData.get('analysisType') as string

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'File is required' },
        { status: 400 }
      )
    }

    // Convert file to buffer and save temporarily
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Create temporary file
    const tempDir = tmpdir()
    const tempFilePath = join(tempDir, `upload-${Date.now()}-${file.name}`)
    await writeFile(tempFilePath, buffer)

    // Extract text from file (simplified for demo)
    let textContent = ''
    try {
      if (file.name.endsWith('.txt')) {
        textContent = buffer.toString('utf-8')
      } else if (file.name.endsWith('.pdf') || file.name.endsWith('.doc') || file.name.endsWith('.docx')) {
        // For demo purposes, we'll use a placeholder text extraction
        // In a real app, you'd use libraries like pdf-parse, mammoth, etc.
        textContent = `Document content from ${file.name}. This is a placeholder for extracted text. 
        The document appears to contain various information that would be analyzed by the AI system.
        For demonstration purposes, this text represents the extracted content from the uploaded file.`
      }
    } catch (error) {
      await unlink(tempFilePath) // Clean up temp file
      return NextResponse.json(
        { success: false, error: 'Failed to extract text from file' },
        { status: 500 }
      )
    }

    // Clean up temp file
    await unlink(tempFilePath)

    if (!textContent) {
      return NextResponse.json(
        { success: false, error: 'No content could be extracted from file' },
        { status: 400 }
      )
    }

    // Analyze content using Z-AI SDK
    let result: AnalysisResult

    try {
      const ZAI = await import('z-ai-web-dev-sdk')
      const zai = await ZAI.create()

      // Generate summary
      const summaryPrompt = `Please provide a concise summary of the following text:\n\n${textContent.substring(0, 2000)}`
      const summaryCompletion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that provides concise summaries.'
          },
          {
            role: 'user',
            content: summaryPrompt
          }
        ],
        max_tokens: 300,
      })

      const summary = summaryCompletion.choices[0]?.message?.content || 'No summary available.'

      // Extract key points
      const keyPointsPrompt = `Extract 3-5 key points from the following text:\n\n${textContent.substring(0, 2000)}`
      const keyPointsCompletion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that extracts key points from text. Return each key point on a new line.'
          },
          {
            role: 'user',
            content: keyPointsPrompt
          }
        ],
        max_tokens: 200,
      })

      const keyPointsText = keyPointsCompletion.choices[0]?.message?.content || ''
      const keyPoints = keyPointsText.split('\n').filter(point => point.trim()).slice(0, 5)

      // Analyze sentiment
      const sentimentPrompt = `Analyze the sentiment of the following text and respond with only one word: positive, negative, or neutral.\n\n${textContent.substring(0, 1000)}`
      const sentimentCompletion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a sentiment analysis assistant.'
          },
          {
            role: 'user',
            content: sentimentPrompt
          }
        ],
        max_tokens: 10,
      })

      const sentiment = sentimentCompletion.choices[0]?.message?.content?.toLowerCase().trim() || 'neutral'

      // Calculate basic statistics
      const words = textContent.split(/\s+/).filter(word => word.length > 0)
      const wordCount = words.length
      const readingTime = Math.ceil(wordCount / 200) // Average reading speed

      result = {
        summary,
        keyPoints,
        sentiment,
        entities: [
          { text: 'Example Entity', type: 'PERSON', confidence: 0.95 },
          { text: 'Example Organization', type: 'ORGANIZATION', confidence: 0.88 }
        ], // Placeholder entities
        wordCount,
        readingTime
      }

    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'AI analysis failed: ' + (error as Error).message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      result,
      fileName: file.name,
      fileSize: file.size,
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error('Document analysis error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: (error as Error).message || 'Internal server error' 
      },
      { status: 500 }
    )
  }
}