---
name: frontend-design-system
version: 2.0
description: Universal frontend design skill — aesthetics, tokens, typography, motion, and UI guidelines for building any website or web app.
---

# Universal Frontend Design System

A universal skill for building **distinctive, production-quality frontends** for any website, web app, SaaS, portfolio, landing page, or tool. Apply these principles regardless of the project type or context.

---

## Core Philosophy

> Never produce generic, "on distribution" UI. Avoid the "AI slop" aesthetic — make frontends that are creative, distinctive, and feel genuinely designed for the specific context.

Every project deserves a unique visual identity. Read the project's purpose, audience, and tone before picking any font, color, or layout. Then commit to a specific aesthetic direction and execute it with confidence.

---

## Step 1 — Read the Context First

Before writing a single line of CSS, answer these:

- **What is this product/site for?** (SaaS, portfolio, e-commerce, blog, tool, landing page…)
- **Who is the audience?** (developers, consumers, executives, students, creatives…)
- **What is the emotional tone?** (bold, calm, playful, serious, futuristic, minimal…)
- **Light or dark?** Choose intentionally — don't default to light every time.

Your aesthetic choices must follow directly from these answers.

---

## Step 2 — Typography

Choose fonts that are **beautiful, unique, and interesting**. The font choice should feel intentional and context-specific.

**Rules:**

- Avoid overused fonts: Inter, Roboto, Arial, system-ui, Space Grotesk, Poppins
- Use Google Fonts or variable fonts for performance
- Pair a distinctive heading font with a clean, readable body font
- Scale: establish a type scale (sm / base / lg / xl / 2xl / 3xl / 4xl) using `rem`

**Inspiration by context:**

| Context | Heading Ideas | Body Ideas |
|---|---|---|
| Tech / Dev tool | Geist Mono, JetBrains Mono, Fragment Mono | Geist, IBM Plex Sans |
| Creative / Agency | Playfair Display, Cormorant, Fraunces | Instrument Sans, Libre Franklin |
| Startup / SaaS | Syne, Outfit, Cabinet Grotesk | Figtree, Plus Jakarta Sans |
| Minimal / Portfolio | Editorial New, Spectral | DM Sans, Manrope |
| Bold / Impactful | Anton, Bebas Neue, Archivo Black | Source Sans 3 |

> These are starting points, not defaults. Think beyond the table.

---

## Step 3 — Color & Theme

Commit to a **cohesive, intentional palette**. Use CSS variables throughout — never hardcode hex values in components.

**Rules:**

- Pick 1 dominant color, 1 sharp accent, neutrals for surface/text
- Dominant + sharp accent outperforms timid, evenly-distributed palettes
- Draw inspiration from: IDE themes, film color grading, cultural aesthetics, material textures
- Avoid: purple gradients on white, teal-on-dark clichés, generic blue SaaS palettes

**Token structure (always use this):**

```css
:root {
  --color-primary: /* main brand color */;
  --color-primary-foreground: /* text on primary */;
  --color-secondary: /* supporting color */;
  --color-accent: /* CTA / highlight */;
  --color-background: /* page background */;
  --color-foreground: /* primary text */;
  --color-muted: /* subtle backgrounds, cards */;
  --color-muted-foreground: /* secondary text */;
  --color-border: /* dividers, outlines */;
  --color-destructive: /* errors, danger */;
  --color-ring: /* focus rings */;
}
```

**Palette examples by aesthetic:**

| Aesthetic | Background | Primary | Accent |
|---|---|---|---|
| Dark terminal | `#0D0D0D` | `#00FF88` | `#FF4D4D` |
| Warm editorial | `#FAF7F2` | `#1A1A1A` | `#C9452A` |
| Ocean SaaS | `#F0F7FF` | `#0057B8` | `#00C2A8` |
| Midnight AI | `#0F0F1A` | `#7B61FF` | `#00E5FF` |
| Earthy minimal | `#F5F0E8` | `#2D2416` | `#8B6914` |

> Don't copy these. Use them to understand the pattern — dominant + sharp accent.

---

## Step 4 — Layout & Pattern

Match the layout pattern to the site's purpose:

