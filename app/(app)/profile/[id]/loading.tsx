export default function ProfileLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-10 p-6 md:p-8">
      {/* header */}
      <div className="rounded-3xl border border-border bg-surface/70 p-6 md:p-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <div className="size-24 rounded-full skeleton-shimmer md:size-28" />
            <div className="space-y-3">
              <div className="h-8 w-52 rounded-lg skeleton-shimmer" />
              <div className="h-5 w-40 rounded skeleton-shimmer" />
              <div className="h-4 w-72 rounded skeleton-shimmer" />
            </div>
          </div>
          <div className="flex gap-px overflow-hidden rounded-2xl border border-border">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 w-28 skeleton-shimmer" />
            ))}
          </div>
        </div>
      </div>

      {/* badges */}
      <div className="space-y-5">
        <div className="h-7 w-48 rounded-lg skeleton-shimmer" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-48 rounded-2xl border border-border bg-surface/60 skeleton-shimmer"
            />
          ))}
        </div>
      </div>

      {/* projects */}
      <div className="space-y-5">
        <div className="h-7 w-40 rounded-lg skeleton-shimmer" />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="h-40 rounded-2xl border border-border bg-surface/60 skeleton-shimmer"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
