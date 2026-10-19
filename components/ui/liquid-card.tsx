"use client"

import * as React from "react"
import { motion, useReducedMotion, useSpring, type HTMLMotionProps } from "motion/react"

import { LiquidGlass, type LiquidGlassProps } from "@/components/ui/liquid-glass"
import { cn } from "@/lib/utils"

type LiquidCardProps = Omit<HTMLMotionProps<"div">, "children"> & {
  /** passed to the glass, e.g. a tint for a colored widget */
  glass?: Omit<LiquidGlassProps, "className" | "children">
  children?: React.ReactNode
}

/*
 * A glass card or widget. Under the pointer it swells a touch and nothing
 * else changes: no glow and no extra tint, so the glass stays exactly as clear.
 * It stays flat on purpose: a 3D tilt puts the glass in a 3D rendering
 * context, where Chrome can't draw a backdrop filter correctly.
 */
function LiquidCard({
  glass,
  className,
  children,
  style,
  onPointerEnter,
  onPointerLeave,
  ...props
}: LiquidCardProps) {
  const reduceMotion = useReducedMotion()
  const scale = useSpring(1, { stiffness: 380, damping: 30, mass: 0.6 })

  return (
    <motion.div
      data-slot="liquid-card"
      className={cn("relative rounded-[28px] p-5 text-foreground", className)}
      style={{ scale, ...style }}
      onPointerEnter={(event) => {
        onPointerEnter?.(event)
        if (event.pointerType !== "touch" && !reduceMotion) scale.set(1.015)
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event)
        scale.set(1)
      }}
      {...props}
    >
      {/* a thick rim and a little frost: thick glass reads as glass, thin glass reads as a window */}
      <LiquidGlass className="absolute inset-0 rounded-[inherit]" bezel={34} frost={3} magnify={0.03} {...glass} />
      <div className="relative h-full">{children}</div>
    </motion.div>
  )
}

export { LiquidCard, type LiquidCardProps }
