"use client"

import * as React from "react"
import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react"

import { cn } from "@/lib/utils"

type MetalTextProps = Omit<HTMLMotionProps<"span">, "children"> & {
  /** seconds between glints */
  every?: number
  children?: React.ReactNode
}

// polished letters, bright at the top and dimmer below, with a glint now and then
function MetalText({ every = 5, className, style, children, ...props }: MetalTextProps) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.span
      data-slot="metal-text"
      className={cn(
        "inline-block bg-clip-text bg-no-repeat text-transparent",
        // dark steel on light backgrounds, bright chrome on dark ones
        "[--metal:linear-gradient(180deg,oklch(0.5_0.004_285)_0%,oklch(0.2_0.004_285)_75%,oklch(0.32_0.004_285)_100%)]",
        "dark:[--metal:linear-gradient(180deg,oklch(1_0_0)_10%,oklch(0.86_0.004_80)_50%,oklch(0.58_0.004_285)_100%)]",
        "[--glint:linear-gradient(105deg,transparent_42%,oklch(1_0_0/55%)_50%,transparent_58%)]",
        "dark:[--glint:linear-gradient(105deg,transparent_42%,oklch(1_0_0/95%)_50%,transparent_58%)]",
        className
      )}
      style={{ backgroundImage: "var(--glint), var(--metal)", backgroundSize: "300% 100%, 100% 100%", ...style }}
      initial={{ backgroundPosition: "100% 0%, 0% 0%" }}
      animate={reduceMotion ? undefined : { backgroundPosition: "0% 0%, 0% 0%" }}
      transition={{ duration: 1.6, ease: [0.4, 0, 0.2, 1], repeat: Infinity, repeatDelay: every }}
      {...props}
    >
      {children}
    </motion.span>
  )
}

export { MetalText, type MetalTextProps }
