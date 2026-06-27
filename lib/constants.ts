/**
 * Shared, framework-agnostic constants.
 *
 * IMPORTANT: keep this file free of server-only imports (mongoose, bcrypt,
 * etc.) so it can be safely bundled into client components.
 */

export const PRIMARY_DOMAINS = [
  "Frontend Dev",
  "UI/UX Design",
  "Backend Dev",
  "Data Analysis",
  "Product Management",
  "Content Writing",
  "Marketing",
  "DevOps/Cloud",
] as const;

export type PrimaryDomain = (typeof PRIMARY_DOMAINS)[number];

/** Lucide icon name used for each domain card (resolved in the UI layer). */
export interface DomainMeta {
  value: PrimaryDomain;
  label: string;
  icon: string;
  description: string;
}

export const DOMAINS: DomainMeta[] = [
  {
    value: "Frontend Dev",
    label: "Frontend Dev",
    icon: "Code2",
    description: "Interfaces, interactions, and the browser.",
  },
  {
    value: "UI/UX Design",
    label: "UI/UX Design",
    icon: "Palette",
    description: "Research, flows, and visual systems.",
  },
  {
    value: "Backend Dev",
    label: "Backend Dev",
    icon: "Server",
    description: "APIs, data, and server logic.",
  },
  {
    value: "Data Analysis",
    label: "Data Analysis",
    icon: "BarChart2",
    description: "Insights, models, and visualization.",
  },
  {
    value: "Product Management",
    label: "Product Mgmt",
    icon: "Boxes",
    description: "Strategy, roadmaps, and delivery.",
  },
  {
    value: "Content Writing",
    label: "Content Writing",
    icon: "PenLine",
    description: "Docs, articles, and copy.",
  },
  {
    value: "Marketing",
    label: "Marketing",
    icon: "Megaphone",
    description: "Growth, brand, and campaigns.",
  },
  {
    value: "DevOps/Cloud",
    label: "DevOps/Cloud",
    icon: "Cloud",
    description: "Pipelines, infra, and reliability.",
  },
];

export const SKILLS_BY_DOMAIN: Record<PrimaryDomain, string[]> = {
  "Frontend Dev": [
    "React",
    "TypeScript",
    "Next.js",
    "CSS/Tailwind",
    "JavaScript",
    "Vue.js",
    "HTML Semantics",
    "Web Performance",
  ],
  "UI/UX Design": [
    "Figma",
    "User Research",
    "Wireframing",
    "Design Systems",
    "Prototyping",
    "Accessibility",
    "UX Writing",
    "Motion Design",
  ],
  "Backend Dev": [
    "Node.js",
    "Python",
    "REST APIs",
    "GraphQL",
    "PostgreSQL",
    "MongoDB",
    "Redis",
    "System Design",
  ],
  "Data Analysis": [
    "Python/Pandas",
    "SQL",
    "Data Visualization",
    "Statistics",
    "Machine Learning Basics",
    "Excel/Sheets",
    "Tableau",
    "NumPy",
  ],
  "Product Management": [
    "PRD Writing",
    "User Stories",
    "Roadmapping",
    "A/B Testing",
    "Analytics",
    "Competitive Analysis",
    "Agile/Scrum",
    "OKRs",
  ],
  "Content Writing": [
    "Technical Writing",
    "Blog Writing",
    "SEO Content",
    "UX Writing",
    "Email Copywriting",
    "Social Media",
    "Video Scripts",
    "Case Studies",
  ],
  Marketing: [
    "Go-to-Market Strategy",
    "Social Media Marketing",
    "Email Marketing",
    "Google Ads",
    "Analytics/GA4",
    "Brand Strategy",
    "Content Marketing",
    "SEO",
  ],
  "DevOps/Cloud": [
    "Docker",
    "AWS",
    "CI/CD Pipelines",
    "Kubernetes",
    "Linux",
    "Terraform",
    "Monitoring",
    "GitHub Actions",
  ],
};

export const MAX_SKILLS = 8;
