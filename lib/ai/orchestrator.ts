import { ZodType } from "zod";
import { randomUUID } from "crypto";
import { getProvider } from "./providerRegistry";
import { aiConfig } from "./config";
import { AIUnavailableError, AIServiceError, AIResponseError, AISemanticError } from "@/lib/errors";
// We'll import parseAIResponse, and in M3 we'll add semantic validation to it or call it here
import { parseAIResponse } from "./parse";
import { logAIMetrics } from "./metrics";

export interface AIOrchestratorRequest<T> {
  task: "challenge-generation" | "evaluation" | "project-analysis";
  request: {
    systemPrompt: string;
    userPrompt: string;
  };
  schema: ZodType<T>;
  semanticValidator?: (data: T) => void;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function runAICompletion<T>(params: AIOrchestratorRequest<T>): Promise<T> {
  const requestId = randomUUID();
  const { task, request, schema, semanticValidator } = params;

  const providerNames = [
    aiConfig.orchestrator.primaryProvider,
    aiConfig.orchestrator.fallbackProvider,
  ];

  let lastError: Error | undefined;
  let primaryError: Error | undefined;

  for (let i = 0; i < providerNames.length; i++) {
    const providerName = providerNames[i];
    const isPrimary = i === 0;
    const provider = getProvider(providerName);

    // Resolve task-specific configurations
    const taskConfig = aiConfig.gemini.tasks[task] || {}; 
    // ^ In a real implementation we might pass model directly from the config tree of that provider,
    // but per our spec, we'll pick the model generically or assume Gemini models.
    const model = providerName === "gemini" 
      ? taskConfig.model || aiConfig.gemini.tasks["challenge-generation"].model
      : aiConfig.groq.model;
    
    const thinkingEnabled = providerName === "gemini" ? taskConfig.thinking : false;
    
    const providerConfig = aiConfig[providerName as keyof typeof aiConfig] as any;

    // Retry exactly once for transient errors per provider
    const MAX_RETRIES = 1;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), providerConfig.timeoutMs);
      
      const startTime = Date.now();
      try {
        const response = await provider.complete({
          systemPrompt: request.systemPrompt,
          userPrompt: request.userPrompt,
          model,
          temperature: providerConfig.temperature,
          maxTokens: providerConfig.maxTokens,
          responseMimeType: "application/json",
          thinkingConfig: provider.capabilities.supportsThinking ? { enabled: thinkingEnabled, budget: 0 } : undefined,
          abortSignal: controller.signal,
        });

        // Parse and validate
        const parsedData = parseAIResponse(response.text, schema);
        
        // Semantic validation
        if (semanticValidator) {
          try {
            semanticValidator(parsedData);
          } catch (err) {
            // Semantic error triggers failover. Throw a specific error to be caught below.
            throw new AISemanticError(err instanceof Error ? err.message : String(err));
          }
        }

        // Metrics logging
        logAIMetrics(task, {
          requestId,
          provider: providerName,
          model,
          latency: Date.now() - startTime,
          inputTokens: response.usage?.inputTokens,
          outputTokens: response.usage?.outputTokens,
          failedOver: !isPrimary,
          success: true,
        });

        return parsedData;

      } catch (error) {
        // Clear timeout so we don't leak it
        clearTimeout(timeoutId);

        const isTimeout = error instanceof Error && error.name === "AbortError";
        const isAIResponseError = error instanceof AIResponseError;
        const isSemanticError = error instanceof AISemanticError;
        const isTransient = attempt < MAX_RETRIES && !isAIResponseError && !isSemanticError;
        
        logAIMetrics(task, {
          requestId,
          provider: providerName,
          model,
          latency: Date.now() - startTime,
          failedOver: !isPrimary || (isPrimary && !isTransient),
          success: false,
          failureReason: error instanceof Error ? error.message : String(error),
        });

        // Schema validation and Semantic validation failures trigger immediate failover (no retry)
        if (isAIResponseError || isSemanticError) {
           lastError = error instanceof Error ? error : new Error(String(error));
           if (isPrimary) primaryError = lastError;
           break; // Break the attempt loop to move to the next provider
        }

        // Only retry on transient failures or timeouts
        if (attempt < MAX_RETRIES) {
           // Short backoff
           await sleep(500);
           continue; 
        }

        lastError = error instanceof Error ? error : new Error(String(error));
        if (isPrimary) primaryError = lastError;

      } finally {
        clearTimeout(timeoutId);
      }
    }
  }

  throw new AIUnavailableError(primaryError, lastError);
}
