"use client"

import * as React from "react"
import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react"

import { afterglow, ringMask } from "@/lib/afterglow"
import { cn } from "@/lib/utils"

type BorderBeamProps = Omit<HTMLMotionProps<"div">, "children"> & {
  /** seconds per lap */
  duration?: number
  /** thickness of the beam in px */
  width?: number
  /** length of the fading tail, in degrees of the lap */
  tail?: number
  color?: string
  /** a color the tail passes through on its way out; by default it simply fades */
  tailColor?: string
  /** a second beam on the opposite side, in its own color */
  twin?: string
  reverse?: boolean
  /** turn it off and the beam fades out slowly, still circling, instead of vanishing */
  active?: boolean
}

function BorderBeam({
  className,
  style,
  duration = 6,
  width = 1.5,
  tail = 120,
  color = "var(--glow)",
  tailColor,
  twin,
  reverse = false,
  active = true,
  ...props
}: BorderBeamProps) {
  const reduceMotion = useReducedMotion()
  const ref = React.useRef<HTMLDivElement>(null)
  const [diagonal, setDiagonal] = React.useState(0)

  // the rotating disc must cover the box at every angle, so it spans the diagonal
  React.useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new ResizeObserver(() =>
      setDiagonal(Math.ceil(Math.hypot(node.offsetWidth, node.offsetHeight)))
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  // each beam: a bright head with a long tail fading behind it
  const head = (at: number, beam: string) =>
    `transparent ${at - tail}deg, ${
      tailColor ?? `color-mix(in oklch, ${beam} 30%, transparent)`
    } ${at - tail * 0.4}deg, ${beam} ${at - 1}deg, transparent ${at}deg`
  const stops = twin
    ? `${head(180, color)}, ${head(360, twin)}`
    : `transparent 0deg, ${head(360, color)}`
  const background = `conic-gradient(from 0deg, ${stops})`

  return (
    <motion.div
      ref={ref}
      data-slot="border-beam"
      data-state={active ? "active" : "idle"}
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[inherit]",
        className
      )}
      style={style}
      initial={false}
      animate={{ opacity: active ? 1 : 0 }}
      transition={
        active
          ? { duration: 0.4, ease: "easeOut" }
          : // ease in-out, so the light holds for a beat before it lets go
            { duration: afterglow.linger * 1.6, ease: "easeInOut" }
      }
      {...props}
    >
      <div
        className="absolute inset-0 overflow-hidden rounded-[inherit]"
        style={{ ...ringMask, padding: width }}
      >
        {/* a transform-only spin, so the compositor runs it without repaints */}
        <motion.div
          className="absolute top-1/2 left-1/2"
          style={{
            width: diagonal,
            height: diagonal,
            marginLeft: -diagonal / 2,
            marginTop: -diagonal / 2,
            background,
          }}
          initial={{ rotate: 0 }}
          animate={reduceMotion ? { rotate: 45 } : { rotate: reverse ? -360 : 360 }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { duration, ease: "linear", repeat: Infinity }
          }
        />
      </div>
    </motion.div>
  )
}

export { BorderBeam, type BorderBeamProps }
