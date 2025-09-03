import { NextRequest, NextResponse } from 'next/server'
import { aiService } from '@/lib/ai-service'

export async function POST(request: NextRequest) {
  try {
    const { prompt, models } = await request.json()

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      )
    }

    if (!models || !Array.isArray(models) || models.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Models are required and must be an array' },
        { status: 400 }
      )
    }

    const results = await aiService.compareModels(prompt, models)

    return NextResponse.json({
      success: true,
      results,
      prompt,
      models,
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error('Model comparison error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: (error as Error).message || 'Internal server error' 
      },
      { status: 500 }
    )
  }
}