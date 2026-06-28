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

/* ------------------------------------------------------------------ */
/* Lightning-bolt brand icon (inline SVG, 24×24)                       */
/* ------------------------------------------------------------------ */
function BoltIcon({ className }: { className?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M13 2L4.09 12.64a1 1 0 0 0 .78 1.63H11l-1 7.73L19.91 11.36a1 1 0 0 0-.78-1.63H13l1-7.73Z"
        fill="currentColor"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Navigation items                                                    */
/* ------------------------------------------------------------------ */
const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Prove a Skill", href: "/skills/prove", icon: Zap },
  { label: "My Projects", href: "/projects/my", icon: FolderOpen },
  { label: "Discover Projects", href: "/projects/discover", icon: Compass },
];

/* ------------------------------------------------------------------ */
/* Initials helper                                                     */
/* ------------------------------------------------------------------ */
function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/* ------------------------------------------------------------------ */
/* Sidebar                                                             */
/* ------------------------------------------------------------------ */
export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const userId = session?.user?.id;

  /** Check whether a nav item is currently active. */
  function isActive(href: string): boolean {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <aside
      className="flex flex-col justify-between"
      style={{
        width: 240,
        minWidth: 240,
        height: "100vh",
        backgroundColor: "#10131E",
        borderRight: "1px solid #1E2533",
      }}
    >
      {/* ── Top: brand + nav ── */}
      <div>
        {/* Brand */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 px-5 py-5"
        >
          <BoltIcon className="text-[#22D3EE]" />
          <span
            className="text-lg font-bold tracking-tight"
            style={{ fontFamily: "'Syne', sans-serif", color: "#E2E8F0" }}
          >
            SkillSync
          </span>
        </Link>

        {/* Nav */}
        <nav className="mt-2 flex flex-col gap-0.5 px-3">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-md px-3 py-2.5 text-[13px] font-medium transition-colors duration-150",
                  active
                    ? "border-l-[3px] border-[#22D3EE] bg-[#161A28] text-[#22D3EE] pl-[9px]"
                    : "border-l-[3px] border-transparent text-[#94A3B8] hover:bg-[#161A28] hover:text-[#CBD5E1] pl-[9px]"
                )}
              >
                <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
                {item.label}
              </Link>
            );
          })}

          {/* Profile link (depends on userId) */}
          {userId && (
            <Link
              href={`/profile/${userId}`}
              className={cn(
                "group flex items-center gap-3 rounded-md px-3 py-2.5 text-[13px] font-medium transition-colors duration-150",
                pathname.startsWith("/profile")
                  ? "border-l-[3px] border-[#22D3EE] bg-[#161A28] text-[#22D3EE] pl-[9px]"
                  : "border-l-[3px] border-transparent text-[#94A3B8] hover:bg-[#161A28] hover:text-[#CBD5E1] pl-[9px]"
              )}
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
        {/* Start a Project CTA */}
        <Link
          href="/projects/create"
          className="flex w-full items-center justify-center gap-2 rounded-md px-3 py-2.5 text-sm font-semibold transition-colors duration-150 hover:opacity-90"
          style={{ backgroundColor: "#F59E0B", color: "#0A0C14" }}
        >
          <Plus size={16} strokeWidth={2.5} />
          Start a Project
        </Link>

        {/* Separator */}
        <div className="my-3 h-px" style={{ backgroundColor: "#1E2533" }} />

        {/* User info + logout */}
        <div className="flex items-center gap-3">
          {/* Avatar */}
          {session?.user?.image ? (
            <img
              src={session.user.image}
              alt={session.user.name ?? "Avatar"}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
              style={{ backgroundColor: "#22D3EE", color: "#0A0C14" }}
            >
              {getInitials(session?.user?.name)}
            </div>
          )}

          {/* Name + domain */}
          <div className="flex-1 min-w-0">
            <p
              className="truncate text-sm font-medium"
              style={{ color: "#E2E8F0" }}
            >
              {session?.user?.name ?? "User"}
            </p>
            {session?.user?.primaryDomain && (
              <p
                className="truncate text-xs"
                style={{ color: "#64748B" }}
              >
                {session.user.primaryDomain}
              </p>
            )}
          </div>

          {/* Logout */}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="rounded-md p-1.5 transition-colors duration-150 hover:bg-[#161A28]"
            style={{ color: "#64748B" }}
            aria-label="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
