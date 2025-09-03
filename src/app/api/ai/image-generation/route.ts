import { NextRequest, NextResponse } from 'next/server'
import { aiService } from '@/lib/ai-service'

export async function POST(request: NextRequest) {
  try {
    const { prompt, model = 'dall-e-3', size = '1024x1024', style = 'vivid' } = await request.json()

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      )
    }

    const images = await aiService.generateImage({
      prompt,
      model,
      size,
      style
    })

    return NextResponse.json({
      success: true,
      images,
      model,
      prompt,
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error('Image generation error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: (error as Error).message || 'Internal server error' 
      },
      { status: 500 }
    )
  }
}