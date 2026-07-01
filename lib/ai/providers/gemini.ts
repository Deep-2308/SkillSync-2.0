import { GoogleGenAI } from "@google/genai";
import { GeminiProviderError } from "@/lib/errors";
import { aiConfig } from "@/lib/ai/config";
import type {
  AIProvider,
  AIProviderCapabilities,
  AIProviderRequest,
  AIProviderResponse,
} from "./types";

export class GeminiProvider implements AIProvider {
  name = "gemini";

  capabilities: AIProviderCapabilities = {
    supportsThinking: true,
    supportsJsonMode: true,
    supportsStreaming: true,
    supportsImages: true,
    supportsToolCalling: true,
  };

  private client: GoogleGenAI;

  constructor() {
    this.client = new GoogleGenAI({
      apiKey: aiConfig.gemini.apiKey,
    });
  }

  async complete(request: AIProviderRequest): Promise<AIProviderResponse> {
    try {
      const response = await this.client.models.generateContent({
        model: request.model,
        contents: [
          { role: "system", parts: [{ text: request.systemPrompt }] },
          { role: "user", parts: [{ text: request.userPrompt }] },
        ],
        config: {
          temperature: request.temperature,
          maxOutputTokens: request.maxTokens,
          responseMimeType: request.responseMimeType,
          thinkingConfig: request.thinkingConfig?.enabled
            ? {
                thinkingBudget: request.thinkingConfig.budget,
              }
            : undefined,
        },
        // We do not pass abortSignal directly to the SDK if it doesn't support it natively in this version,
        // but the orchestrator will handle the timeout at the Promise level.
        // If the GenAI SDK supports abortSignal, we'd pass it here.
      });

      if (!response.text) {
        throw new Error("Empty response from Gemini");
      }

      return {
        text: response.text,
        provider: this.name,
        model: request.model,
        usage: response.usageMetadata
          ? {
              inputTokens: response.usageMetadata.promptTokenCount ?? 0,
              outputTokens: response.usageMetadata.candidatesTokenCount ?? 0,
            }
          : undefined,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new GeminiProviderError(`Gemini API Error: ${message}`);
    }
  }
}

export const geminiProvider = new GeminiProvider();
