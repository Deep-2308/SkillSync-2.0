const requireEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`CRITICAL BOOT ERROR: Missing required environment variable: ${key}`);
  }
  return value;
};

const getEnvStr = (key: string, fallback: string): string => process.env[key] || fallback;
const getEnvInt = (key: string, fallback: number): number => {
  const val = process.env[key];
  return val ? parseInt(val, 10) : fallback;
};
const getEnvBool = (key: string, fallback: boolean): boolean => {
  const val = process.env[key];
  return val ? val === "true" : fallback;
};

// Fail-fast validation of critical API keys
const googleGenAiApiKey = requireEnv("GOOGLE_GENAI_API_KEY");
const groqApiKey = requireEnv("GROQ_API_KEY");
const primaryProvider = getEnvStr("PRIMARY_AI_PROVIDER", "gemini");
const fallbackProvider = getEnvStr("FALLBACK_AI_PROVIDER", "groq");

export const aiConfig = {
  orchestrator: {
    primaryProvider,
    fallbackProvider,
  },
  gemini: {
    apiKey: googleGenAiApiKey,
    timeoutMs: getEnvInt("GEMINI_TIMEOUT_MS", 20000),
    tasks: {
      "challenge-generation": {
        model: getEnvStr("GEMINI_GENERATION_MODEL", "gemini-2.5-pro"),
        thinking: getEnvBool("GEMINI_GENERATION_THINKING", true),
      },
      evaluation: {
        model: getEnvStr("GEMINI_EVALUATION_MODEL", "gemini-2.5-pro"),
        thinking: getEnvBool("GEMINI_EVALUATION_THINKING", false),
      },
      "project-analysis": {
        model: getEnvStr("GEMINI_PROJECT_ANALYSIS_MODEL", "gemini-2.5-pro"),
        thinking: getEnvBool("GEMINI_PROJECT_ANALYSIS_THINKING", false),
      },
    },
    // Global Gemini settings
    temperature: getEnvInt("GEMINI_TEMPERATURE", 0.7),
    maxTokens: getEnvInt("GEMINI_MAX_TOKENS", 2048),
  },
  groq: {
    apiKey: groqApiKey,
    timeoutMs: getEnvInt("GROQ_TIMEOUT_MS", 8000),
    model: getEnvStr("GROQ_MODEL", "llama-3.3-70b-versatile"),
    temperature: getEnvInt("GROQ_TEMPERATURE", 0.7),
    maxTokens: getEnvInt("GROQ_MAX_TOKENS", 2048),
  },
} as const;


