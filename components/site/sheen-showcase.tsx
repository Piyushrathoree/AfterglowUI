import { AfterglowMark } from "@/components/ui/auth-parts"
import { SheenCard } from "@/components/ui/sheen-card"

export function SheenPassShowcase() {
  return (
    <SheenCard className="flex aspect-[1.586] w-full max-w-sm flex-col justify-between p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AfterglowMark className="size-[18px]" />
          <span className="text-sm font-medium tracking-tight">afterglow</span>
        </div>
        <span className="font-mono text-[11px] tracking-widest text-muted-foreground">
          PASS
        </span>
      </div>
      <div className="h-8 w-11 rounded-md bg-linear-to-br from-glow/90 via-[color-mix(in_oklch,var(--glow),white_35%)] to-glow-2/80 shadow-gloss" />
      <div>
        <p className="font-mono text-sm tracking-[0.2em] text-foreground/90">
          •••• •••• •••• 2026
        </p>
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>Night Owl</span>
          <span>since 2026</span>
        </div>
      </div>
    </SheenCard>
  )
}
