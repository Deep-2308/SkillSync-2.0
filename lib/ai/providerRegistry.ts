import { geminiProvider } from "./providers/gemini";
import { groqProvider } from "./providers/groq";
import type { AIProvider } from "./providers/types";

const providers: Record<string, AIProvider> = {
  gemini: geminiProvider,
  groq: groqProvider,
};

export function getProvider(name: string): AIProvider {
  const provider = providers[name];
  if (!provider) {
    throw new Error(`AI Provider '${name}' is not registered in the provider registry.`);
  }
  return provider;
}

export function getAllProviders(): AIProvider[] {
  return Object.values(providers);
}
