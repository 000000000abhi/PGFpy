import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    // For debugging: Log the text that would be sent to Gemini
    console.log("✅ Received text from frontend. This is what would be sent to Gemini:");
    console.log("-------------------- START OF TEXT --------------------");
    console.log(text);
    console.log("--------------------- END OF TEXT ---------------------");

    // For debugging: Immediately return the received text to the frontend
    return NextResponse.json({
      success: true,
      data: {
        // We wrap it in a simple object to show it on the UI
        extractedText: text,
      },
    });

  } catch (error) {
    console.error("❌ Error in /api/process-resume-text:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}