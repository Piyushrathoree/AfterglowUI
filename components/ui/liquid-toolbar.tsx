"use client"

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { LiquidGlass } from "@/components/ui/liquid-glass"
import { spring } from "@/lib/afterglow"
import { cn } from "@/lib/utils"

type ToolbarItem = {
  label: string
  icon: React.ReactNode
  onClick?: () => void
  /** makes it a toggle; true lights the icon */
  pressed?: boolean
}

type ToolbarEntry = ToolbarItem | "divider"

type LiquidToolbarProps = Omit<React.ComponentProps<"div">, "children"> & {
  items: ToolbarEntry[]
  "aria-label"?: string
}

function LiquidToolbar({
  items,
  className,
  onPointerLeave,
  ...props
}: LiquidToolbarProps) {
  const id = React.useId()
  const reduceMotion = useReducedMotion()
  const [hovered, setHovered] = React.useState<string | null>(null)
  const buttons = React.useRef<HTMLButtonElement[]>([])

  function handleKeyDown(event: React.KeyboardEvent, index: number) {
    const all = buttons.current.filter(Boolean)
    const next = {
      ArrowRight: all[(index + 1) % all.length],
      ArrowLeft: all[(index - 1 + all.length) % all.length],
      Home: all[0],
      End: all[all.length - 1],
    }[event.key]
    if (!next) return
    event.preventDefault()
    next.focus()
  }

  // the position of each entry among the focusable ones (dividers are -1)
  const positions: number[] = []
  let count = 0
  for (const entry of items) positions.push(entry === "divider" ? -1 : count++)

  return (
    <div
      data-slot="liquid-toolbar"
      role="toolbar"
      className={cn("relative inline-flex items-center gap-0.5 rounded-full p-1", className)}
      onPointerLeave={(event) => {
        onPointerLeave?.(event)
        setHovered(null)
      }}
      {...props}
    >
      <LiquidGlass className="absolute inset-0 rounded-[inherit]" />
      {items.map((item, i) => {
        if (item === "divider") {
          return (
            <span
              key={`divider-${i}`}
              aria-hidden
              className="relative mx-1 h-5 w-px bg-foreground/15"
            />
          )
        }
        const index = positions[i]
        return (
          <button
            key={item.label}
            ref={(node) => {
              if (node) buttons.current[index] = node
            }}
            type="button"
            aria-label={item.label}
            aria-pressed={item.pressed}
            tabIndex={index === 0 ? 0 : -1}
            className={cn(
              "group relative grid size-9 cursor-pointer place-items-center rounded-full text-foreground/80 outline-none transition-colors duration-150 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring [&_svg]:size-[18px]",
              item.pressed && "text-glow hover:text-glow"
            )}
            onPointerEnter={() => setHovered(item.label)}
            onFocus={() => setHovered(item.label)}
            onClick={item.onClick}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            {/* one highlight that slides between buttons as you hover */}
            <AnimatePresence>
              {hovered === item.label && (
                <motion.span
                  layoutId={`${id}-hover`}
                  aria-hidden
                  className="absolute inset-0 rounded-full bg-foreground/10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.12 } }}
                  transition={reduceMotion ? { duration: 0 } : spring("snappy")}
                />
              )}
            </AnimatePresence>
            {item.pressed && (
              <span
                aria-hidden
                className="absolute inset-1.5 rounded-full bg-glow/25 blur-md"
              />
            )}
            <span className="relative transition-[scale] duration-150 ease-out group-active:scale-90">
              {item.icon}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export { LiquidToolbar, type ToolbarEntry, type ToolbarItem, type LiquidToolbarProps }
