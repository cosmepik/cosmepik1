export default function PublicPageLoading() {
  return (
    <div className="min-h-screen w-full">
      <div className="mx-auto flex max-w-[400px] flex-col gap-6 px-4 py-8">
        {/* Logo skeleton */}
        <div className="flex justify-center">
          <div className="h-6 w-24 animate-pulse rounded bg-muted/50" />
        </div>

        {/* Avatar + name skeleton */}
        <div className="flex flex-col items-center gap-3">
          <div className="h-20 w-20 animate-pulse rounded-full bg-muted/50" />
          <div className="h-5 w-32 animate-pulse rounded bg-muted/40" />
          <div className="h-4 w-48 animate-pulse rounded bg-muted/30" />
        </div>

        {/* SNS icons skeleton */}
        <div className="flex justify-center gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-11 w-11 animate-pulse rounded-full bg-muted/30"
            />
          ))}
        </div>

        {/* Section skeleton */}
        <div className="space-y-4">
          <div className="h-5 w-40 animate-pulse rounded bg-muted/40" />
          <div className="h-24 animate-pulse rounded-xl bg-muted/30" />
          <div className="h-24 animate-pulse rounded-xl bg-muted/25" />
        </div>
      </div>
    </div>
  );
}
