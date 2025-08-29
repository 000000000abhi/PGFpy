"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Brain, Sparkles, CheckCircle, AlertCircle, ArrowRight } from "lucide-react"
import { usePortfolio } from "@/components/portfolio-context"

export default function GenerationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const templateId = searchParams.get("template")
  const { extractedData, setGeneratedPortfolio } = usePortfolio()
  const [progress, setProgress] = useState(10);
  const [message, setMessage] = useState("Initializing generation...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!extractedData || !templateId) {
      router.push("/upload");
      return;
    }

    const generate = async () => {
      try {
        setMessage("Generating portfolio code...");
        setProgress(50);

        const response = await fetch("/api/generate-portfolio-code", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ structuredData: extractedData, templateId }),
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || "Failed to generate portfolio code.");
        }
        
        const result = await response.json();

        if (result.success) {
            setGeneratedPortfolio(result.portfolio);
            setMessage("Portfolio generated successfully!");
            setProgress(100);
            
            // Redirect to the editor page after a short delay
            setTimeout(() => {
                router.push("/editor");
            }, 1500);
        } else {
             throw new Error(result.error || "An unknown error occurred during code generation.");
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "An unknown error occurred.");
      }
    };

    generate();
  }, [extractedData, templateId, router, setGeneratedPortfolio]);

  return (
    <div className="min-h-screen bg-white dark:bg-navy-950 flex items-center justify-center">
      <Card className="border-0 shadow-lg bg-white dark:bg-navy-900 w-full max-w-lg">
        <CardHeader className="text-center">
            {error ? <AlertCircle className="w-12 h-12 mx-auto text-red-500" /> : <Sparkles className="w-12 h-12 mx-auto text-brand-500 animate-pulse" />}
          <CardTitle className="text-xl font-bold text-gray-900 dark:text-white mt-4">
            {error ? "Generation Failed" : (progress === 100 ? "Complete!" : "Generating Your Portfolio...")}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 text-center">
          {error ? (
             <>
                <p className="text-red-500 mb-6">{error}</p>
                <Button onClick={() => router.push('/templates')} variant="outline">Try a Different Template</Button>
             </>
          ) : (
            <>
                <Progress value={progress} className="w-full mb-4" />
                <p className="text-gray-600 dark:text-gray-300">{message}</p>
                {progress === 100 && <CheckCircle className="w-8 h-8 mx-auto text-green-500 mt-4" />}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}