import { NextResponse } from "next/server";
import { z } from "zod";
import { runAICompletion } from "@/lib/ai/orchestrator";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const schema = z.object({
    message: z.string(),
  });

  const request = {
    systemPrompt: "You are a test bot.",
    userPrompt: "Respond with a JSON object containing exactly one key 'message' with the value 'hello world'.",
  };

  try {
    // 1. Normal call (Should use Gemini)
    const start1 = Date.now();
    const result1 = await runAICompletion({
      task: "evaluation",
      request,
      schema,
    });
    const time1 = Date.now() - start1;

    // 2. Failover call (Should fail Gemini and fallback to Groq)
    const originalKey = process.env.GOOGLE_GENAI_API_KEY;
    process.env.GOOGLE_GENAI_API_KEY = "invalid_key_for_testing";

    const start2 = Date.now();
    let result2;
    try {
      result2 = await runAICompletion({
        task: "evaluation",
        request,
        schema,
      });
    } finally {
      // Always restore the real key
      process.env.GOOGLE_GENAI_API_KEY = originalKey;
    }
    const time2 = Date.now() - start2;

    return NextResponse.json({
      normalCall: {
        description: "Expected to use Gemini",
        timeMs: time1,
        data: result1,
      },
      failoverCall: {
        description: "Expected to fail Gemini (due to invalid key) and use Groq",
        timeMs: time2,
        data: result2,
      },
      note: "Check your terminal logs to verify the 'provider' and 'failedOver' metrics emitted by logAIMetrics."
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
