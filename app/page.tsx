import dynamic from "next/dynamic";

/**
 * Landing page — server component shell.
 *
 * The heavy animated UI (framer-motion, lucide icons, sonner) lives in
 * LandingContent, which is loaded via `dynamic()`. This lets Next.js
 * send the static HTML skeleton instantly while the client bundle
 * streams in parallel. The result is a noticeably faster perceived load.
 */

const LandingContent = dynamic(
  () => import("@/components/landing/LandingContent"),
  {
    ssr: true,
    loading: () => <LandingSkeleton />,
  }
);

export default function HomePage() {
  return <LandingContent />;
}

// ─── Lightweight skeleton shown while the JS bundle loads ───────────────────
function LandingSkeleton() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-text">
      {/* ambient backdrop */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -left-40 -top-40 size-[36rem] rounded-full bg-primary/[0.10] blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 size-[36rem] rounded-full bg-accent/[0.08] blur-[120px]" />
      </div>

      {/* Nav skeleton */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="size-7 rounded bg-surface-2 skeleton-shimmer" />
            <div className="h-5 w-24 rounded bg-surface-2 skeleton-shimmer" />
          </div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-16 rounded-lg bg-surface-2 skeleton-shimmer" />
            <div className="h-9 w-24 rounded-lg bg-accent/20 skeleton-shimmer" />
          </div>
        </nav>
      </header>

      {/* Hero skeleton */}
      <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 pb-20 pt-36 lg:grid-cols-[1fr_minmax(0,46%)] lg:pt-44">
        <div>
          <div className="h-7 w-56 rounded-full bg-surface-2 skeleton-shimmer" />
          <div className="mt-6 space-y-3">
            <div className="h-14 w-full max-w-md rounded bg-surface-2 skeleton-shimmer" />
            <div className="h-14 w-3/4 rounded bg-surface-2 skeleton-shimmer" />
          </div>
          <div className="mt-6 h-6 w-full max-w-[520px] rounded bg-surface-2 skeleton-shimmer" />
          <div className="mt-2 h-6 w-3/4 max-w-[520px] rounded bg-surface-2 skeleton-shimmer" />
          <div className="mt-9 flex gap-3">
            <div className="h-12 w-44 rounded-xl bg-accent/20 skeleton-shimmer" />
            <div className="h-12 w-40 rounded-xl bg-surface-2 skeleton-shimmer" />
          </div>
        </div>
        <div className="mx-auto h-80 w-full max-w-sm rounded-3xl border border-primary/20 bg-surface/60 skeleton-shimmer" />
      </section>
    </div>
  );
}
