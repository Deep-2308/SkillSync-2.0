export default function ResultLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6 md:p-8">
      {/* Verdict banner */}
      <div className="flex flex-col items-center justify-between gap-8 rounded-2xl border border-border bg-surface/70 p-8 md:flex-row md:p-10">
        <div className="flex items-center gap-5">
          <div className="size-16 shrink-0 rounded-full skeleton-shimmer md:size-20" />
          <div className="space-y-2.5">
            <div className="h-7 w-56 rounded-lg skeleton-shimmer" />
            <div className="h-4 w-72 rounded skeleton-shimmer" />
          </div>
        </div>
        <div className="h-14 w-32 rounded-lg skeleton-shimmer" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7">
          {/* Breakdown */}
          <div className="space-y-5 rounded-2xl border border-border bg-surface/70 p-6 md:p-8">
            <div className="h-6 w-44 rounded skeleton-shimmer" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-full rounded skeleton-shimmer" />
                <div className="h-2 w-full rounded-full skeleton-shimmer" />
              </div>
            ))}
          </div>
          {/* Feedback */}
          <div className="space-y-4 rounded-2xl border border-border bg-surface/70 p-6 md:p-8">
            <div className="h-6 w-48 rounded skeleton-shimmer" />
            <div className="h-24 w-full rounded-xl skeleton-shimmer" />
            <div className="grid gap-6 md:grid-cols-2">
              <div className="h-28 rounded-lg skeleton-shimmer" />
              <div className="h-28 rounded-lg skeleton-shimmer" />
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-5">
          <div className="h-[520px] rounded-3xl border border-border bg-surface/70 skeleton-shimmer" />
          <div className="h-44 rounded-2xl border border-border bg-surface/70 skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
}
