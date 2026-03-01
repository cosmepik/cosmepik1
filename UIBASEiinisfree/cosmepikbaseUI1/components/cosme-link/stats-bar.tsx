export function StatsBar() {
  return (
    <div className="flex items-center justify-around rounded-xl bg-card px-4 py-3 shadow-sm">
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-lg font-bold text-foreground">{"24"}</span>
        <span className="text-[10px] text-muted-foreground">{"アイテム"}</span>
      </div>
      <div className="h-8 w-px bg-border" />
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-lg font-bold text-foreground">{"1.2K"}</span>
        <span className="text-[10px] text-muted-foreground">{"フォロワー"}</span>
      </div>
      <div className="h-8 w-px bg-border" />
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-lg font-bold text-foreground">{"856"}</span>
        <span className="text-[10px] text-muted-foreground">{"いいね"}</span>
      </div>
    </div>
  )
}
