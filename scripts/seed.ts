/**
 * SkillSync database seed.
 *
 * Run with:  npx tsx scripts/seed.ts
 *
 * Seeds realistic Indian student profiles, their verified badges, and a set of
 * team projects so the demo has rich, believable data. Re-running is safe — it
 * clears previously seeded records (matched by the @email.com demo domain)
 * before inserting fresh ones.
 */
import fs from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";
import mongoose, { Types } from "mongoose";

// ── Load .env.local BEFORE anything reads process.env (lib/mongodb throws if
//    MONGODB_URI is missing at import time, so the DB/models are imported
//    dynamically in main() after this runs). ────────────────────────────────
function loadEnvLocal(): void {
  const file = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(file)) return;
  for (const raw of fs.readFileSync(file, "utf8").split("\n")) {
    const match = raw.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (!match) continue;
    const key = match[1];
    let value = (match[2] ?? "").trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}
loadEnvLocal();

// ─── Domain ↔ skill helpers ────────────────────────────────────────────────────
type Domain =
  | "Frontend Dev"
  | "UI/UX Design"
  | "Backend Dev"
  | "Data Analysis"
  | "Product Management"
  | "Content Writing"
  | "Marketing"
  | "DevOps/Cloud";

type Difficulty = "beginner" | "intermediate" | "advanced";

function difficultyForScore(score: number): Difficulty {
  if (score >= 85) return "advanced";
  if (score >= 70) return "intermediate";
  return "beginner";
}

/** Specific, believable one-line proofs per skill. */
const BADGE_SUMMARY: Record<string, string> = {
  React:
    "Architected a responsive, data-driven dashboard with complex state managed through hooks and Context API.",
  TypeScript:
    "Modeled a type-safe domain layer with generics and discriminated unions, eliminating a class of runtime bugs.",
  CSS: "Built a fluid, accessible layout system with modern CSS grid and container queries — no framework crutches.",
  "Next.js":
    "Shipped a performant App Router app using server components, streaming, and edge-ready data fetching.",
  "CSS/Tailwind":
    "Crafted a polished, responsive interface with a disciplined Tailwind system and accessible component patterns.",
  "Vue.js":
    "Built a reactive, component-driven Vue app with composables and clean, predictable state management.",
  JavaScript:
    "Showed strong command of async patterns, closures, and direct DOM work without leaning on a framework.",
  Figma:
    "Designed a cohesive, multi-state component library in Figma with auto-layout and robust design tokens.",
  "User Research":
    "Ran a structured usability study and synthesized findings into changes that measurably simplified the core flow.",
  "Design Systems":
    "Defined a scalable design system with tokens, theming, and documented usage that kept the UI consistent.",
  Wireframing:
    "Translated fuzzy requirements into clear low-fidelity wireframes that de-risked the build early.",
  "UX Writing":
    "Wrote clear, human microcopy that guided users through a tricky flow with confidence.",
  "Node.js":
    "Built a resilient REST service with a layered architecture, input validation, and graceful error handling.",
  MongoDB:
    "Modeled an efficient document schema with compound indexes and aggregation pipelines tuned for fast reads.",
  "REST APIs":
    "Designed a clean, versioned REST API with consistent error contracts, pagination, and sensible status codes.",
  Python:
    "Wrote clean, idiomatic Python with sound data structures and thoughtful, defensive error handling.",
  GraphQL:
    "Designed a well-typed GraphQL schema with efficient resolvers and cursor-based pagination.",
  PostgreSQL:
    "Modeled a normalized relational schema with indexes and constraints tuned for real query performance.",
  "Python/Pandas":
    "Wrangled a messy real-world dataset into a clean, analysis-ready pipeline with vectorized Pandas operations.",
  SQL: "Authored complex analytical SQL with window functions and CTEs to answer ambiguous business questions.",
  "Data Visualization":
    "Turned a dense dataset into a clear, decision-driving visualization with honest, well-labeled charts.",
  "PRD Writing":
    "Wrote a crisp PRD that framed the problem, success metrics, and scope with explicit tradeoffs.",
  "User Stories":
    "Decomposed an ambiguous feature into well-formed user stories with testable acceptance criteria.",
  Roadmapping:
    "Built a prioritized, outcome-oriented roadmap that balanced user value against engineering effort.",
  "Technical Writing":
    "Produced clear, accurate technical docs that a brand-new engineer could follow without help.",
  "SEO Content":
    "Created search-optimized content with strong information architecture and genuine reader value.",
  "Blog Writing":
    "Wrote an engaging, well-structured long-form piece with a clear narrative arc and strong hook.",
  "Go-to-Market Strategy":
    "Built a focused go-to-market plan with clear segmentation, positioning, and channel strategy.",
  "Social Media Marketing":
    "Planned a coherent social campaign with platform-specific content and measurable engagement goals.",
  Docker:
    "Containerized a multi-service app with lean, reproducible images and a tidy local compose setup.",
  "CI/CD Pipelines":
    "Built a reliable CI/CD pipeline with automated tests, dependency caching, and zero-downtime deploys.",
};

