import { logger } from "@/lib/logger";

export interface AIMetricFields {
  requestId: string;
  provider: string;
  model: string;
  latency: number;
  inputTokens?: number;
  outputTokens?: number;
  failedOver: boolean;
  success: boolean;
  failureReason?: string;
}

export function logAIMetrics(task: string, metrics: AIMetricFields): void {
  const event = `ai.${task}.${metrics.success ? "success" : "failure"}`;
  
  if (metrics.success) {
    logger.info(event, { ...metrics });
  } else {
    logger.error(event, { ...metrics });
  }
}
