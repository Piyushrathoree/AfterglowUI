import * as React from "react"

import { MetalRim } from "@/components/ui/liquid-metal"
import { cn } from "@/lib/utils"

type MetalCardProps = React.ComponentProps<"div"> & {
  /** thickness of the metal frame in px */
  frame?: number
}

// a dark card edged in a hairline of flowing chrome
function MetalCard({ frame = 1, className, children, ...props }: MetalCardProps) {
  return (
    <div
      data-slot="metal-card"
      className={cn(
        "relative isolate rounded-3xl bg-card text-card-foreground shadow-[0_24px_60px_-28px_oklch(0_0_0/70%),0_1px_2px_oklch(0_0_0/20%)]",
        className
      )}
      {...props}
    >
      <MetalRim width={frame} />
      {children}
    </div>
  )
}

export { MetalCard, type MetalCardProps }
