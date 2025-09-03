"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Loader2, Search, ExternalLink, Clock, Globe } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type WebSearchProps = Record<string, never>

interface SearchResult {
  url: string
  name: string
  snippet: string
  host_name: string
  rank: number
  date: string
  favicon: string
}

export function WebSearch({}: WebSearchProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSearch = async () => {
    if (!query.trim()) {
      toast({
        title: "Error",
        description: "Please enter a search query",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch("/api/ai/web-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      })

      const data = await res.json()
      if (data.success) {
        setResults(data.results)
      } else {
        throw new Error(data.error || "Search failed")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to perform search",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString()
    } catch {
      return dateString
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Search Input */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Web Search
          </CardTitle>
          <CardDescription>
            Search the web with AI-powered results
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Search Query</label>
            <Input
              placeholder="What would you like to search for?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>

          <Button 
            onClick={handleSearch} 
            disabled={isLoading || !query.trim()}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Search
              </>
            )}
          </Button>

          <div className="text-xs text-slate-500 space-y-1">
            <p>• Powered by AI search technology</p>
            <p>• Get relevant, up-to-date results</p>
            <p>• Fast and accurate information</p>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Search Results</CardTitle>
          <CardDescription>
            {results.length > 0 
              ? `Found ${results.length} results for "${query}"`
              : "Enter a search query to see results"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {results.length > 0 ? (
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {results.map((result, index) => (
                <div key={index} className="border rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {result.favicon && (
                          <img 
                            src={result.favicon} 
                            alt="" 
                            className="w-4 h-4"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        )}
                        <Badge variant="outline" className="text-xs">
                          #{result.rank}
                        </Badge>
                        <span className="text-xs text-slate-500">
                          {result.host_name}
                        </span>
                      </div>
                      
                      <h3 className="font-medium text-sm mb-1 line-clamp-2">
                        {result.name}
                      </h3>
                      
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-2 line-clamp-3">
                        {result.snippet}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(result.date)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          {result.host_name}
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(result.url, '_blank')}
                      className="flex-shrink-0"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-slate-400">
              <div className="text-center">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Enter a search query to see results</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}