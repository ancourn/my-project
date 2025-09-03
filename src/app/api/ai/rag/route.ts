import { NextRequest, NextResponse } from 'next/server'
import { aiService } from '@/lib/ai-service'

export async function POST(request: NextRequest) {
  try {
    const { query, documents, model = 'gpt-4' } = await request.json()

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Query is required' },
        { status: 400 }
      )
    }

    if (!documents || !Array.isArray(documents) || documents.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Documents are required and must be an array' },
        { status: 400 }
      )
    }

    const response = await aiService.ragQuery({
      query,
      documents,
      model
    })

    return NextResponse.json({
      success: true,
      response,
      query,
      documentsCount: documents.length,
      model,
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error('RAG query error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: (error as Error).message || 'Internal server error' 
      },
      { status: 500 }
    )
  }
}