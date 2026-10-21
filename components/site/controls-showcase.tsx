import { ChevronLeft } from "@/components/animate-ui/icons/chevron-left"
import { ChevronRight } from "@/components/animate-ui/icons/chevron-right"
import { Share } from "@/components/animate-ui/icons/share"
import { LiquidButton } from "@/components/ui/liquid-button"
import { ControlCenterDemo } from "./liquid-demos"

export function ControlCenterShowcase() {
  return (
    <div className="flex w-full flex-col items-center gap-8 py-4">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <LiquidButton size="icon" aria-label="Back">
          <ChevronLeft />
        </LiquidButton>
        <LiquidButton size="icon" aria-label="Forward">
          <ChevronRight />
        </LiquidButton>
        <LiquidButton>
          <Share />
          Share
        </LiquidButton>
        <LiquidButton tinted>Done</LiquidButton>
      </div>
      <ControlCenterDemo />
    </div>
  )
}
