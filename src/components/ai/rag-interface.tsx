"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Loader2, Search, BookOpen, FileText, Plus, Trash2, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { AI_MODELS, getModelsByType } from "@/lib/ai-registry"

type RAGInterfaceProps = Record<string, never>

interface Document {
  id: string
  content: string
  metadata?: any
}

export function RAGInterface({}: RAGInterfaceProps) {
  const [query, setQuery] = useState("")
  const [model, setModel] = useState("gpt-4")
  const [documents, setDocuments] = useState<Document[]>([])
  const [newDocument, setNewDocument] = useState("")
  const [response, setResponse] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()

  const textModels = getModelsByType('text')

  const handleAddDocument = () => {
    if (!newDocument.trim()) return

    const doc: Document = {
      id: Date.now().toString(),
      content: newDocument.trim(),
      metadata: {
        addedAt: new Date().toISOString(),
        source: 'manual'
      }
    }

    setDocuments(prev => [...prev, doc])
    setNewDocument("")
    toast({
      title: "Document Added",
      description: "Document has been added to the knowledge base",
    })
  }

  const handleRemoveDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id))
    toast({
      title: "Document Removed",
      description: "Document has been removed from the knowledge base",
    })
  }

  const handleQuery = async () => {
    if (!query.trim()) {
      toast({
        title: "Error",
        description: "Please enter a query",
        variant: "destructive",
      })
      return
    }

    if (documents.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one document to the knowledge base",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch("/api/ai/rag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          documents: documents.map(doc => doc.content),
          model
        }),
      })

      const data = await res.json()
      if (data.success) {
        setResponse(data.response)
      } else {
        throw new Error(data.error || "RAG query failed")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process RAG query",
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
      description: "Response copied to clipboard",
    })
  }

  const handleClearAll = () => {
    setDocuments([])
    setResponse("")
    toast({
      title: "Cleared",
      description: "All documents and response have been cleared",
    })
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Knowledge Base Section */}
      <Card className="xl:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Knowledge Base
          </CardTitle>
          <CardDescription>
            Add documents to create a RAG system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              Documents ({documents.length})
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              disabled={documents.length === 0}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex gap-2">
              <Textarea
                placeholder="Add document content here..."
                value={newDocument}
                onChange={(e) => setNewDocument(e.target.value)}
                className="min-h-[80px] text-sm"
              />
              <Button
                size="sm"
                onClick={handleAddDocument}
                disabled={!newDocument.trim()}
                className="self-start"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {documents.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No documents added yet</p>
                <p className="text-xs">Add documents to create a knowledge base</p>
              </div>
            ) : (
              documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm line-clamp-3">
                        {doc.content}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Added {new Date(doc.metadata?.addedAt).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveDocument(doc.id)}
                      className="flex-shrink-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Model</label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {textModels.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    <div className="flex items-center gap-2">
                      <span>{m.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {m.provider}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Query and Response Section */}
      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            RAG Query
          </CardTitle>
          <CardDescription>
            Query your knowledge base with AI-powered retrieval
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="text-sm font-medium mb-2 block">Query</label>
            <div className="flex gap-2">
              <Input
                placeholder="What would you like to know about your documents?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleQuery()}
              />
              <Button
                onClick={handleQuery}
                disabled={isLoading || !query.trim() || documents.length === 0}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">AI Response</h4>
              {response && (
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  Copy
                </Button>
              )}
            </div>
            
            {response ? (
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg min-h-[300px] max-h-[400px] overflow-y-auto">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {response}
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                <div className="text-center">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="mb-2">Ready to query your knowledge base</p>
                  <p className="text-sm">
                    {documents.length === 0 
                      ? "Add documents first, then enter a query"
                      : "Enter a query to get AI-powered answers from your documents"
                    }
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              How RAG Works
            </h5>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Documents are converted to embeddings and stored in vector database</li>
              <li>• Your query is used to find relevant documents</li>
              <li>• AI generates response using retrieved context</li>
              <li>• Results are more accurate and grounded in your data</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}