| Site Type | Pattern |
|---|---|
| Landing / SaaS | Hero → Features → Social Proof → CTA |
| Portfolio | Intro → Work → About → Contact |
| Blog / Editorial | Header → Feed → Sidebar → Footer |
| Dashboard / App | Sidebar Nav → Main Content → Detail Panel |
| E-commerce | Hero → Categories → Products → CTA |

**CTA placement:** Always above the fold + repeated after the key value section.

---

## Step 5 — Backgrounds & Depth

Never default to a flat solid background. Create atmosphere.

**Techniques:**

- **Gradient mesh:** `radial-gradient` layered at multiple positions
- **Noise texture:** subtle SVG or CSS `filter: url(#noise)` overlay
- **Geometric pattern:** repeating SVG lines, dots, or grids at low opacity
- **Glassmorphism:** `backdrop-filter: blur()` on cards over a gradient bg
- **Dark vignette:** edge-darkened backgrounds for dramatic depth

```css
/* Example: atmospheric gradient background */
background:
  radial-gradient(ellipse at 20% 50%, var(--color-primary) 0%, transparent 50%),
  radial-gradient(ellipse at 80% 20%, var(--color-accent) 0%, transparent 40%),
  var(--color-background);
```

---

## Step 6 — Motion & Interaction

**Philosophy:** One well-orchestrated page load with staggered reveals creates more delight than dozens of scattered micro-interactions.

**For HTML/CSS — prefer CSS-only:**

```css
/* Staggered reveal on load */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
.hero-title { animation: fadeUp 0.5s ease 0.1s both; }
.hero-sub   { animation: fadeUp 0.5s ease 0.25s both; }
.hero-cta   { animation: fadeUp 0.5s ease 0.4s both; }
```

**For React — use Motion library:**

```jsx
import { motion } from 'motion/react';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.2 }}
/>
```

**High-value micro-interactions:**

- Button hover: subtle scale + shadow lift
- Card hover: border glow or background shift
- Input focus: ring expand animation
- Loading states: skeleton shimmer, not spinners
- Transitions: 150–200ms ease (snappy), 300ms ease (smooth reveals)

**Always respect:**

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Step 7 — Component Standards

**Buttons:**

- Primary: filled with `--color-primary`, hover lifts with shadow
- Secondary: outlined or ghost
- Destructive: uses `--color-destructive`
- All: `cursor-pointer`, min touch target 44px, visible focus ring

**Cards:**

- Background: `--color-muted` or semi-transparent
- Border: 1px `--color-border`
- Radius: consistent (`--radius`, typically 8–16px)
- Hover: subtle border/shadow change, 200ms transition

**Forms / Inputs:**

- Focus: `outline: 2px solid var(--color-ring)` with `outline-offset: 2px`
- Error state: `--color-destructive` border + helper text
- Label always visible (never rely on placeholder as label)

**Icons:**

- Use SVG only: Heroicons, Lucide, Phosphor
- Never use emojis as icons

---

## Pre-Delivery Checklist

- [ ] No emojis as icons — SVG only (Heroicons / Lucide / Phosphor)
- [ ] `cursor-pointer` on all interactive elements
- [ ] Hover states on all buttons, links, cards (150–300ms transition)
- [ ] Text contrast ≥ 4.5:1 (WCAG AA) — check with contrast checker
- [ ] Focus rings visible for keyboard navigation
- [ ] `prefers-reduced-motion` handled
- [ ] Responsive at: 375px / 768px / 1024px / 1440px
- [ ] All touch targets ≥ 44px
- [ ] Semantic HTML (correct heading hierarchy, landmark elements)
- [ ] No hardcoded hex values in components — CSS variables only
- [ ] Dark / Light mode variables defined if both modes are supported
- [ ] Skeleton loaders for async content (not spinners)

---

## What to Always Avoid

- Generic font families: Inter, Roboto, Arial, system-ui, Space Grotesk (as default)
- Purple-gradient-on-white — the most clichéd AI UI pattern
- Cookie-cutter hero: big heading + subtext + two buttons + stock image
- Centered everything with no visual hierarchy
- Overusing glassmorphism without a background that makes it meaningful
- Scattered micro-interactions with no cohesive motion language
- Hardcoded colors — always use CSS variables
- Placeholder text as the only label on inputs
