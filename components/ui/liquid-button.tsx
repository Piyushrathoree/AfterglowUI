"use client"

import * as React from "react"
import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  type HTMLMotionProps,
} from "motion/react"

import { LiquidGlass } from "@/components/ui/liquid-glass"
import { afterglow } from "@/lib/afterglow"
import { cn } from "@/lib/utils"

const sizes = {
  sm: "h-8 gap-1.5 px-3.5 text-[13px] [&_svg]:size-3.5",
  md: "h-10 gap-2 px-4.5 text-sm [&_svg]:size-4",
  lg: "h-12 gap-2 px-6 text-[15px] [&_svg]:size-[18px]",
  icon: "size-10 [&_svg]:size-[18px]",
}

// liquid glass swells when pressed and settles back with a little overshoot
const swell = { type: "spring", stiffness: 420, damping: 15, mass: 0.7 } as const

type LiquidButtonProps = Omit<HTMLMotionProps<"button">, "children"> & {
  size?: keyof typeof sizes
  /** tints the glass with the glow color, for the primary action */
  tinted?: boolean
  children?: React.ReactNode
}

function LiquidButton({
  size = "md",
  tinted = false,
  className,
  children,
  type = "button",
  onPointerEnter,
  onPointerMove,
  onPointerLeave,
  ...props
}: LiquidButtonProps) {
  const reduceMotion = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const light = useMotionValue(0)
  const glow = useMotionTemplate`radial-gradient(64px circle at ${x}px ${y}px, oklch(1 0 0 / 30%), transparent 70%)`

  function track(event: React.PointerEvent<HTMLButtonElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    // undo the press scale, so the light stays under the pointer
    const scale = rect.width / event.currentTarget.offsetWidth || 1
    x.set((event.clientX - rect.left) / scale)
    y.set((event.clientY - rect.top) / scale)
  }

  return (
    <motion.button
      data-slot="liquid-button"
      type={type}
      className={cn(
        "relative inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full font-medium whitespace-nowrap outline-none select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:text-muted-foreground",
        tinted ? "text-glow-foreground" : "text-foreground",
        sizes[size],
        className
      )}
      whileTap={{ scale: reduceMotion ? 1 : 1.08 }}
      transition={swell}
      onPointerEnter={(event) => {
        onPointerEnter?.(event)
        track(event)
        animate(light, 1, { duration: 0.2 })
      }}
      onPointerMove={(event) => {
        onPointerMove?.(event)
        track(event)
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event)
        animate(light, 0, { duration: afterglow.linger, ease: afterglow.ease })
      }}
      {...props}
    >
      <LiquidGlass
        aria-hidden
        className="absolute inset-0 rounded-[inherit]"
        tint={
          tinted ? "color-mix(in oklch, var(--glow) 72%, transparent)" : undefined
        }
      />
      {/* a soft light under the pointer, lingering after it leaves */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] mix-blend-plus-lighter"
        style={{ background: glow, opacity: light }}
      />
      <span className="relative inline-flex items-center gap-[inherit]">
        {children}
      </span>
    </motion.button>
  )
}

export { LiquidButton, type LiquidButtonProps }
