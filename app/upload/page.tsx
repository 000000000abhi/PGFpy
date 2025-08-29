"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SimplePDFUploadZone } from "@/components/simple-pdf-upload-zone";
import { useAuth } from "@/components/auth-provider";
import { AuthGuard } from "@/components/auth-guard";
import { DatabaseStatus } from "@/components/database-status";
import { useState } from "react";
import { usePythonPdfParser } from "@/hooks/use-python-pdf-parser";
import { Zap } from "lucide-react";

export default function UploadPage() {
  const { parserState, processFile } = usePythonPdfParser();
  const { user } = useAuth();
  const [databaseStatus, setDatabaseStatus] = useState<"ready" | "missing" | "error">("ready");

  const canUpload = user && databaseStatus === "ready";

  const handleFileSelect = async (file: File) => {
    await processFile(file);
  };
  
  const getProgress = () => {
      switch(parserState.stage) {
          case 'idle': return 0;
          case 'parsing': return 33;
          case 'structuring': return 66; // This stage will be quick now
          case 'complete': return 100;
          default: return 0;
      }
  }

  return (
    <AuthGuard requireAuth={true}>
      <div className="min-h-screen bg-white dark:bg-navy-950">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Debug Mode: Verify Parsed Text</h1>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Upload a PDF. The text extracted by the Python server will be displayed below.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <DatabaseStatus showFullCard={true} onStatusChange={setDatabaseStatus} />

            <div className="mt-8">
              <Card className="border-0 shadow-lg bg-white dark:bg-navy-900">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <Zap className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                    Upload PDF to Parse
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <SimplePDFUploadZone
                    onFileSelect={handleFileSelect}
                    processorState={{
                      isProcessing: parserState.isProcessing,
                      progress: getProgress(),
                      error: parserState.error,
                      stage: parserState.stage === 'parsing' ? 'extracting' : 'structuring',
                    }}
                    disabled={!canUpload}
                  />
                </CardContent>
              </Card>

              {parserState.structuredData && (
                <Card className="mt-8 border-0 shadow-lg bg-white dark:bg-navy-900">
                    <CardHeader>
                        <CardTitle>Text Extracted by Python Server</CardTitle>
                        <CardDescription>This is the raw text that will be sent to the Gemini API for processing.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <pre className="text-sm text-gray-800 bg-gray-100 dark:text-gray-200 dark:bg-navy-800 p-4 rounded-md max-h-[60vh] overflow-auto whitespace-pre-wrap">
                            {JSON.stringify(parserState.structuredData, null, 2)}
                        </pre>
                    </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}