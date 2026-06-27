"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const sidebarItems = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: "📊" },
    ],
  },
  {
    title: "Skills",
    items: [
      { label: "Prove Skills", href: "/skills/prove", icon: "🎯" },
    ],
  },
  {
    title: "Projects",
    items: [
      { label: "Discover", href: "/projects/discover", icon: "🔍" },
      { label: "Create", href: "/projects/create", icon: "➕" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r bg-background h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">
      <div className="flex flex-col gap-6 p-6">
        {sidebarItems.map((section) => (
          <div key={section.title}>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {section.title}
            </h3>
            <div className="flex flex-col gap-1">
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    pathname === item.href
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
