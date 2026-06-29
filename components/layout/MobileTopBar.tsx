"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Sidebar from "@/components/layout/Sidebar";

/** Mobile-only top bar with a slide-in Sheet containing the full sidebar. */
export default function MobileTopBar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur-xl md:hidden">
      <Link href="/dashboard" className="flex items-center gap-2">
        <svg viewBox="0 0 32 32" className="size-6" aria-hidden>
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
        <span className="font-heading text-lg font-bold tracking-tight text-text">
          SkillSync
        </span>
      </Link>

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
        <SheetContent
          side="left"
          showCloseButton={false}
          className="w-60 max-w-60 border-r border-border bg-surface p-0"
        >
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <Sidebar onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </header>
  );
}
