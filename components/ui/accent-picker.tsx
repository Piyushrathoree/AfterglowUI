"use client"

import * as React from "react"
import { motion, useReducedMotion } from "motion/react"

import { springs } from "@/lib/afterglow"
import { cn } from "@/lib/utils"

type Accent = {
  id: string
  label: string
  /** the accent's hue, in OKLCH degrees */
  hue: number
}

// ember is the stock dusk palette, so it clears every override instead of setting one
const accents: Accent[] = [
  { id: "ember", label: "Ember", hue: 45 },
  { id: "ocean", label: "Ocean", hue: 240 },
  { id: "mint", label: "Mint", hue: 160 },
  { id: "violet", label: "Violet", hue: 295 },
  { id: "rose", label: "Rose", hue: 8 },
]

const properties = ["--glow", "--glow-2", "--glow-3", "--ring"] as const

// one solid color: the glow and both of its tail colors are the same, so nothing blends
// into a second hue. same lightness and chroma as the stock glow, so only the hue changes
function paint(accent: Accent, isDark: boolean, root: HTMLElement) {
  if (accent.id === accents[0].id) {
    properties.forEach((name) => root.style.removeProperty(name))
    return
  }
  const color = isDark ? `oklch(0.8 0.16 ${accent.hue})` : `oklch(0.7 0.19 ${accent.hue})`
  properties.forEach((name) => root.style.setProperty(name, color))
}

// every picker on the page shares one saved choice
const listeners = new Set<() => void>()
const subscribe = (callback: () => void) => {
  listeners.add(callback)
  return () => void listeners.delete(callback)
}

type AccentPickerProps = Omit<React.ComponentProps<"div">, "onChange"> & {
  /** the choices; the first is treated as the stock palette */
  options?: Accent[]
  /** where the choice is saved */
  storageKey?: string
  onValueChange?: (id: string) => void
}

function AccentPicker({
  options = accents,
  storageKey = "afterglow-accent",
  onValueChange,
  className,
  ...props
}: AccentPickerProps) {
  const reduceMotion = useReducedMotion()
  const ringId = React.useId()

  const current = React.useSyncExternalStore(
    subscribe,
    () => {
      const saved = window.localStorage.getItem(storageKey)
      return options.some((option) => option.id === saved) ? saved! : options[0].id
    },
    () => options[0].id
  )
  const accent = options.find((option) => option.id === current) ?? options[0]

  // paint the page, and again whenever the theme flips between light and dark
  React.useEffect(() => {
    const root = document.documentElement
    const apply = () => paint(accent, root.classList.contains("dark"), root)
    apply()
    const observer = new MutationObserver(apply)
    observer.observe(root, { attributes: true, attributeFilter: ["class"] })
    return () => observer.disconnect()
  }, [accent])

  function choose(id: string) {
    window.localStorage.setItem(storageKey, id)
    listeners.forEach((callback) => callback())
    onValueChange?.(id)
  }

  return (
    <div
      data-slot="accent-picker"
      role="radiogroup"
      aria-label="Accent color"
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-glass p-1.5 shadow-glass backdrop-blur-xl backdrop-saturate-150",
        className
      )}
      {...props}
    >
      {options.map((option) => {
        const selected = option.id === current
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={option.label}
            title={option.label}
            onClick={() => choose(option.id)}
            className="relative grid size-8 cursor-pointer place-items-center rounded-full outline-none transition-[scale] duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-safe:active:scale-[0.96] motion-reduce:transition-none"
          >
            {selected && (
              <motion.span
                layoutId={`${ringId}-ring`}
                aria-hidden
                // a glass bezel around the swatch: a lit top edge, a shaded lower edge, a soft drop
                className="absolute inset-0 rounded-full border border-foreground/20 bg-linear-to-b from-foreground/[0.22] to-foreground/[0.04] shadow-[inset_0_1px_0_oklch(1_0_0/55%),inset_0_-2px_3px_-1px_oklch(0_0_0/30%),0_2px_5px_-1px_oklch(0_0_0/35%)]"
                transition={reduceMotion ? { duration: 0 } : springs.snappy}
              >
                <span className="absolute inset-x-[18%] top-[6%] h-[36%] rounded-full bg-linear-to-b from-white/45 to-transparent" />
              </motion.span>
            )}
            <span
              aria-hidden
              className="relative size-[22px] rounded-full shadow-[inset_0_0_0_1px_oklch(0_0_0/8%)]"
              style={{ background: `oklch(0.74 0.17 ${option.hue})` }}
            />
          </button>
        )
      })}
    </div>
  )
}

export { AccentPicker, type Accent, type AccentPickerProps }
