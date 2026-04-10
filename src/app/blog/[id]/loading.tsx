export default function BlogDetailLoading() {
  return (
    <main
      className="min-h-screen"
      style={{
        backgroundColor: "#f5f0e8",
        backgroundImage: "linear-gradient(to right, #e5e5e5 1px, transparent 1px), linear-gradient(#e5e5e5 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
    >
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center gap-2">
            <div className="h-6 w-20 rounded-full bg-muted" />
          </div>
          <div className="h-7 w-3/4 rounded bg-muted" />
          <div className="mx-auto aspect-square w-2/3 rounded-xl bg-muted" />
          <div className="space-y-3">
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-4 w-5/6 rounded bg-muted" />
            <div className="h-4 w-4/6 rounded bg-muted" />
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-4 w-3/4 rounded bg-muted" />
          </div>
        </div>
      </div>
    </main>
  );
}
