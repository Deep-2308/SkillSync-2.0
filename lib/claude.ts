import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export { anthropic };

/**
 * Helper function for streaming completions from Claude.
 * Supports both text generation and structured output scenarios.
 */
export async function streamCompletion({
  model = "claude-sonnet-4-20250514",
  maxTokens = 4096,
  system,
  messages,
  temperature = 0.7,
}: {
  model?: string;
  maxTokens?: number;
  system?: string;
  messages: Anthropic.MessageParam[];
  temperature?: number;
}): Promise<string> {
  const response = await anthropic.messages.create({
    model,
    max_tokens: maxTokens,
    system: system || undefined,
    messages,
    temperature,
  });

  // Extract text from the response content blocks
  const textBlocks = response.content.filter(
    (block): block is Anthropic.TextBlock => block.type === "text"
  );

  return textBlocks.map((block) => block.text).join("");
}

/**
 * Stream completion with a callback for real-time processing.
 * Uses Claude's streaming API for progressive output.
 */
export async function streamCompletionWithCallback({
  model = "claude-sonnet-4-20250514",
  maxTokens = 4096,
  system,
  messages,
  temperature = 0.7,
  onChunk,
}: {
  model?: string;
  maxTokens?: number;
  system?: string;
  messages: Anthropic.MessageParam[];
  temperature?: number;
  onChunk: (chunk: string) => void;
}): Promise<string> {
  let fullText = "";

  const stream = anthropic.messages.stream({
    model,
    max_tokens: maxTokens,
    system: system || undefined,
    messages,
    temperature,
  });

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      const text = event.delta.text;
      fullText += text;
      onChunk(text);
    }
  }

  return fullText;
}
