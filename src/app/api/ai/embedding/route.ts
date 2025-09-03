import { NextRequest, NextResponse } from 'next/server'
import { aiService } from '@/lib/ai-service'

export async function POST(request: NextRequest) {
  try {
    const { text, model = 'text-embedding-ada-002' } = await request.json()

    if (!text) {
      return NextResponse.json(
        { success: false, error: 'Text is required' },
        { status: 400 }
      )
    }

    const embedding = await aiService.generateEmbedding({
      text,
      model
    })

    return NextResponse.json({
      success: true,
      embedding,
      model,
      dimensions: embedding.length,
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error('Embedding generation error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: (error as Error).message || 'Internal server error' 
      },
      { status: 500 }
    )
  }
}