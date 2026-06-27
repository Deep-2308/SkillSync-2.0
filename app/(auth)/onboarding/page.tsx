"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowRight,
  ArrowLeft,
  Loader2,
  Globe,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { DomainGrid } from "@/components/onboarding/DomainGrid";
import { SkillPills } from "@/components/onboarding/SkillPills";
import {
  SKILLS_BY_DOMAIN,
  MAX_SKILLS,
  type PrimaryDomain,
} from "@/lib/constants";
import { onboardingProfileSchema } from "@/lib/validations";

const TOTAL_STEPS = 3;
const BIO_MAX = 300;

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
};

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-.87-.01-1.71-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.36-2.22-.26-4.55-1.14-4.55-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.05A9.34 9.34 0 0 1 12 6.85c.85 0 1.71.12 2.51.34 1.91-1.32 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.48-.01 2.82 0 .27.18.6.69.49A10.02 10.02 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z" />
    </svg>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const { update } = useSession();

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [domain, setDomain] = useState<PrimaryDomain | null>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [bio, setBio] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");

  const availableSkills = useMemo(
    () => (domain ? SKILLS_BY_DOMAIN[domain] : []),
    [domain]
  );

  function selectDomain(next: PrimaryDomain) {
    setDomain(next);
    // Reset skills when switching domains to avoid cross-domain selections.
    setSkills([]);
  }

  function toggleSkill(skill: string) {
    setSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : prev.length < MAX_SKILLS
          ? [...prev, skill]
          : prev
    );
  }

  function goTo(next: number) {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  }

  function handleNext() {
    if (step === 1 && !domain) {
      toast.error("Select your primary domain to continue.");
      return;
    }
    if (step === 2 && skills.length === 0) {
      toast.error("Pick at least one skill to continue.");
      return;
    }
    goTo(step + 1);
  }

  async function finish() {
    const payload = {
      primaryDomain: domain,
      selectedSkills: skills,
      bio,
      githubUrl,
      portfolioUrl,
      onboardingCompleted: true,
    };

    const parsed = onboardingProfileSchema.safeParse(payload);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      toast.error(first?.message ?? "Please review your details.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Could not save your profile.");
        return;
      }

      // Refresh the JWT so middleware sees onboardingCompleted = true.
      await update({
        onboardingCompleted: true,
        primaryDomain: domain,
      });

      toast.success("You're all set. Welcome to SkillSync.");
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const progress = (step / TOTAL_STEPS) * 100;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="grid size-8 place-items-center rounded-md gradient-primary">
            <ShieldCheck className="size-4 text-primary-foreground" />
          </div>
          <span className="font-heading text-lg font-bold tracking-tight">
            SkillSync
          </span>
        </div>
        <span className="text-xs uppercase tracking-wider text-text-muted">
          Step {step} of {TOTAL_STEPS}
        </span>
      </div>

      {/* Progress */}
      <div className="mt-6 space-y-2">
        <Progress value={progress} />
        <p className="text-right text-xs text-text-muted">
          {Math.round(progress)}%
        </p>
      </div>

      {/* Steps */}
      <div className="relative mt-8 flex-1">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            {step === 1 && (
              <section className="space-y-6">
                <header className="space-y-2">
                  <h1 className="font-heading text-2xl font-bold tracking-tight">
                    What is your primary domain?
                  </h1>
                  <p className="text-sm text-text-muted">
                    Select the core area that best defines your current
                    expertise. This helps us tailor your workspace.
                  </p>
                </header>
                <DomainGrid selected={domain} onSelect={selectDomain} />
              </section>
            )}

            {step === 2 && (
              <section className="space-y-6">
                <header className="space-y-2">
                  <h1 className="font-heading text-2xl font-bold tracking-tight">
                    Your top skills
                  </h1>
                  <p className="text-sm text-text-muted">
                    Select up to {MAX_SKILLS} skills in{" "}
                    <span className="text-primary">{domain}</span>.
                  </p>
                </header>
                <SkillPills
                  skills={availableSkills}
                  selected={skills}
                  onToggle={toggleSkill}
                />
                <div className="flex items-center justify-between text-xs text-text-muted">
                  <span>
                    {skills.length} / {MAX_SKILLS} selected
                  </span>
                  {skills.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSkills([])}
                      className="text-primary hover:underline"
                    >
                      Clear all
                    </button>
                  )}
                </div>
              </section>
            )}

            {step === 3 && (
              <section className="space-y-6">
                <header className="space-y-2">
                  <h1 className="font-heading text-2xl font-bold tracking-tight">
                    Your profile
                  </h1>
                  <p className="text-sm text-text-muted">
                    Let&apos;s put a face to the skills. Tell the community a bit
                    about yourself. You can skip and edit this later.
                  </p>
                </header>

                <div className="space-y-1.5">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value.slice(0, BIO_MAX))}
                    placeholder="Builder focused on proving real-world skills…"
                    className="min-h-24"
                  />
                  <p className="text-right text-xs text-text-muted">
                    {bio.length} / {BIO_MAX}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="github">GitHub URL</Label>
                  <div className="relative">
                    <GithubIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
                    <Input
                      id="github"
                      type="url"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="https://github.com/username"
                      className="h-10 pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="portfolio">Portfolio URL</Label>
                  <div className="relative">
                    <Globe className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
                    <Input
                      id="portfolio"
                      type="url"
                      value={portfolioUrl}
                      onChange={(e) => setPortfolioUrl(e.target.value)}
                      placeholder="https://yoursite.com"
                      className="h-10 pl-9"
                    />
                  </div>
                </div>
              </section>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer nav */}
      <div className="mt-8 flex items-center justify-between gap-3">
        {step > 1 ? (
          <Button
            type="button"
            variant="ghost"
            size="lg"
            className="h-11"
            onClick={() => goTo(step - 1)}
            disabled={submitting}
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>
        ) : (
          <span />
        )}

        {step < TOTAL_STEPS ? (
          <Button type="button" size="lg" className="h-11" onClick={handleNext}>
            Continue
            <ArrowRight className="size-4" />
          </Button>
        ) : (
          <Button
            type="button"
            size="lg"
            className="h-11"
            onClick={finish}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Finishing…
              </>
            ) : (
              <>
                Finish setup
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
