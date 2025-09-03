"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Loader2, Upload, FileText, Download, Eye, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type DocumentAnalysisProps = Record<string, never>

interface AnalysisResult {
  summary: string
  keyPoints: string[]
  sentiment: string
  entities: Array<{ text: string; type: string; confidence: number }>
  wordCount: number
  readingTime: number
}

export function DocumentAnalysis({}: DocumentAnalysisProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [analysisType, setAnalysisType] = useState("comprehensive")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const analysisTypes = [
    { id: "comprehensive", name: "Comprehensive Analysis", description: "Full document analysis with all features" },
    { id: "summary", name: "Summary Only", description: "Generate a concise summary" },
    { id: "sentiment", name: "Sentiment Analysis", description: "Analyze tone and sentiment" },
    { id: "entities", name: "Entity Extraction", description: "Extract named entities" },
  ]

  const supportedFileTypes = [
    ".txt", ".pdf", ".doc", ".docx", ".rtf"
  ]

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const extension = '.' + file.name.split('.').pop()?.toLowerCase()
      if (supportedFileTypes.includes(extension)) {
        setSelectedFile(file)
        setAnalysisResult(null)
      } else {
        toast({
          title: "Error",
          description: `Unsupported file type. Supported types: ${supportedFileTypes.join(', ')}`,
          variant: "destructive",
        })
      }
    }
  }

  const handleAnalyze = async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a file first",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzing(true)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('analysisType', analysisType)

      const res = await fetch("/api/ai/document-analysis", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()
      if (data.success) {
        setAnalysisResult(data.result)
      } else {
        throw new Error(data.error || "Analysis failed")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to analyze document",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive': return 'bg-green-100 text-green-800'
      case 'negative': return 'bg-red-100 text-red-800'
      case 'neutral': return 'bg-gray-100 text-gray-800'
      default: return 'bg-blue-100 text-blue-800'
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Document Analysis
          </CardTitle>
          <CardDescription>
            Upload and analyze documents with AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Analysis Type</label>
            <Select value={analysisType} onValueChange={setAnalysisType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {analysisTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    <div>
                      <div className="font-medium">{type.name}</div>
                      <div className="text-xs text-slate-500">{type.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Upload Document</label>
            <div
              className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center cursor-pointer hover:border-slate-400 dark:hover:border-slate-500 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept={supportedFileTypes.join(',')}
                onChange={handleFileSelect}
              />
              <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Supported: {supportedFileTypes.join(', ')}
              </p>
            </div>
          </div>

          {selectedFile && (
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{selectedFile.name}</p>
                  <p className="text-xs text-slate-500">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedFile(null)
                    setAnalysisResult(null)
                    if (fileInputRef.current) {
                      fileInputRef.current.value = ''
                    }
                  }}
                >
                  Remove
                </Button>
              </div>
            </div>
          )}

          <Button 
            onClick={handleAnalyze}
            disabled={!selectedFile || isAnalyzing}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Analyze Document
              </>
            )}
          </Button>

          <div className="text-xs text-slate-500 space-y-1">
            <p>• Extract key insights and summaries</p>
            <p>• Analyze sentiment and tone</p>
            <p>• Identify named entities</p>
            <p>• Calculate reading time and complexity</p>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis Results</CardTitle>
          <CardDescription>
            {analysisResult 
              ? "Document analysis complete"
              : "Upload a document to see analysis results"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {analysisResult ? (
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {/* Summary */}
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Summary
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-3 rounded">
                  {analysisResult.summary}
                </p>
              </div>

              <Separator />

              {/* Key Points */}
              <div>
                <h4 className="font-medium mb-2">Key Points</h4>
                <ul className="space-y-1">
                  {analysisResult.keyPoints.map((point, index) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              <Separator />

              {/* Sentiment */}
              <div>
                <h4 className="font-medium mb-2">Sentiment Analysis</h4>
                <Badge className={getSentimentColor(analysisResult.sentiment)}>
                  {analysisResult.sentiment}
                </Badge>
              </div>

              <Separator />

              {/* Entities */}
              {analysisResult.entities.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Named Entities</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.entities.map((entity, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {entity.text} <span className="ml-1 opacity-60">({entity.type})</span>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Stats */}
              <div>
                <h4 className="font-medium mb-2">Document Statistics</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">Word Count:</span>
                    <span className="ml-2 font-medium">{analysisResult.wordCount}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Reading Time:</span>
                    <span className="ml-2 font-medium">{analysisResult.readingTime} min</span>
                  </div>
                </div>
              </div>

              <Button variant="outline" size="sm" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Download Report
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-slate-400">
              <div className="text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Upload a document to see analysis results</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}