function badgeSummary(skill: string, difficulty: Difficulty): string {
  return (
    BADGE_SUMMARY[skill] ??
    `Demonstrated solid, verifiable proficiency in ${skill} at a ${difficulty} level.`
  );
}

// ─── User seed data ────────────────────────────────────────────────────────────
interface SeedBadge {
  skill: string;
  score: number;
}
interface SeedUser {
  name: string;
  domain: Domain;
  city: string;
  bio: string;
  badges: SeedBadge[];
}

const USERS: SeedUser[] = [
  {
    name: "Aarav Shah",
    domain: "Frontend Dev",
    city: "Surat",
    bio: "Frontend engineer from Surat obsessed with fast, accessible React interfaces and clean component architecture.",
    badges: [
      { skill: "React", score: 91 },
      { skill: "TypeScript", score: 84 },
      { skill: "CSS", score: 78 },
      { skill: "Next.js", score: 87 },
    ],
  },
  {
    name: "Priya Patel",
    domain: "UI/UX Design",
    city: "Ahmedabad",
    bio: "Product designer in Ahmedabad who turns messy problems into calm, usable interfaces backed by real research.",
    badges: [
      { skill: "Figma", score: 95 },
      { skill: "User Research", score: 82 },
      { skill: "Design Systems", score: 88 },
    ],
  },
  {
    name: "Rohan Mehta",
    domain: "Backend Dev",
    city: "Mumbai",
    bio: "Backend developer from Mumbai focused on dependable APIs, sensible data models, and boring-in-a-good-way infrastructure.",
    badges: [
      { skill: "Node.js", score: 79 },
      { skill: "MongoDB", score: 85 },
      { skill: "REST APIs", score: 73 },
    ],
  },
  {
    name: "Ananya Joshi",
    domain: "Data Analysis",
    city: "Bangalore",
    bio: "Data analyst in Bangalore who loves coaxing clear stories out of stubborn datasets.",
    badges: [
      { skill: "Python/Pandas", score: 89 },
      { skill: "SQL", score: 92 },
      { skill: "Data Visualization", score: 85 },
    ],
  },
  {
    name: "Karan Desai",
    domain: "Product Management",
    city: "Pune",
    bio: "Aspiring PM from Pune who enjoys framing sharp problems and writing specs engineers actually want to build.",
    badges: [
      { skill: "PRD Writing", score: 86 },
      { skill: "User Stories", score: 79 },
    ],
  },
  {
    name: "Sneha Gupta",
    domain: "Content Writing",
    city: "Delhi",
    bio: "Content writer in Delhi specializing in technical explainers that make hard topics feel obvious.",
    badges: [
      { skill: "Technical Writing", score: 91 },
      { skill: "SEO Content", score: 83 },
      { skill: "Blog Writing", score: 77 },
    ],
  },
  {
    name: "Arjun Nair",
    domain: "Frontend Dev",
    city: "Kochi",
    bio: "Frontend developer from Kochi building snappy web apps and sweating the small interaction details.",
    badges: [
      { skill: "React", score: 82 },
      { skill: "JavaScript", score: 76 },
    ],
  },
  {
    name: "Kavita Sharma",
    domain: "UI/UX Design",
    city: "Jaipur",
    bio: "UI/UX designer in Jaipur who starts every project with low-fidelity wireframes and honest user flows.",
    badges: [
      { skill: "Figma", score: 88 },
      { skill: "Wireframing", score: 81 },
    ],
  },
  {
    name: "Vikram Singh",
    domain: "Backend Dev",
    city: "Chandigarh",
    bio: "Backend engineer from Chandigarh comfortable across Python services, GraphQL, and well-tuned relational schemas.",
    badges: [
      { skill: "Python", score: 84 },
      { skill: "GraphQL", score: 77 },
      { skill: "PostgreSQL", score: 80 },
    ],
  },
  {
    name: "Neha Agarwal",
    domain: "Marketing",
    city: "Lucknow",
    bio: "Growth-minded marketer in Lucknow who pairs go-to-market strategy with hands-on social execution.",
    badges: [
      { skill: "Go-to-Market Strategy", score: 85 },
      { skill: "Social Media Marketing", score: 79 },
    ],
  },
  {
    name: "Siddharth Bose",
    domain: "DevOps/Cloud",
    city: "Kolkata",
    bio: "DevOps engineer from Kolkata who treats pipelines and infrastructure as a product worth polishing.",
    badges: [
      { skill: "Docker", score: 88 },
      { skill: "CI/CD Pipelines", score: 82 },
    ],
  },
  {
    name: "Divya Krishnan",
    domain: "Frontend Dev",
    city: "Chennai",
    bio: "Frontend developer in Chennai fluent in Vue and Tailwind, with a soft spot for tidy, expressive UI.",
    badges: [
      { skill: "Vue.js", score: 83 },
      { skill: "CSS/Tailwind", score: 90 },
    ],
  },
  {
    name: "Mohit Verma",
    domain: "Data Analysis",
    city: "Hyderabad",
    bio: "Data analyst from Hyderabad who lives in SQL and Pandas and likes answers that hold up to scrutiny.",
    badges: [
      { skill: "SQL", score: 86 },
      { skill: "Python/Pandas", score: 81 },
    ],
  },
  {
    name: "Ishaan Thakur",
    domain: "Product Management",
    city: "Ahmedabad",
    bio: "Product enthusiast in Ahmedabad focused on roadmaps that connect user outcomes to shippable work.",
    badges: [{ skill: "Roadmapping", score: 84 }],
  },
  {
    name: "Pooja Saxena",
    domain: "Content Writing",
    city: "Bhopal",
    bio: "UX writer from Bhopal crafting microcopy that quietly makes products easier to use.",
    badges: [{ skill: "UX Writing", score: 88 }],
  },
];

