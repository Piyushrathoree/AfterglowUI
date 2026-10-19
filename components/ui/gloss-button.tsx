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

import { afterglow, spring } from "@/lib/afterglow"
import { cn } from "@/lib/utils"

const surfaces = {
  ember:
    "bg-linear-to-b from-[color-mix(in_oklch,var(--glow),white_22%)] via-glow to-[color-mix(in_oklch,var(--glow),var(--glow-2)_35%)] shadow-gloss inset-shadow-[0_1px_0_0_oklch(1_0_0/45%)]",
  glass: "bg-glass shadow-glass backdrop-blur-md backdrop-saturate-150",
}

const sizes = {
  sm: "h-8 gap-1.5 px-3.5 text-[13px] [&_svg]:size-3.5",
  md: "h-10 gap-2 px-5 text-sm [&_svg]:size-4",
  lg: "h-12 gap-2.5 px-6 text-[15px] [&_svg]:size-[18px]",
}

type GlossButtonProps = Omit<HTMLMotionProps<"button">, "children"> & {
  variant?: keyof typeof surfaces
  size?: keyof typeof sizes
  children?: React.ReactNode
}

function GlossButton({
  variant = "ember",
  size = "md",
  className,
  children,
  type = "button",
  onPointerEnter,
  onPointerMove,
  onPointerLeave,
  ...props
}: GlossButtonProps) {
  const reduceMotion = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const shine = useMotionValue(0)

  const ember = variant === "ember"
  const hotspot = useMotionTemplate`radial-gradient(80px circle at ${x}px ${y}px, ${
    ember ? "oklch(1 0 0 / 40%)" : "color-mix(in oklch, var(--glow) 30%, transparent)"
  }, transparent 70%)`

  function track(event: React.PointerEvent<HTMLButtonElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    x.set(event.clientX - rect.left)
    y.set(event.clientY - rect.top)
  }

  return (
    <motion.button
      data-slot="gloss-button"
      data-variant={variant}
      type={type}
      className={cn(
        "group relative isolate inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full font-medium whitespace-nowrap outline-none select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50",
        ember ? "text-glow-foreground" : "text-foreground",
        sizes[size],
        className
      )}
      whileTap={{ scale: reduceMotion ? 1 : 0.96 }}
      transition={spring("snappy")}
      onPointerEnter={(event) => {
        onPointerEnter?.(event)
        track(event)
        animate(shine, 1, { duration: 0.2 })
      }}
      onPointerMove={(event) => {
        onPointerMove?.(event)
        track(event)
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event)
        // the hotspot stays where the pointer left and fades out slowly
        animate(shine, 0, { duration: afterglow.linger, ease: afterglow.ease })
      }}
      {...props}
    >
      {ember && (
        <span
          aria-hidden
          className="absolute inset-x-2 top-1.5 -bottom-1 -z-10 rounded-[inherit] bg-glow opacity-45 blur-lg transition-opacity duration-300 group-hover:opacity-75 group-active:opacity-55"
        />
      )}
      <span
        aria-hidden
        className={cn("absolute inset-0 -z-10 rounded-[inherit]", surfaces[variant])}
      />
      {/* specular sheen across the upper half, dims while pressed */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-[3px] top-px h-[48%] rounded-[inherit] bg-linear-to-b to-transparent transition-opacity duration-150 group-active:opacity-50",
          ember ? "from-white/40" : "from-gloss-highlight"
        )}
      />
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{ background: hotspot, opacity: shine }}
      />
      <span className="relative inline-flex items-center gap-[inherit]">
        {children}
      </span>
    </motion.button>
  )
}

export { GlossButton, type GlossButtonProps }
