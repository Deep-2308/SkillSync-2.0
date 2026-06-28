---
inclusion: always
---

# Frontend Design Workflow

How to build any frontend / UI in this project. Follow this whenever a task
involves creating or editing a page, screen, or component.

## 1. Apply the design system skill

Use the **`frontend-design-system`** skill (`.kiro/skills/frontend-design-system/SKILL.md`)
as the source of truth for aesthetics: typography, color tokens, layout, depth,
motion, and component standards. Activate it before building any non-trivial UI
and run the Pre-Delivery Checklist before considering a page done.

Stay consistent with this project's existing "Midnight Craft" design tokens in
`app/globals.css` (CSS variables like `--primary`, `--accent`, `--ai`, `--surface`,
`--text`) and the Syne heading font. Never hardcode hex values in components —
use the tokens.

## 2. Use Stitch designs as the visual reference

All page designs already exist as HTML in **`D:\SkillSync 2.0\Stich Design`**.
When I name a page (e.g. "build the dashboard" or "evaluation results page"),
read the matching HTML file from that folder first and use it as the layout and
visual reference, then implement it as a proper Next.js + Tailwind + shadcn page
using this project's tokens and components.

Available design files (match by name, case-insensitive):

| Page | File |
|---|---|
| Landing | `LANDING PAGE.html` |
| Login / Signup | `LOGIN SIGNUP.html` |
| Onboarding — domain | `ONBOARDING FLOW step-1 Domain.html` |
| Onboarding — skills | `ONBOARDING FLOW step-2 skills.html` |
| Onboarding — profile | `ONBOARDING FLOW step-3 prfile.html` |
| Dashboard | `DASHBOARD.html` |
| Prove a skill | `PROVE A SKILL PAGE.html` |
| Evaluation results | `EVALUATION RESULTS PAGE.html` |
| Public profile | `PUBLIC PROFILE PAGE.html` |
| Project create | `PROJECT CREATE PAGE.html` |
| Project discovery feed | `PROJECT DISCOVERY FEED.html` |
| Project workspace | `PROJECT WORKSPACE.html` |

Treat the Stitch HTML as a design reference, not code to copy verbatim:
- Translate its layout, hierarchy, spacing, and states into React/Tailwind.
- Remap its raw colors/fonts onto this project's `globals.css` tokens.
- Reuse existing components in `components/ui` and `components/shared` instead of
  re-implementing primitives.

## 3. Use the 21st.dev Magic MCP for new components

When a genuinely new UI component is needed (something not already in
`components/ui` or `components/shared`), use the **@21st-dev/magic** MCP to
generate a starting point, then adapt it to this project's tokens, conventions,
and the `cn` helper from `@/lib/utils` before integrating.

## 4. Output expectations

- `"use client"` only when interactivity requires it.
- Respect `prefers-reduced-motion`.
- Skeleton loaders for async states, not spinners.
- Lucide icons only (no emojis as icons).
- Verify with `get_diagnostics` after edits.
