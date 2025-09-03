"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Loader2, Send, Copy, Download, Sparkles, Filter } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { AI_MODELS, getModelsByType } from "@/lib/ai-registry"

type TextGenerationProps = Record<string, never>

export function TextGeneration({}: TextGenerationProps) {
  const [prompt, setPrompt] = useState("")
  const [model, setModel] = useState("gpt-4")
  const [temperature, setTemperature] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(1000)
  const [systemPrompt, setSystemPrompt] = useState("")
  const [response, setResponse] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [availableModels, setAvailableModels] = useState(getModelsByType('text'))
  const [filterProvider, setFilterProvider] = useState<string>("all")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const { toast } = useToast()

  useEffect(() => {
    // Filter models based on selected filters
    let filtered = getModelsByType('text')
    
    if (filterProvider !== "all") {
      filtered = filtered.filter(m => m.provider === filterProvider)
    }
    
    if (filterCategory !== "all") {
      filtered = filtered.filter(m => m.category === filterCategory)
    }
    
    setAvailableModels(filtered)
  }, [filterProvider, filterCategory])

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch("/api/ai/text-generation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          model,
          temperature,
          maxTokens,
          systemPrompt
        }),
      })

      const data = await res.json()
      if (data.success) {
        setResponse(data.response)
      } else {
        throw new Error(data.error || "Generation failed")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate text",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(response)
    toast({
      title: "Success",
      description: "Text copied to clipboard",
    })
  }

  const handleDownload = () => {
    const blob = new Blob([response], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "generated-text.txt"
    a.click()
    URL.revokeObjectURL(url)
  }

  const getUniqueProviders = () => {
    const providers = [...new Set(getModelsByType('text').map(m => m.provider))]
    return providers
  }

  const getUniqueCategories = () => {
    const categories = [...new Set(getModelsByType('text').map(m => m.category))]
    return categories
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Input Section */}
      <Card className="xl:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Text Generation
          </CardTitle>
          <CardDescription>
            Generate text using 30+ AI models
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filters</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium mb-1 block">Provider</label>
                <Select value={filterProvider} onValueChange={setFilterProvider}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Providers</SelectItem>
                    {getUniqueProviders().map(provider => (
                      <SelectItem key={provider} value={provider}>
                        {provider}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-xs font-medium mb-1 block">Category</label>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {getUniqueCategories().map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Model ({availableModels.length} available)</label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger>
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent className="max-h-80">
                {availableModels.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{m.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {m.provider}
                        </Badge>
                        <Badge variant={m.category === 'proprietary' ? 'default' : 'secondary'} className="text-xs">
                          {m.category}
                        </Badge>
                      </div>
                      <div className="text-xs text-slate-500">
                        {m.description}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Temperature: {temperature}</label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>Conservative</span>
              <span>Creative</span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Max Tokens: {maxTokens}</label>
            <input
              type="range"
              min="100"
              max="8000"
              step="100"
              value={maxTokens}
              onChange={(e) => setMaxTokens(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">System Prompt (Optional)</label>
            <Textarea
              placeholder="You are a helpful assistant..."
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Prompt</label>
            <Textarea
              placeholder="Enter your prompt here..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[120px]"
            />
          </div>

          <Button 
            onClick={handleGenerate} 
            disabled={isLoading || !prompt.trim()}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Generate
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Output Section */}
      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle>Generated Text</CardTitle>
          <CardDescription>
            {response ? "AI-generated response" : "Response will appear here"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {response ? (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg min-h-[400px] max-h-[600px] overflow-y-auto">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{response}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[400px] text-slate-400">
              <div className="text-center">
                <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Generated text will appear here</p>
                <p className="text-sm mt-2">Select a model and enter a prompt to get started</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}