import type { Metadata } from "next";
import { Fraunces, Geist } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "wght"],
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const TITLE = "SkillSync — Prove Your Skills. Find Your Builders.";
const DESCRIPTION =
  "Stop self-reporting skills nobody believes. Complete AI-generated challenges, earn verified badges, and find co-builders who trust your proof.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s · SkillSync",
  },
  description: DESCRIPTION,
  applicationName: "SkillSync",
  keywords: [
    "skill verification",
    "AI challenges",
    "verified badges",
    "developer portfolio",
    "find co-builders",
    "proof of skill",
  ],
  authors: [{ name: "SkillSync" }],
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "SkillSync",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

function FilmGrain() {
  return (
    <div className="pointer-events-none fixed inset-0 z-50 mix-blend-overlay opacity-[0.04]">
      <svg className="absolute inset-0 h-full w-full opacity-50" xmlns="http://www.w3.org/2000/svg">
        <filter id="grainFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grainFilter)" />
      </svg>
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`dark ${fraunces.variable} ${geistSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans selection:bg-[var(--color-ember)] selection:text-[var(--color-canvas)]">
        <FilmGrain />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
