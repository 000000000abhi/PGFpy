import { type NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

export async function POST(request: NextRequest) {
  try {
    const { structuredData, templateId } = await request.json();

    if (!structuredData) {
      return NextResponse.json({ error: "No structured data provided" }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing GOOGLE_GENERATIVE_AI_API_KEY");
    }

    console.log(`🤖 Generating portfolio code with template: ${templateId}`);
    
    const { text: geminiResponse } = await generateText({
      model: google("gemini-1.5-pro-latest"),
      prompt: `Based on the following structured resume JSON object, generate a complete, single-file portfolio website.
      
      Resume Data:
      ---
      ${JSON.stringify(structuredData, null, 2)}
      ---

      Requirements:
      1.  **HTML**: Create a clean, semantic HTML structure in the 'html' field.
      2.  **CSS**: Provide modern, responsive CSS in the 'css' field. Use Tailwind CSS classes directly in the HTML for styling where possible, and add custom CSS for more complex styles.
      3.  **JavaScript**: Add some simple interactivity (like smooth scrolling or hover effects) in the 'js' field.
      
      Return ONLY a valid JSON object with the keys "html", "css", and "js". Do not include any other text or markdown formatting.
      `,
    });

    const generatedCode = JSON.parse(geminiResponse);
    console.log("✅ Successfully generated portfolio code from Gemini.");

    return NextResponse.json({
      success: true,
      portfolio: generatedCode,
    });
  } catch (error) {
    console.error("❌ Error in /api/generate-portfolio-code:", error);
    // Provide a simple fallback portfolio if the API fails
    console.log("💡 Falling back to mock portfolio code.");
    const fallbackPortfolio = {
        html: `<h1>Hello, World!</h1><p>Could not generate portfolio. This is fallback content.</p>`,
        css: `body { font-family: sans-serif; text-align: center; }`,
        js: `console.log("Portfolio generation failed.");`
    };
    return NextResponse.json({ success: true, portfolio: fallbackPortfolio });
  }
}