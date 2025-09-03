"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Loader2, Download, Image as ImageIcon, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type ImageGenerationProps = Record<string, never>

export function ImageGeneration({}: ImageGenerationProps) {
  const [prompt, setPrompt] = useState("")
  const [model, setModel] = useState("dall-e-3")
  const [size, setSize] = useState("1024x1024")
  const [style, setStyle] = useState("vivid")
  const [images, setImages] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const models = [
    { id: "dall-e-3", name: "DALL-E 3", provider: "OpenAI" },
    { id: "stable-diffusion", name: "Stable Diffusion", provider: "Stability AI" },
    { id: "midjourney", name: "Midjourney", provider: "Midjourney" },
    { id: "firefly", name: "Firefly", provider: "Adobe" },
  ]

  const sizes = [
    { id: "512x512", name: "512×512" },
    { id: "1024x1024", name: "1024×1024" },
    { id: "1024x1792", name: "1024×1792" },
    { id: "1792x1024", name: "1792×1024" },
  ]

  const styles = [
    { id: "vivid", name: "Vivid" },
    { id: "natural", name: "Natural" },
    { id: "realistic", name: "Realistic" },
    { id: "artistic", name: "Artistic" },
  ]

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
      const res = await fetch("/api/ai/image-generation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          model,
          size,
          style,
        }),
      })

      const data = await res.json()
      if (data.success) {
        setImages(data.images)
      } else {
        throw new Error(data.error || "Image generation failed")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate image",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = (imageData: string, index: number) => {
    const link = document.createElement("a")
    link.href = `data:image/png;base64,${imageData}`
    link.download = `generated-image-${index + 1}.png`
    link.click()
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Image Generation
          </CardTitle>
          <CardDescription>
            Create stunning images from text descriptions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Model</label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {models.map((m) => (
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

          <div>
            <label className="text-sm font-medium mb-2 block">Size</label>
            <Select value={size} onValueChange={setSize}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sizes.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Style</label>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {styles.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Prompt</label>
            <Input
              placeholder="A beautiful landscape with mountains and a lake..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
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
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Image
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Output Section */}
      <Card>
        <CardHeader>
          <CardTitle>Generated Images</CardTitle>
          <CardDescription>
            AI-generated images will appear here
          </CardDescription>
        </CardHeader>
        <CardContent>
          {images.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="space-y-2">
                    <div className="relative group">
                      <img
                        src={`data:image/png;base64,${image}`}
                        alt={`Generated image ${index + 1}`}
                        className="w-full h-auto rounded-lg border"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity rounded-lg flex items-center justify-center">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleDownload(image, index)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-slate-400">
              <div className="text-center">
                <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Generated images will appear here</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}