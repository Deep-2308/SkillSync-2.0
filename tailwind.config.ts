import type { Config } from "tailwindcss";

/**
 * SkillSync — "Midnight Craft" design system.
 *
 * Tailwind v4 resolves its core theme from the `@theme` block in
 * app/globals.css. This config (loaded via `@config` in globals.css)
 * extends the palette and typography with the Midnight Craft tokens so
 * utilities like `bg-surface`, `text-ai`, `border-border`,
 * `text-text-muted`, and `font-heading` are available across the app.
 * Every color points at a CSS custom property authored in oklch().
 */
const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // base
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",

        // surfaces
        surface: {
          DEFAULT: "var(--surface)",
          2: "var(--surface-2)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },

        // brand
        primary: {
          DEFAULT: "var(--primary)", // #22D3EE sky blue — proven knowledge
          dark: "var(--primary-dark)", // #0891B2 hover
          foreground: "var(--primary-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)", // #F59E0B amber — earned achievement / CTA
          foreground: "var(--accent-foreground)",
        },
        ai: "var(--ai)", // #A78BFA violet — AI thinking states
        success: "var(--success)", // #4ADE80 green — passed / verified
        error: "var(--error)", // #F87171 red — failed / destructive
        destructive: "var(--destructive)",

        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },

        // text
        text: {
          DEFAULT: "var(--text)", // #E2E8F0 primary text
          muted: "var(--text-muted)", // #64748B secondary text
        },

        // charts
        chart: {
          1: "var(--chart-1)",
          2: "var(--chart-2)",
          3: "var(--chart-3)",
          4: "var(--chart-4)",
          5: "var(--chart-5)",
        },

        // sidebar
        sidebar: {
          DEFAULT: "var(--sidebar)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
      },
      fontFamily: {
        heading: ["var(--font-outfit)", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["var(--font-plus-jakarta)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "monospace"],
      },
      borderRadius: {
        sm: "calc(var(--radius) * 0.6)",
        md: "calc(var(--radius) * 0.8)",
        lg: "var(--radius)",
        xl: "calc(var(--radius) * 1.4)",
      },
    },
  },
  plugins: [],
};

export default config;
