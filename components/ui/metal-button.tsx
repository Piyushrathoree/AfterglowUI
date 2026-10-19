"use client"

import * as React from "react"
import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react"

import { LiquidMetal, MetalRim } from "@/components/ui/liquid-metal"
import { cn } from "@/lib/utils"

const sizes = {
  sm: "h-9 gap-1.5 px-4 text-[13px] [&_svg]:size-3.5",
  md: "h-10 gap-2 px-5 text-sm [&_svg]:size-4",
  lg: "h-12 gap-2.5 px-6 text-[15px] [&_svg]:size-[18px]",
}

type MetalButtonProps = Omit<HTMLMotionProps<"button">, "children"> & {
  /** rim is a dark button ringed in flowing chrome; silver is solid brushed metal */
  variant?: "rim" | "silver"
  size?: keyof typeof sizes
  children?: React.ReactNode
}

function MetalButton({
  variant = "rim",
  size = "md",
  className,
  children,
  type = "button",
  ...props
}: MetalButtonProps) {
  const reduceMotion = useReducedMotion()
  const silver = variant === "silver"

  return (
    <motion.button
      data-slot="metal-button"
      data-variant={variant}
      type={type}
      className={cn(
        "relative isolate inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full font-medium whitespace-nowrap outline-none select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-60",
        "shadow-[0_8px_24px_-12px_oklch(0_0_0/70%),0_1px_2px_oklch(0_0_0/40%)]",
        silver
          ? "text-[oklch(0.2_0.004_285)] [text-shadow:0_1px_0_oklch(1_0_0/45%)]"
          : "bg-[linear-gradient(oklch(0.21_0.004_285),oklch(0.13_0.004_285))] text-white",
        sizes[size],
        className
      )}
      whileTap={{ scale: reduceMotion ? 1 : 0.97 }}
      transition={{ type: "spring", duration: 0.3, bounce: 0 }}
      {...props}
    >
      {silver ? (
        <LiquidMetal className="-z-10" softness={1} brightness={0.8} scale={0.4} tint={[1, 0.92, 0.84]} />
      ) : (
        <MetalRim className="-z-10" width={2} />
      )}
      {/* a bevel: light along the top edge, shade along the bottom */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute rounded-[inherit]",
          silver
            ? "inset-0 shadow-[inset_0_1px_0_oklch(1_0_0/60%),inset_0_-1px_0_oklch(0_0_0/20%)]"
            : "inset-[2px] shadow-[inset_0_1px_0_oklch(1_0_0/12%)]"
        )}
      />
      <span className="relative inline-flex items-center gap-[inherit]">{children}</span>
    </motion.button>
  )
}

export { MetalButton, type MetalButtonProps }
