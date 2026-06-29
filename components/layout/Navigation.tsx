"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-6", className)} aria-hidden>
      <path
        d="M16 2 L28 9 V23 L16 30 L4 23 V9 Z"
        className="fill-primary/10 stroke-primary"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M17.5 7 L11 17.5 H15 L14.5 25 L21.5 13.5 H16.5 Z"
        className="fill-primary"
      />
    </svg>
  );
}

const NAV_LINKS = [
  { label: "How it Works", href: "/#how" },
  { label: "Explore Projects", href: "/projects/discover" },
  { label: "Pricing", href: "#", soon: true },
];

/** Sticky top navigation for the landing page and unauthenticated routes. */
export default function Navigation() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo />
          <span className="font-heading text-xl font-extrabold tracking-tight text-text">
            SkillSync
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-text"
            >
              {l.label}
              {l.soon && (
                <span className="rounded-full border border-border bg-surface-2 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-text-muted">
                  Soon
                </span>
              )}
            </Link>
          ))}
        </div>

        {/* Desktop auth buttons */}
        <div className="hidden items-center gap-2.5 md:flex">
          <Link
            href="/login"
            className="rounded-lg px-4 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-surface-2 hover:text-text"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-all hover:bg-accent/85 hover:shadow-[0_0_24px_-6px_var(--accent)]"
          >
            Get Started
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {/* Mobile hamburger */}
        <div className="md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="Open menu"
                className="grid size-9 place-items-center rounded-md border border-border text-text-muted transition-colors hover:border-primary/50 hover:text-primary"
              >
                <Menu size={18} />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-surface">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <div className="flex flex-col gap-1 p-4 pt-12">
                {NAV_LINKS.map((l) => (
                  <Link
                    key={l.label}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-1.5 rounded-md px-3 py-2.5 text-sm font-medium text-text-muted transition-colors hover:bg-surface-2 hover:text-text"
                  >
                    {l.label}
                    {l.soon && (
                      <span className="rounded-full border border-border bg-surface-2 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-text-muted">
                        Soon
                      </span>
                    )}
                  </Link>
                ))}
                <div className="my-2 h-px bg-border" />
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2.5 text-sm font-medium text-text transition-colors hover:bg-surface-2"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setOpen(false)}
                  className="mt-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground"
                >
                  Get Started
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
