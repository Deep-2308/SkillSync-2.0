import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
