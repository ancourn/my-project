import { NextRequest, NextResponse } from 'next/server'
import { aiService } from '@/lib/ai-service'
import { AI_MODELS, getModelsByType, getModelsByProvider, getModelsByCategory } from '@/lib/ai-registry'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const provider = searchParams.get('provider')
    const category = searchParams.get('category')

    let models = AI_MODELS

    if (type) {
      models = getModelsByType(type as any)
    } else if (provider) {
      models = getModelsByProvider(provider)
    } else if (category) {
      models = getModelsByCategory(category as any)
    } else {
      models = aiService.getAvailableModels()
    }

    return NextResponse.json({
      success: true,
      models,
      count: models.length,
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error('Models API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: (error as Error).message || 'Internal server error' 
      },
      { status: 500 }
    )
  }
}