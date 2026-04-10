export default function BlogListLoading() {
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
        <div className="h-7 w-48 rounded bg-muted mb-6 animate-pulse" />
        <div className="space-y-0 border border-dashed border-muted-foreground/30">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2 animate-pulse" style={i > 0 ? { borderTop: "1.5px dashed #ccc" } : undefined}>
              <div className="h-[72px] w-[72px] shrink-0 rounded-lg bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-16 rounded bg-muted" />
                <div className="h-4 w-3/4 rounded bg-muted" />
                <div className="h-3 w-20 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
