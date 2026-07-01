export interface AIProviderCapabilities {
  supportsThinking: boolean;
  supportsJsonMode: boolean;
  supportsStreaming: boolean;
  supportsImages: boolean;
  supportsToolCalling: boolean;
}

export interface AIProviderRequest {
  systemPrompt: string;
  userPrompt: string;
  temperature: number;
  maxTokens: number;
  responseMimeType?: "application/json";
  model: string;
  thinkingConfig?: {
    enabled: boolean;
    budget?: number;
  };
  abortSignal?: AbortSignal;
}

export interface AIProviderResponse {
  text: string;
  provider: string;
  model: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

export interface AIProvider {
  name: string;
  capabilities: AIProviderCapabilities;
  complete(request: AIProviderRequest): Promise<AIProviderResponse>;
}
