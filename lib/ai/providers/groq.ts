import OpenAI from "openai";
import { GroqProviderError } from "@/lib/errors";
import { aiConfig } from "@/lib/ai/config";
import type {
  AIProvider,
  AIProviderCapabilities,
  AIProviderRequest,
  AIProviderResponse,
} from "./types";

export class GroqProvider implements AIProvider {
  name = "groq";

  capabilities: AIProviderCapabilities = {
    supportsThinking: false, // Groq (Llama 3) does not natively support "thinking budget" via OpenAI SDK
    supportsJsonMode: false, // Using prompt augmentation instead of native JSON mode for reliability
    supportsStreaming: true,
    supportsImages: false,
    supportsToolCalling: true,
  };

  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: aiConfig.groq.apiKey,
      baseURL: "https://api.groq.com/openai/v1",
    });
  }

  async complete(request: AIProviderRequest): Promise<AIProviderResponse> {
    try {
      let systemPrompt = request.systemPrompt;
      if (request.responseMimeType === "application/json") {
        systemPrompt +=
          "\n\nRespond with ONLY valid JSON. No markdown fences, no prose before or after the JSON object.";
      }

      const response = await this.client.chat.completions.create(
        {
          model: request.model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: request.userPrompt },
          ],
          temperature: request.temperature,
          max_tokens: request.maxTokens,
        },
        {
          signal: request.abortSignal,
        }
      );

      const text = response.choices[0]?.message?.content;
      if (!text) {
        throw new Error("Empty response from Groq");
      }

      return {
        text,
        provider: this.name,
        model: request.model,
        usage: response.usage
          ? {
              inputTokens: response.usage.prompt_tokens,
              outputTokens: response.usage.completion_tokens,
            }
          : undefined,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new GroqProviderError(`Groq API Error: ${message}`);
    }
  }
}

export const groqProvider = new GroqProvider();
