"use client"

import * as React from "react"
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type HTMLMotionProps,
} from "motion/react"

import { afterglow, springs } from "@/lib/afterglow"
import { cn } from "@/lib/utils"

type SheenCardProps = Omit<HTMLMotionProps<"div">, "children"> & {
  maxTilt?: number
  foil?: boolean
  children?: React.ReactNode
}

function SheenCard({
  maxTilt = 8,
  foil = true,
  className,
  children,
  style,
  onPointerEnter,
  onPointerMove,
  onPointerLeave,
  ...props
}: SheenCardProps) {
  const reduceMotion = useReducedMotion()
  // pointer position across the card, from -0.5 to 0.5 on each axis
  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const x = useSpring(pointerX, springs.soft)
  const y = useSpring(pointerY, springs.soft)
  const shine = useMotionValue(0)

  const rotateX = useTransform(y, (v) => (reduceMotion ? 0 : -v * maxTilt * 2))
  const rotateY = useTransform(x, (v) => (reduceMotion ? 0 : v * maxTilt * 2))

  // a band of reflected light that slides across the surface as it tilts
  const sheen = useTransform(() => {
    const at = 50 + x.get() * 90
    return `linear-gradient(115deg, transparent ${at - 24}%, oklch(1 0 0 / 14%) ${at - 6}%, oklch(1 0 0 / 30%) ${at}%, oklch(1 0 0 / 14%) ${at + 6}%, transparent ${at + 24}%)`
  })
  const glare = useTransform(
    () =>
      `radial-gradient(circle at ${50 + x.get() * 100}% ${50 + y.get() * 100}%, oklch(1 0 0 / 22%), transparent 55%)`
  )
  const foilFill = useTransform(
    () =>
      `linear-gradient(${110 + x.get() * 70}deg, var(--glow-3) 10%, var(--glow-2) 35%, var(--glow) 55%, var(--glow-3) 90%)`
  )
  // the holographic foil only shows when the card is tilted
  const foilOpacity = useTransform(
    () => Math.min(Math.hypot(x.get(), y.get()) * 1.6, 0.5) * shine.get()
  )

  return (
    <motion.div
      data-slot="sheen-card"
      className={cn(
        "relative rounded-2xl bg-card text-card-foreground shadow-glass transform-3d",
        className
      )}
      style={{ transformPerspective: 900, rotateX, rotateY, ...style }}
      onPointerEnter={(event) => {
        onPointerEnter?.(event)
        animate(shine, 1, { duration: 0.25 })
      }}
      onPointerMove={(event) => {
        onPointerMove?.(event)
        const rect = event.currentTarget.getBoundingClientRect()
        pointerX.set((event.clientX - rect.left) / rect.width - 0.5)
        pointerY.set((event.clientY - rect.top) / rect.height - 0.5)
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event)
        pointerX.set(0)
        pointerY.set(0)
        // the reflection settles back and fades out slowly
        animate(shine, 0, { duration: afterglow.linger, ease: afterglow.ease })
      }}
      {...props}
    >
      {children}
      {foil && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] mix-blend-overlay"
          style={{ background: foilFill, opacity: foilOpacity }}
        />
      )}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] mix-blend-plus-lighter"
        style={{ background: sheen, opacity: shine }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] mix-blend-plus-lighter"
        style={{ background: glare, opacity: shine }}
      />
    </motion.div>
  )
}

export { SheenCard, type SheenCardProps }