function emailFor(name: string): string {
  return `${name.toLowerCase().replace(/\s+/g, ".")}@email.com`;
}

// ─── Project seed data ─────────────────────────────────────────────────────────
type ProjectStatus = "recruiting" | "building" | "completed" | "abandoned";
type TaskStatus = "todo" | "in-progress" | "done";

interface SeedRole {
  title: string;
  description: string;
  requiredSkills: string[];
  importance: string;
  filledBy?: string; // user name
}
interface SeedTask {
  title: string;
  assignedTo?: string; // user name
  status: TaskStatus;
}
interface SeedProject {
  title: string;
  owner: string;
  ownerRole: string;
  status: ProjectStatus;
  description: string;
  tags: string[];
  analysis: {
    summary: string;
    problemStatement: string;
    targetOutcome: string;
    estimatedDuration: string;
    complexity: "low" | "medium" | "high";
  };
  roles: SeedRole[];
  tasks: SeedTask[];
}

const PROJECTS: SeedProject[] = [
  {
    title: "EduTrack — AI Study Companion",
    owner: "Aarav Shah",
    ownerRole: "Frontend Developer",
    status: "building",
    description:
      "A web app where students upload syllabus PDFs and an AI builds personalized study plans, quizzes, and progress tracking.",
    tags: ["EdTech", "AI", "Productivity"],
    analysis: {
      summary:
        "EduTrack turns a student's syllabus into a personalized, adaptive study plan with AI-generated quizzes and progress tracking.",
      problemStatement:
        "Students struggle to convert dense syllabi into a realistic, prioritized study schedule.",
      targetOutcome:
        "A learner uploads a syllabus and immediately gets a structured plan and practice they can act on.",
      estimatedDuration: "8-10 weeks",
      complexity: "high",
    },
    roles: [
      {
        title: "Frontend Developer",
        description:
          "Owns the student-facing dashboard, quiz UI, and progress views with a focus on responsiveness.",
        requiredSkills: ["React", "Next.js", "CSS/Tailwind"],
        importance: "The product lives or dies on a clear, motivating learner experience.",
        filledBy: "Aarav Shah",
      },
      {
        title: "UI/UX Designer",
        description:
          "Shapes the learning flow and visual system from syllabus upload through daily study.",
        requiredSkills: ["Figma", "Design Systems", "User Research"],
        importance: "Good pedagogy needs calm, legible design to land.",
        filledBy: "Priya Patel",
      },
      {
        title: "Backend Developer",
        description:
          "Builds the syllabus parsing service and the study-plan and quiz APIs.",
        requiredSkills: ["Node.js", "MongoDB", "REST APIs"],
        importance: "Reliable parsing and storage underpin every feature.",
        filledBy: "Rohan Mehta",
      },
      {
        title: "Data Analyst",
        description:
          "Turns student activity into progress insights and adaptive study recommendations.",
        requiredSkills: ["Python/Pandas", "SQL", "Data Visualization"],
        importance: "Adaptivity is the differentiator — it needs real analysis behind it.",
      },
    ],
    tasks: [
      { title: "Set up Next.js App Router and design tokens", assignedTo: "Aarav Shah", status: "done" },
      { title: "Design the study-plan dashboard", assignedTo: "Priya Patel", status: "done" },
      { title: "Build syllabus PDF upload + parsing", assignedTo: "Rohan Mehta", status: "in-progress" },
      { title: "Implement quiz generation UI", assignedTo: "Aarav Shah", status: "in-progress" },
      { title: "Design progress-tracking screens", assignedTo: "Priya Patel", status: "todo" },
      { title: "Define MongoDB schema for study plans", assignedTo: "Rohan Mehta", status: "todo" },
    ],
  },
  {
    title: "HealthLog — Fitness Tracking PWA",
    owner: "Arjun Nair",
    ownerRole: "Frontend Developer",
    status: "recruiting",
    description:
      "A progressive web app for tracking workouts, nutrition, and health metrics with AI-powered recommendations.",
    tags: ["Health", "PWA", "AI"],
    analysis: {
      summary:
        "HealthLog is an installable PWA that logs workouts and nutrition and nudges users with AI-driven recommendations.",
      problemStatement:
        "Most fitness apps are heavy, online-only, and ignore how people actually log on the go.",
      targetOutcome:
        "A fast, offline-capable tracker users open every day without friction.",
      estimatedDuration: "6-8 weeks",
      complexity: "medium",
    },
    roles: [
      {
        title: "Frontend Developer",
        description:
          "Owns the offline-first PWA shell, logging flows, and charts.",
        requiredSkills: ["React", "JavaScript", "CSS/Tailwind"],
        importance: "Daily-use apps must feel instant and reliable offline.",
        filledBy: "Arjun Nair",
      },
      {
        title: "Backend Developer",
        description:
          "Builds the sync API, auth, and the recommendation service integration.",
        requiredSkills: ["Node.js", "REST APIs", "MongoDB"],
        importance: "Sync and data integrity are critical for a health tracker.",
      },
      {
        title: "UI/UX Designer",
        description:
          "Designs frictionless logging and a motivating metrics dashboard.",
        requiredSkills: ["Figma", "Wireframing", "Prototyping"],
        importance: "Reducing logging friction is the core design challenge.",
      },
      {
        title: "Content Writer",
        description:
          "Writes onboarding, habit nudges, and helpful in-app guidance.",
        requiredSkills: ["Technical Writing", "SEO Content"],
        importance: "Clear guidance is what turns a tracker into a habit.",
      },
    ],
    tasks: [],
  },
  {
    title: "MarketMind — SME Marketing Automation",
    owner: "Neha Agarwal",
    ownerRole: "Marketing Lead",
    status: "recruiting",
    description:
      "A SaaS tool that helps small Indian businesses automate their social media, WhatsApp, and email marketing using AI.",
    tags: ["MarTech", "SaaS", "AI", "SMB"],
    analysis: {
      summary:
        "MarketMind gives small businesses one place to plan and automate social, WhatsApp, and email campaigns with AI assistance.",
      problemStatement:
        "Small Indian businesses lack the time and tooling to run consistent, multi-channel marketing.",
      targetOutcome:
        "An owner schedules a week of coherent, on-brand marketing in under an hour.",
      estimatedDuration: "10-12 weeks",
      complexity: "medium",
    },
    roles: [
      {
        title: "Frontend Developer",
        description:
          "Builds the campaign composer, scheduling calendar, and analytics views.",
        requiredSkills: ["React", "Next.js", "CSS/Tailwind"],
        importance: "The composer is the product's daily surface.",
      },
      {
        title: "Backend Developer",
        description:
          "Builds the scheduling engine and integrations with WhatsApp and email providers.",
        requiredSkills: ["Node.js", "PostgreSQL", "REST APIs"],
        importance: "Reliable delivery and scheduling are the hard core of the product.",
      },
      {
        title: "Content Writer",
        description:
          "Creates campaign templates and the AI prompt library for on-brand copy.",
        requiredSkills: ["SEO Content", "Blog Writing", "Social Media Marketing"],
        importance: "Template quality directly drives customer results.",
      },
    ],
    tasks: [],
  },
  {
    title: "CodeBuddy — Peer Code Review Platform",
    owner: "Vikram Singh",
    ownerRole: "Backend Developer",
    status: "building",
    description:
      "A platform where developers submit code snippets for peer review, get structured feedback, and track their code-quality improvement over time.",
    tags: ["DevTools", "Collaboration"],
    analysis: {
      summary:
        "CodeBuddy is a peer code-review platform with structured feedback and quality trends over time.",
      problemStatement:
        "Developers learning in isolation rarely get structured, actionable feedback on their code.",
      targetOutcome:
        "A developer submits a snippet and receives clear, structured review they can measurably learn from.",
      estimatedDuration: "8-10 weeks",
      complexity: "medium",
    },
    roles: [
      {
        title: "Backend Developer",
        description:
          "Owns the snippet, review, and scoring services plus the GraphQL API.",
        requiredSkills: ["Python", "PostgreSQL", "GraphQL"],
        importance: "The review and scoring engine is the heart of the platform.",
        filledBy: "Vikram Singh",
      },
      {
        title: "DevOps Engineer",
        description:
          "Owns containerization, CI/CD, and the sandbox that runs submitted snippets safely.",
        requiredSkills: ["Docker", "CI/CD Pipelines"],
        importance: "Safe, reproducible execution of untrusted code is non-negotiable.",
        filledBy: "Siddharth Bose",
      },
      {
        title: "Frontend Engineer",
        description:
          "Builds the snippet viewer and inline review experience.",
        requiredSkills: ["Vue.js", "CSS/Tailwind"],
        importance: "Review ergonomics decide whether people actually leave feedback.",
        filledBy: "Divya Krishnan",
      },
      {
        title: "Frontend Developer",
        description:
          "Builds the submission flow and code-quality trend dashboards in React.",
        requiredSkills: ["React", "TypeScript"],
        importance: "Progress visualization is what keeps developers coming back.",
      },
    ],
    tasks: [
      { title: "Set up Postgres schema for snippets & reviews", assignedTo: "Vikram Singh", status: "done" },
      { title: "Configure CI pipeline and Docker images", assignedTo: "Siddharth Bose", status: "done" },
      { title: "Build snippet submission flow", assignedTo: "Divya Krishnan", status: "in-progress" },
      { title: "Implement structured review form", status: "todo" },
      { title: "Design code-quality trend charts", assignedTo: "Vikram Singh", status: "todo" },
    ],
  },
];

