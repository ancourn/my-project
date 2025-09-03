import { NextRequest, NextResponse } from 'next/server'
import { aiService } from '@/lib/ai-service'

export async function POST(request: NextRequest) {
  try {
    const { query, numResults = 10 } = await request.json()

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Query is required' },
        { status: 400 }
      )
    }

    const results = await aiService.webSearch(query, numResults)

    return NextResponse.json({
      success: true,
      results,
      query,
      count: Array.isArray(results) ? results.length : 0,
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error('Web search error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: (error as Error).message || 'Internal server error' 
      },
      { status: 500 }
    )
  }
}