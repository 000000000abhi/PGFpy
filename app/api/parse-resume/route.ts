import { type NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { parsePdf } from "@/lib/pdf-parser";

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 API route hit: /api/parse-resume");
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 1. Parse the PDF to extract text
    const { text: extractedText } = await parsePdf(file);

    if (!extractedText || extractedText.length < 50) {
      return NextResponse.json(
        { error: "Could not extract sufficient text from the PDF." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      console.error("❌ Missing GOOGLE_GENERATIVE_AI_API_KEY");
      return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
    }

    // 2. Send the extracted text to the Gemini API
    console.log("🤖 Sending extracted text to Gemini API...");
    const { text: geminiResponse } = await generateText({
      model: google("gemini-1.5-pro-latest"),
      prompt: `Parse the following resume text and return a structured JSON object. The JSON should contain personalInfo, professionalSummary, experience, education, skills, projects, and certifications.
      
      Resume text:
      ---
      ${extractedText}
      ---
      
      Return only the JSON object, without any surrounding text or markdown formatting.`,
    });

    // 3. Parse the JSON response from Gemini
    const parsedData = JSON.parse(geminiResponse);
    console.log("✅ Successfully received and parsed response from Gemini.");

    return NextResponse.json({
      success: true,
      data: parsedData,
    });
  } catch (error) {
    console.error("❌ Error in /api/parse-resume:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