// ─── Runner ────────────────────────────────────────────────────────────────────
async function main() {
  // Imported here (not at top) so .env.local is loaded before lib/mongodb reads it.
  const { default: dbConnect } = await import("@/lib/mongodb");
  const { default: User } = await import("@/models/User");
  const { default: Badge } = await import("@/models/Badge");
  const { default: Project } = await import("@/models/Project");

  await dbConnect();
  console.log("→ Connected to MongoDB");

  const emails = USERS.map((u) => emailFor(u.name));

  // membership counts (owner + filled roles) per user name
  const membershipCount = new Map<string, number>();
  for (const p of PROJECTS) {
    const names = new Set<string>([p.owner]);
    for (const r of p.roles) if (r.filledBy) names.add(r.filledBy);
    for (const n of names)
      membershipCount.set(n, (membershipCount.get(n) ?? 0) + 1);
  }

  // ── Clean previously seeded data (idempotent re-runs) ──
  const existing = await User.find({ email: { $in: emails } }).select("_id");
  const existingIds = existing.map((u) => u._id);
  if (existingIds.length) {
    await Promise.all([
      Badge.deleteMany({ userId: { $in: existingIds } }),
      Project.deleteMany({ ownerId: { $in: existingIds } }),
      User.deleteMany({ _id: { $in: existingIds } }),
    ]);
    console.log(`→ Cleared ${existingIds.length} previously seeded user(s)`);
  }

  const passwordHash = await bcrypt.hash("Password123!", 10);

  // ── Insert users ──
  const userDocs = USERS.map((u) => ({
    name: u.name,
    email: emailFor(u.name),
    password: passwordHash,
    emailVerified: new Date(),
    bio: u.bio,
    primaryDomain: u.domain,
    selectedSkills: u.badges.map((b) => b.skill).slice(0, 8),
    badgeCount: u.badges.length,
    projectCount: membershipCount.get(u.name) ?? 0,
    onboardingCompleted: true,
  }));
  const insertedUsers = await User.insertMany(userDocs);
  const idByName = new Map<string, Types.ObjectId>();
  insertedUsers.forEach((doc, i) => idByName.set(USERS[i].name, doc._id));
  console.log(`→ Inserted ${insertedUsers.length} users`);

  // ── Insert badges ──
  const now = Date.now();
  const badgeDocs = USERS.flatMap((u, ui) =>
    u.badges.map((b, bi) => {
      const difficulty = difficultyForScore(b.score);
      return {
        userId: idByName.get(u.name),
        challengeId: new Types.ObjectId(), // demo placeholder
        skillName: b.skill,
        domain: u.domain,
        difficulty,
        score: b.score,
        badgeSummary: badgeSummary(b.skill, difficulty),
        issuedAt: new Date(now - (ui * 4 + bi) * 36 * 60 * 60 * 1000),
      };
    })
  );
  const insertedBadges = await Badge.insertMany(badgeDocs);
  console.log(`→ Inserted ${insertedBadges.length} badges`);

  // ── Insert projects ──
  let taskTotal = 0;
  const projectDocs = PROJECTS.map((p) => {
    const ownerId = idByName.get(p.owner)!;

    const roles = p.roles.map((r) => ({
      title: r.title,
      description: r.description,
      requiredSkills: r.requiredSkills,
      importance: r.importance,
      isFilled: Boolean(r.filledBy),
      assignedUserId: r.filledBy ? idByName.get(r.filledBy) ?? null : null,
    }));

    // members = owner + everyone who fills a role (owner first, de-duped)
    const memberEntries: { userId: Types.ObjectId; role: string }[] = [
      { userId: ownerId, role: p.ownerRole },
    ];
    for (const r of p.roles) {
      if (!r.filledBy) continue;
      const uid = idByName.get(r.filledBy)!;
      if (uid.equals(ownerId)) continue;
      if (memberEntries.some((m) => m.userId.equals(uid))) continue;
      memberEntries.push({ userId: uid, role: r.title });
    }
    const members = memberEntries.map((m) => ({
      userId: m.userId,
      role: m.role,
      joinedAt: new Date(now - 14 * 24 * 60 * 60 * 1000),
    }));

    const tasks = p.tasks.map((t) => ({
      title: t.title,
      assignedTo: t.assignedTo ? idByName.get(t.assignedTo) ?? null : null,
      status: t.status,
      createdAt: new Date(now - 10 * 24 * 60 * 60 * 1000),
    }));
    taskTotal += tasks.length;

    return {
      ownerId,
      title: p.title,
      description: p.description,
      ownerRole: p.ownerRole,
      status: p.status,
      tags: p.tags,
      aiAnalysis: { ...p.analysis, analyzedAt: new Date() },
      roles,
      applications: [],
      members,
      tasks,
    };
  });
  const insertedProjects = await Project.insertMany(projectDocs);
  console.log(`→ Inserted ${insertedProjects.length} projects`);

  // ── Summary ──
  console.log("\n────────────────────────────────────────");
  console.log(
    `Seeded: ${insertedUsers.length} users, ${insertedBadges.length} badges, ${insertedProjects.length} projects, ${taskTotal} tasks`
  );
  console.log("Demo credentials: aarav.shah@email.com / Password123!");
  console.log("────────────────────────────────────────");
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
    process.exit(process.exitCode ?? 0);
  });
