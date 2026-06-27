import { z } from "zod";

/** Maps a domain to the expert persona Claude should adopt. */
export const DOMAIN_CONTEXT: Record<string, string> = {
  "Frontend Dev":
    "senior frontend engineer specializing in web performance and modern React patterns",
  "UI/UX Design":
    "senior UX designer with expertise in user research and design systems",
  "Backend Dev":
    "senior backend engineer with expertise in scalable API design and databases",
  "Data Analysis":
    "senior data analyst with expertise in statistical analysis and data storytelling",
  "Product Management": "senior product manager at a growth-stage startup",
  "Content Writing":
    "senior content strategist and editor at a tech publication",
  Marketing: "senior marketing manager specializing in B2B SaaS growth",
  "DevOps/Cloud":
    "senior DevOps engineer with expertise in cloud infrastructure and CI/CD",
};

/** Shape the model must return; mirrors the stored challengeContent. */
export const challengeResponseSchema = z.object({
  title: z.string().min(10).max(120),
  context: z.string().min(30),
  requirements: z.array(z.string()).length(4),
  deliverables: z.array(z.string()).min(1).max(4),
  evaluationCriteria: z.array(z.string()).min(3).max(4),
  estimatedMinutes: z.number().min(25).max(50),
});

export type ChallengeContent = z.infer<typeof challengeResponseSchema>;

export interface ChallengePromptParams {
  domainContext: string;
  difficulty: string;
  skillName: string;
}

/** Builds the exact challenge-generation system prompt. */
export function buildChallengeSystemPrompt({
  domainContext,
  difficulty,
  skillName,
}: ChallengePromptParams): string {
  return `You are a ${domainContext} and you are creating a real-world skill assessment challenge. Generate a UNIQUE, SPECIFIC challenge for someone claiming ${difficulty}-level proficiency in ${skillName}.

CRITICAL RULES:
- The challenge must reflect a REAL scenario from industry (not academic)
- The context must be fresh: use different companies, roles, and situations each time
- Difficulty calibration: beginner = junior 0-1 year, intermediate = 1-3 years, advanced = 3-5+ years
- The user submits via TEXT or URL — no file uploads, no running code environment
- For code skills: ask for explanation, approach, pseudocode, or code review — not live code
- For design skills: ask for design brief, specification, or critique — not actual design files
- Time should genuinely require 30-45 minutes of focused work

Respond ONLY with valid JSON. No markdown fences, no extra text, no preamble:
{
  'title': string (specific and descriptive, like a real work task),
  'context': string (2-3 sentences: WHO you are, WHAT company/client, WHAT situation),
  'requirements': string[] (exactly 4 specific, actionable tasks — start each with an action verb),
  'deliverables': string[] (exactly what to write or describe in the submission),
  'evaluationCriteria': string[] (3-4 what good looks like — specific to this challenge),
  'estimatedMinutes': number (between 30 and 45)
}`;
}
