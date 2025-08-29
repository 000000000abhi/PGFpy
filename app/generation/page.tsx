"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Brain, Sparkles, CheckCircle, AlertCircle, ArrowRight } from "lucide-react"
import { usePortfolio } from "@/components/portfolio-context"
import { usePortfolioGenerator } from "@/hooks/use-portfolio-generator"

export default function GenerationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const templateId = searchParams.get("template")
  const { extractedData, setGeneratedPortfolio, updatePortfolioData } = usePortfolio()
  const { generationState, generatePortfolio } = usePortfolioGenerator()
  const [hasStarted, setHasStarted] = useState(false)

  useEffect(() => {
    // Start generation automatically when page loads
    if (templateId && extractedData && !hasStarted) {
      setHasStarted(true)
      startGeneration()
    }
  }, [templateId, extractedData, hasStarted])

  const startGeneration = async () => {
    if (!templateId || !extractedData) {
      router.push("/templates")
      return
    }

    try {
      const portfolio = await generatePortfolio(extractedData, templateId)

      // Store in context
      setGeneratedPortfolio(portfolio)
      updatePortfolioData({
        selectedTemplate: templateId,
        generatedPortfolio: portfolio,
      })

      // Auto-redirect to editor after successful generation
      setTimeout(() => {
        router.push("/editor")
      }, 2000)
    } catch (error) {
      console.error("Generation failed:", error)
    }
  }

  const getProgressMessage = () => {
    if (generationState.progress < 20) return "Initializing AI generation..."
    if (generationState.progress < 40) return "Analyzing your resume data..."
    if (generationState.progress < 60) return "Selecting optimal design elements..."
    if (generationState.progress < 80) return "Generating HTML structure..."
    if (generationState.progress < 95) return "Applying styles and finishing touches..."
    return "Portfolio generation complete!"
  }

  const getStageIcon = () => {
    if (generationState.error) return <AlertCircle className="w-12 h-12 text-red-500" />
    if (generationState.isComplete) return <CheckCircle className="w-12 h-12 text-green-500" />
    return <Brain className="w-12 h-12 text-brand-600 dark:text-brand-400 animate-pulse" />
  }

  if (!extractedData || !templateId) {
    return (
      <div className="min-h-screen bg-white dark:bg-navy-950 flex items-center justify-center">
        <Card className="border-0 shadow-lg bg-white dark:bg-navy-900 max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-amber-500" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Missing Data</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Please upload your resume and select a template first.
            </p>
            <Button onClick={() => router.push("/upload")} className="bg-brand-500 hover:bg-brand-600 text-white">
              Start Over
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-navy-950">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Generating Your Portfolio</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Our AI is creating a stunning portfolio based on your resume and selected template
            </p>
          </div>

          {/* Generation Card */}
          <Card className="border-0 shadow-2xl bg-white dark:bg-navy-900">
            <CardHeader className="text-center pb-6">
              <div className="flex justify-center mb-4">{getStageIcon()}</div>
              <CardTitle className="text-xl text-gray-900 dark:text-white">
                {generationState.error
                  ? "Generation Failed"
                  : generationState.isComplete
                    ? "Portfolio Ready!"
                    : "AI is Working..."}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Progress */}
              {!generationState.error && (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">Progress</span>
                      <span className="text-brand-600 dark:text-brand-400 font-medium">
                        {generationState.progress}%
                      </span>
                    </div>
                    <Progress value={generationState.progress} className="h-3" />
                  </div>

                  <div className="text-center">
                    <p className="text-gray-700 dark:text-gray-300 font-medium">{getProgressMessage()}</p>
                  </div>
                </>
              )}

              {/* Error State */}
              {generationState.error && (
                <div className="text-center space-y-4">
                  <p className="text-red-600 dark:text-red-400">{generationState.error}</p>
                  <div className="flex gap-4 justify-center">
                    <Button
                      variant="outline"
                      onClick={() => router.push("/templates")}
                      className="bg-transparent border-gray-200 dark:border-navy-700"
                    >
                      Choose Different Template
                    </Button>
                    <Button onClick={startGeneration} className="bg-brand-500 hover:bg-brand-600 text-white">
                      Try Again
                    </Button>
                  </div>
                </div>
              )}

              {/* Success State */}
              {generationState.isComplete && !generationState.error && (
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <Sparkles className="w-5 h-5" />
                    <span className="font-medium">Your portfolio has been generated successfully!</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">
                    Redirecting to the editor where you can customize your portfolio...
                  </p>
                  <Button onClick={() => router.push("/editor")} className="bg-brand-500 hover:bg-brand-600 text-white">
                    Go to Editor
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}

              {/* Generation Details */}
              {!generationState.error && (
                <div className="bg-gray-50 dark:bg-navy-800 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Generation Details:</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Template:</span>
                      <p className="font-medium text-gray-900 dark:text-white capitalize">
                        {templateId.replace("-", " ")}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Name:</span>
                      <p className="font-medium text-gray-900 dark:text-white">{extractedData.personalInfo.name}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Sections:</span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {[
                          extractedData.experience?.length > 0 && "Experience",
                          extractedData.education?.length > 0 && "Education",
                          extractedData.skills?.technical?.length > 0 && "Skills",
                          extractedData.projects?.length > 0 && "Projects",
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">AI Model:</span>
                      <p className="font-medium text-gray-900 dark:text-white">GPT-4</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tips */}
          {generationState.isGenerating && (
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                💡 This usually takes 30-60 seconds. The AI is creating custom HTML, CSS, and JavaScript for your
                portfolio.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
