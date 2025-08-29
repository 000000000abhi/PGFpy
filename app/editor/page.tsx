"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, Code, Download, Save, RefreshCw, Settings, ArrowLeft, ExternalLink, Copy, Check } from "lucide-react"
import { usePortfolio } from "@/components/portfolio-context"
import { CodeEditor } from "@/components/code-editor"
import { PortfolioPreview } from "@/components/portfolio-preview"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function EditorPage() {
  const { extractedData, generatedPortfolio, portfolioData } = usePortfolio()
  const [activeTab, setActiveTab] = useState("preview")
  const [htmlCode, setHtmlCode] = useState("")
  const [cssCode, setCssCode] = useState("")
  const [jsCode, setJsCode] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if we have generated portfolio data
    const portfolio = generatedPortfolio || portfolioData?.generatedPortfolio

    if (!portfolio) {
      // If no portfolio, redirect to templates
      router.push("/templates")
      return
    }

    // Load the generated code
    setHtmlCode(portfolio.html)
    setCssCode(portfolio.css || "")
    setJsCode(portfolio.js || "")
  }, [generatedPortfolio, portfolioData, router])

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate save operation
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
  }

  const handleCopyCode = async () => {
    const fullCode = `${htmlCode}\n\n/* CSS */\n${cssCode}\n\n/* JavaScript */\n${jsCode}`
    await navigator.clipboard.writeText(fullCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([htmlCode], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${extractedData?.personalInfo?.name || "portfolio"}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleDeploy = () => {
    // Placeholder for deployment functionality
    alert("Deployment feature coming soon!")
  }

  if (!generatedPortfolio && !portfolioData?.generatedPortfolio) {
    return (
      <div className="min-h-screen bg-white dark:bg-navy-950 flex items-center justify-center">
        <Card className="border-0 shadow-lg bg-white dark:bg-navy-900">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">No Portfolio Generated</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Please generate a portfolio first by selecting a template.
            </p>
            <Button onClick={() => router.push("/templates")} className="bg-brand-500 hover:bg-brand-600 text-white">
              Go to Templates
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-navy-950">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-900">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/templates")}
                className="hover:bg-gray-100 dark:hover:bg-navy-800"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Templates
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Portfolio Editor</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {extractedData?.personalInfo?.name || "Your Portfolio"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyCode}
                className="bg-transparent border-gray-200 dark:border-navy-700"
              >
                {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                {copied ? "Copied!" : "Copy Code"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="bg-transparent border-gray-200 dark:border-navy-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeploy}
                className="bg-transparent border-gray-200 dark:border-navy-700"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Deploy
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
                className="bg-brand-500 hover:bg-brand-600 text-white"
              >
                {isSaving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Portfolio Info */}
        <div className="mb-6">
          <Card className="border-0 shadow-lg bg-white dark:bg-navy-900">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl text-gray-900 dark:text-white">
                    {extractedData?.personalInfo?.name}'s Portfolio
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300">
                    Template: {portfolioData?.selectedTemplate || "Custom"}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                    Generated
                  </Badge>
                  <Badge variant="outline" className="border-gray-200 dark:border-navy-700">
                    Ready to Edit
                  </Badge>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Editor Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gray-100 dark:bg-navy-800">
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="html" className="flex items-center gap-2">
              <Code className="w-4 h-4" />
              HTML
            </TabsTrigger>
            <TabsTrigger value="css" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              CSS
            </TabsTrigger>
            <TabsTrigger value="js" className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              JavaScript
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="space-y-4">
            <Card className="border-0 shadow-lg bg-white dark:bg-navy-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Eye className="w-5 h-5" />
                  Live Preview
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  See how your portfolio looks in real-time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PortfolioPreview htmlCode={htmlCode} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="html" className="space-y-4">
            <Card className="border-0 shadow-lg bg-white dark:bg-navy-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Code className="w-5 h-5" />
                  HTML Code
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Edit the HTML structure of your portfolio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CodeEditor language="html" value={htmlCode} onChange={setHtmlCode} height="600px" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="css" className="space-y-4">
            <Card className="border-0 shadow-lg bg-white dark:bg-navy-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Settings className="w-5 h-5" />
                  CSS Styles
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Customize the styling and appearance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CodeEditor language="css" value={cssCode} onChange={setCssCode} height="600px" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="js" className="space-y-4">
            <Card className="border-0 shadow-lg bg-white dark:bg-navy-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <RefreshCw className="w-5 h-5" />
                  JavaScript
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Add interactive functionality
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CodeEditor language="javascript" value={jsCode} onChange={setJsCode} height="600px" />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Help Section */}
        <div className="mt-8">
          <Alert>
            <Settings className="h-4 w-4" />
            <AlertDescription>
              <strong>Pro Tip:</strong> You can edit the code in real-time and see changes in the preview. Use the save
              button to store your changes, or download the HTML file to use elsewhere.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  )
}
