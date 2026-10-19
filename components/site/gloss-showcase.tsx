import { Flame, Sparkles } from "lucide-react"
import { GlossButton } from "@/components/ui/gloss-button"

export function GlossButtonsShowcase() {
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <GlossButton>
          <Flame />
          Ignite
        </GlossButton>
        <GlossButton variant="glass">Frosted glass</GlossButton>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <GlossButton size="sm">Small</GlossButton>
        <GlossButton size="lg" variant="glass">
          <Sparkles />
          Large
        </GlossButton>
      </div>
    </div>
  )
}
