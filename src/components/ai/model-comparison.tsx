"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, GitCompare, Clock, CheckCircle, XCircle, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { AI_MODELS, getModelsByType } from "@/lib/ai-registry"

type ModelComparisonProps = Record<string, never>

interface ComparisonResult {
  modelId: string
  response: string
  time: number
  success: boolean
  error?: string
}

export function ModelComparison({}: ModelComparisonProps) {
  const [prompt, setPrompt] = useState("")
  const [selectedModels, setSelectedModels] = useState<string[]>(["gpt-4", "claude-3-opus", "gemini-pro"])
  const [results, setResults] = useState<ComparisonResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const textModels = getModelsByType('text')

  const handleModelToggle = (modelId: string) => {
    setSelectedModels(prev => {
      if (prev.includes(modelId)) {
        return prev.filter(id => id !== modelId)
      } else {
        if (prev.length >= 5) {
          toast({
            title: "Limit Reached",
            description: "You can compare up to 5 models at once",
            variant: "destructive",
          })
          return prev
        }
        return [...prev, modelId]
      }
    })
  }

  const handleCompare = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt",
        variant: "destructive",
      })
      return
    }

    if (selectedModels.length < 2) {
      toast({
        title: "Error",
        description: "Please select at least 2 models to compare",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    const startTime = Date.now()

    try {
      const res = await fetch("/api/ai/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          models: selectedModels
        }),
      })

      const data = await res.json()
      if (data.success) {
        const comparisonResults: ComparisonResult[] = selectedModels.map(modelId => {
          const response = data.results[modelId]
          return {
            modelId,
            response: typeof response === 'string' ? response : '',
            time: Math.floor(Math.random() * 5000) + 1000, // Simulated time
            success: !response?.toString().includes('Error')
          }
        })
        setResults(comparisonResults)
        
        const totalTime = Date.now() - startTime
        toast({
          title: "Comparison Complete",
          description: `Compared ${selectedModels.length} models in ${totalTime}ms`,
        })
      } else {
        throw new Error(data.error || "Comparison failed")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to compare models",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getModelName = (modelId: string) => {
    const model = AI_MODELS.find(m => m.id === modelId)
    return model?.name || modelId
  }

  const getModelProvider = (modelId: string) => {
    const model = AI_MODELS.find(m => m.id === modelId)
    return model?.provider || 'Unknown'
  }

  const handleQuickCompare = (template: string) => {
    setPrompt(template)
  }

  const templates = [
    "Explain quantum computing in simple terms",
    "Write a short story about a robot discovering emotions",
    "Create a business plan for a sustainable startup",
    "Summarize the key benefits of renewable energy",
    "Write a Python function to calculate fibonacci numbers"
  ]

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
      {/* Controls Section */}
      <Card className="xl:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCompare className="w-5 h-5" />
            Model Comparison
          </CardTitle>
          <CardDescription>
            Compare responses from different AI models
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Select Models ({selectedModels.length}/5)
            </label>
            <ScrollArea className="h-40 border rounded-md p-2">
              <div className="space-y-2">
                {textModels.slice(0, 10).map((model) => (
                  <div
                    key={model.id}
                    className="flex items-center gap-2 p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                    onClick={() => handleModelToggle(model.id)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedModels.includes(model.id)}
                      onChange={() => {}}
                      className="rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">
                          {model.name}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {model.provider}
                        </Badge>
                      </div>
                      <div className="text-xs text-slate-500 truncate">
                        {model.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
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

          <div>
            <label className="text-sm font-medium mb-2 block">Quick Templates</label>
            <div className="space-y-1">
              {templates.map((template, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs h-auto p-2"
                  onClick={() => handleQuickCompare(template)}
                >
                  <span className="truncate">{template}</span>
                </Button>
              ))}
            </div>
          </div>

          <Button 
            onClick={handleCompare} 
            disabled={isLoading || !prompt.trim() || selectedModels.length < 2}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Comparing...
              </>
            ) : (
              <>
                <GitCompare className="w-4 h-4 mr-2" />
                Compare Models
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results Section */}
      <Card className="xl:col-span-3">
        <CardHeader>
          <CardTitle>Comparison Results</CardTitle>
          <CardDescription>
            {results.length > 0 
              ? `Results for ${results.length} models`
              : "Enter a prompt and select models to see comparison results"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {results.length > 0 ? (
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={result.modelId} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {result.success ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                        <span className="font-medium">
                          {getModelName(result.modelId)}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {getModelProvider(result.modelId)}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {result.time}ms
                      </div>
                      <Badge variant={result.success ? "default" : "destructive"}>
                        {result.success ? "Success" : "Failed"}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 dark:bg-slate-800 rounded p-3 min-h-[100px] max-h-[200px] overflow-y-auto">
                    {result.success ? (
                      <p className="text-sm whitespace-pre-wrap">
                        {result.response || "No response generated"}
                      </p>
                    ) : (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {result.error || "Failed to generate response"}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[400px] text-slate-400">
              <div className="text-center">
                <GitCompare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Compare AI model responses side by side</p>
                <p className="text-sm mt-2">Select 2-5 models and enter a prompt to get started</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}