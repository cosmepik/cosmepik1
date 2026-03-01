import { Leaf } from "lucide-react"

export function Footer() {
  return (
    <footer className="flex flex-col items-center gap-2 pb-8 pt-4">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Leaf className="h-4 w-4 text-primary" />
        <span className="text-xs font-medium">
          {"Powered by "}
          <span className="font-bold text-primary">{"CosmeLink"}</span>
        </span>
      </div>
      <p className="text-[10px] text-muted-foreground">
        {"K-Beauty Favorites Sharing Platform"}
      </p>
    </footer>
  )
}
