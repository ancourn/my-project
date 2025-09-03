"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Brain, Image as ImageIcon, Search, MessageSquare, FileText, Settings, Sparkles, BookOpen, GitCompare, Database } from "lucide-react"
import { TextGeneration } from "@/components/ai/text-generation"
import { ImageGeneration } from "@/components/ai/image-generation"
import { WebSearch } from "@/components/ai/web-search"
import { ChatInterface } from "@/components/ai/chat-interface"
import { DocumentAnalysis } from "@/components/ai/document-analysis"
import { RAGInterface } from "@/components/ai/rag-interface"
import { ModelComparison } from "@/components/ai/model-comparison"

export default function Home() {
  const [activeTab, setActiveTab] = useState("text")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">BaseAI</h1>
              <p className="text-slate-600 dark:text-slate-400">Advanced AI Platform - 30+ Models & Services</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-6">
            <Badge variant="secondary" className="text-xs">
              <Sparkles className="w-3 h-3 mr-1" />
              30+ AI Models
            </Badge>
            <Badge variant="secondary" className="text-xs">
              <Database className="w-3 h-3 mr-1" />
              Vector DB
            </Badge>
            <Badge variant="secondary" className="text-xs">
              <BookOpen className="w-3 h-3 mr-1" />
              RAG System
            </Badge>
            <Badge variant="secondary" className="text-xs">
              <GitCompare className="w-3 h-3 mr-1" />
              Model Compare
            </Badge>
            <Badge variant="secondary" className="text-xs">
              <MessageSquare className="w-3 h-3 mr-1" />
              Real-time Chat
            </Badge>
            <Badge variant="secondary" className="text-xs">
              <Search className="w-3 h-3 mr-1" />
              Web Search
            </Badge>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="text" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Text</span>
            </TabsTrigger>
            <TabsTrigger value="image" className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Image</span>
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Search</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline">Chat</span>
            </TabsTrigger>
            <TabsTrigger value="docs" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Docs</span>
            </TabsTrigger>
            <TabsTrigger value="rag" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">RAG</span>
            </TabsTrigger>
            <TabsTrigger value="compare" className="flex items-center gap-2">
              <GitCompare className="w-4 h-4" />
              <span className="hidden sm:inline">Compare</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-6">
            <TextGeneration />
          </TabsContent>

          <TabsContent value="image" className="space-y-6">
            <ImageGeneration />
          </TabsContent>

          <TabsContent value="search" className="space-y-6">
            <WebSearch />
          </TabsContent>

          <TabsContent value="chat" className="space-y-6">
            <ChatInterface />
          </TabsContent>

          <TabsContent value="docs" className="space-y-6">
            <DocumentAnalysis />
          </TabsContent>

          <TabsContent value="rag" className="space-y-6">
            <RAGInterface />
          </TabsContent>

          <TabsContent value="compare" className="space-y-6">
            <ModelComparison />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}