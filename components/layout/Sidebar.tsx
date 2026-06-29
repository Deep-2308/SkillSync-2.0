"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Zap,
  FolderOpen,
  Compass,
  User,
  Plus,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* Lightning bolt inside a hexagon — brand mark. */
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

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Prove a Skill", href: "/skills/prove", icon: Zap },
  { label: "My Projects", href: "/projects/my", icon: FolderOpen },
  { label: "Discover Projects", href: "/projects/discover", icon: Compass },
];

function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userId = session?.user?.id;

  function isActive(href: string): boolean {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const linkClass = (active: boolean) =>
    cn(
      "group flex items-center gap-3 rounded-md py-2.5 pl-[9px] pr-3 text-[13px] font-medium transition-colors duration-150",
      active
        ? "border-l-[3px] border-primary bg-surface-2 text-primary"
        : "border-l-[3px] border-transparent text-text-muted hover:bg-surface-2 hover:text-text"
    );

  return (
    <aside
      className="flex h-dvh w-60 min-w-60 flex-col justify-between border-r border-border bg-surface"
    >
      {/* ── Top: brand + nav ── */}
      <div className="min-h-0 overflow-y-auto">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="flex items-center gap-2.5 px-5 py-5"
        >
          <Logo />
          <span className="font-heading text-lg font-bold tracking-tight text-text">
            SkillSync
          </span>
        </Link>

        <nav className="mt-2 flex flex-col gap-0.5 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={linkClass(active)}
              >
                <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
                {item.label}
              </Link>
            );
          })}

          {userId && (
            <Link
              href={`/profile/${userId}`}
              onClick={onNavigate}
              className={linkClass(pathname.startsWith("/profile"))}
            >
              <User
                size={18}
                strokeWidth={pathname.startsWith("/profile") ? 2.2 : 1.8}
              />
              My Profile
            </Link>
          )}
        </nav>
      </div>

      {/* ── Bottom: CTA + user ── */}
      <div className="px-3 pb-4">
        <Link
          href="/projects/create"
          onClick={onNavigate}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-accent px-3 py-2.5 text-sm font-semibold text-accent-foreground transition-all hover:bg-accent/85 hover:shadow-[0_0_20px_-6px_var(--accent)]"
        >
          <Plus size={16} strokeWidth={2.5} />
          New Project
        </Link>

        <div className="my-3 h-px bg-border" />

        <div className="flex items-center gap-3">
          {session?.user?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={session.user.image}
              alt={session.user.name ?? "Avatar"}
              className="size-8 rounded-full object-cover"
            />
          ) : (
            <div className="grid size-8 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {getInitials(session?.user?.name)}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-text">
              {session?.user?.name ?? "User"}
            </p>
            {session?.user?.primaryDomain && (
              <p className="truncate text-xs text-text-muted">
                {session.user.primaryDomain}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-surface-2 hover:text-text"
            aria-label="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
