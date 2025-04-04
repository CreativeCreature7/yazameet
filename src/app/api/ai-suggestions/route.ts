import { NextRequest, NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { env } from "@/env";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";

export async function POST(req: NextRequest) {
  try {
    // Check that user is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in to use this API" },
        { status: 401 },
      );
    }

    // Parse request body
    const body = await req.json();
    const { sessionName, ideas, requestSingleSuggestion = false } = body;

    // Validate input
    if (!sessionName || !ideas || !Array.isArray(ideas) || ideas.length < 3) {
      return NextResponse.json(
        {
          error:
            "Invalid request. Session name and at least 3 ideas are required.",
        },
        { status: 400 },
      );
    }

    // Extract the existing idea texts
    const existingIdeaTexts = ideas.join("\n");

    // Create the prompt for Gemini
    const prompt = requestSingleSuggestion
      ? `
        I'm brainstorming ideas for a session titled "${sessionName}".
        Here are my current ideas:
        ${existingIdeaTexts}
        
        Please suggest 1 creative, unique, and diverse additional idea that is different from what I already have, but still relevant to the session topic.
        Respond with just the idea, with no additional text or explanation.
      `
      : `
        I'm brainstorming ideas for a session titled "${sessionName}".
        Here are my current ideas:
        ${existingIdeaTexts}
        
        Please suggest 3 creative, unique, and diverse additional ideas that are different from what I already have, but still relevant to the session topic. 
        Please respond with just the ideas separated by '|' character with no additional text or explanation.
      `;

    // Generate suggestions using Gemini
    const { text } = await generateText({
      model: google("gemini-1.5-pro-latest"),
      prompt,
    });

    // Parse the response
    const suggestions = requestSingleSuggestion
      ? [text.trim()]
      : text
          .split("|")
          .map((idea) => idea.trim())
          .filter(Boolean);

    // Return suggestions
    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("AI suggestion error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI suggestions" },
      { status: 500 },
    );
  }
}
