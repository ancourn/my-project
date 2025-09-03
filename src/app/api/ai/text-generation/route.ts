import { NextRequest, NextResponse } from 'next/server'
import { aiService } from '@/lib/ai-service'

export async function POST(request: NextRequest) {
  try {
    const { prompt, model, temperature = 0.7, maxTokens = 1000, systemPrompt } = await request.json()

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      )
    }

    const response = await aiService.generateText({
      prompt,
      config: {
        model,
        temperature,
        maxTokens,
      },
      systemPrompt
    })

    return NextResponse.json({
      success: true,
      response,
      model,
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error('Text generation error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: (error as Error).message || 'Internal server error' 
      },
      { status: 500 }
    )
  }
}