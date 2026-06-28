import { z } from "zod";
import type { IChallengeContent } from "@/models/Challenge";

/** Shape the evaluator model must return; validated before persistence. */
export const evaluationResponseSchema = z.object({
  score: z.number().int().min(0).max(100),
  passed: z.boolean(),
  scoreBreakdown: z.object({
    completeness: z.number().min(0).max(25),
    quality: z.number().min(0).max(30),
    accuracy: z.number().min(0).max(25),
    depth: z.number().min(0).max(20),
  }),
  overallFeedback: z.string().min(1),
  strengths: z.array(z.string()).min(2).max(3),
  improvements: z.array(z.string()).min(2).max(3),
  badgeSummary: z.string().min(1),
});

export type EvaluationResult = z.infer<typeof evaluationResponseSchema>;

export interface EvaluationPromptParams {
  domain: string;
  difficulty: string;
  challengeContent: IChallengeContent;
  textContent: string;
  url?: string;
}

/** Builds the exact submission-evaluation system prompt. */
export function buildEvaluationSystemPrompt({
  domain,
  difficulty,
  challengeContent,
  textContent,
  url,
}: EvaluationPromptParams): string {
  return `You are a senior expert evaluator for ${domain}. You evaluate skill challenge submissions with high professional standards.

THE CHALLENGE:
Title: ${challengeContent.title}
Context: ${challengeContent.context}
Requirements: ${challengeContent.requirements.join(" | ")}
Deliverables: ${challengeContent.deliverables.join(" | ")}
Evaluation Criteria: ${challengeContent.evaluationCriteria.join(" | ")}
Expected level: ${difficulty}

THE SUBMISSION:
${textContent}
${url ? "Reference: " + url : ""}

SCORING RUBRIC (total 100 points):
- Completeness (25 pts): Does the submission address ALL requirements and deliverables?
- Quality (30 pts): Is the work genuinely good by ${difficulty} professional standards?
- Accuracy (25 pts): Is it technically correct / conceptually sound?
- Depth (20 pts): Does it show real understanding beyond surface knowledge?

PASS THRESHOLD: 70/100

Be fair but hold genuine professional standards. A 70 should mean the person actually knows this skill at the claimed level. Do not give high scores for vague, generic, or copied-sounding responses.

Respond ONLY with valid JSON — no markdown, no extra text:
{
  'score': number (0-100, integer),
  'passed': boolean (true if score >= 70),
  'scoreBreakdown': {
    'completeness': number (0-25),
    'quality': number (0-30),
    'accuracy': number (0-25),
    'depth': number (0-20)
  },
  'overallFeedback': string (2-3 sentences, honest and specific),
  'strengths': string[] (2-3 specific things they did well, referenced from submission),
  'improvements': string[] (2-3 specific things to work on),
  'badgeSummary': string (ONE sentence: 'Demonstrated [capability] through [evidence]')
}`;
}
