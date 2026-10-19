"use client"

import * as React from "react"
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react"

import { useRailRows } from "@/components/ui/rail-path"
import { iconGestures, iconRest, springs } from "@/lib/afterglow"
import { cn } from "@/lib/utils"

type RailNavItem = {
  id: string
  label: string
  icon?: React.ReactNode
  /** a small trailing note, like a count */
  badge?: string
  /** makes the row a real link */
  href?: string
}

/** a small label that starts a new group of rows */
type RailNavHeading = { heading: string }

type RailNavProps = Omit<React.ComponentProps<"nav">, "onChange" | "defaultValue"> & {
  items: (RailNavItem | RailNavHeading)[]
  value?: string
  defaultValue?: string
  onValueChange?: (id: string) => void
}

const RAIL_X = 7
const RADIUS = 6
const HOOK = 8
const TAIL = 14

// a sidebar on a dashed rail. a solid line runs down the rail and hooks into the page you are on,
// and a quieter one reaches out from it to the row under your pointer or focus
function RailNav({ items, value, defaultValue, onValueChange, className, "aria-label": label = "Sidebar", ...props }: RailNavProps) {
  const reduceMotion = useReducedMotion()
  const uid = React.useId()
  const list = React.useRef<HTMLUListElement>(null)
  const buttons = React.useRef(new Map<string, HTMLElement>())
  const rows = items.filter((entry): entry is RailNavItem => "id" in entry)
  const [internal, setInternal] = React.useState(defaultValue ?? rows[0]?.id)
  const [hovered, setHovered] = React.useState<string | null>(null)
  const active = value ?? internal

  const measured = useRailRows(list, RAIL_X, 0, items)
  const ys = React.useMemo(() => {
    const map = new Map<string, number>()
    rows.forEach((row, index) => {
      const spot = measured?.[index]
      if (spot) map.set(row.id, spot.y)
    })
    return map
    // rows is derived from items
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [measured, items])

  const top = (measured?.[0]?.y ?? 0) - TAIL
  const bottom = measured?.[measured.length - 1]?.y ?? 0
  const activeTarget = (active ? ys.get(active) : undefined) ?? top
  const hoverTarget = (hovered ? ys.get(hovered) : undefined) ?? activeTarget

  const motionConfig = reduceMotion ? { duration: 0 } : { stiffness: 320, damping: 30, mass: 0.7 }
  const activeY = useSpring(top, motionConfig)
  const hoverY = useSpring(top, { stiffness: 380, damping: 34, mass: 0.6 })
  const startY = useMotionValue(top)

  React.useEffect(() => {
    startY.set(top)
    if (reduceMotion) {
      activeY.jump(activeTarget)
      hoverY.jump(hoverTarget)
    } else {
      activeY.set(activeTarget)
      hoverY.set(hoverTarget)
    }
  }, [activeTarget, activeY, hoverTarget, hoverY, reduceMotion, startY, top])

  // the solid line: down the rail, then a rounded hook into the row
  const activeD = useTransform([activeY, startY], ([y, from]: number[]) => {
    const r = Math.max(Math.min(RADIUS, y - from), 0)
    return `M ${RAIL_X} ${from} V ${y - r} A ${r} ${r} 0 0 0 ${RAIL_X + r} ${y} h ${HOOK}`
  })
  // the quiet line: from the end of the solid one to the hovered row, hooking the same way
  const hoverD = useTransform([activeY, hoverY], ([from, y]: number[]) => {
    const down = y >= from
    const r = Math.min(RADIUS, Math.abs(y - from))
    if (r < 0.5) return `M ${RAIL_X} ${from} h 0`
    return `M ${RAIL_X} ${from} V ${down ? y - r : y + r} A ${r} ${r} 0 0 ${down ? 0 : 1} ${RAIL_X + r} ${y} h ${HOOK}`
  })

  function choose(id: string) {
    if (value === undefined) setInternal(id)
    onValueChange?.(id)
  }

  function onKeyDown(event: React.KeyboardEvent, id: string) {
    const index = rows.findIndex((row) => row.id === id)
    const next =
      event.key === "ArrowDown" ? rows[Math.min(index + 1, rows.length - 1)]
      : event.key === "ArrowUp" ? rows[Math.max(index - 1, 0)]
      : event.key === "Home" ? rows[0]
      : event.key === "End" ? rows[rows.length - 1]
      : null
    if (!next) return
    event.preventDefault()
    buttons.current.get(next.id)?.focus()
  }

  const slide = reduceMotion ? { duration: 0 } : springs.snappy

  return (
    <nav data-slot="rail-nav" aria-label={label} className={cn("relative", className)} {...props}>
      <ul ref={list} className="relative flex flex-col" onPointerLeave={() => setHovered(null)}>
        {measured && (
          <svg aria-hidden className="pointer-events-none absolute top-0 left-0 h-full w-8 overflow-visible">
            <path d={`M ${RAIL_X} ${top} V ${bottom}`} fill="none" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="0.1 5" className="stroke-foreground/35" />
            <motion.path d={hoverD} fill="none" strokeWidth="1.5" strokeLinecap="round" className="stroke-foreground/30" />
            <motion.path d={activeD} fill="none" strokeWidth="1.75" strokeLinecap="round" className="stroke-glow" />
            <motion.circle cx={RAIL_X + RADIUS + HOOK} cy={activeY} r="2.75" className="fill-glow" />
          </svg>
        )}
        {items.map((entry, index) => {
          if ("heading" in entry) {
            return (
              <li key={`heading-${index}`} className={cn("pl-8 pb-1.5 text-[11px] font-medium tracking-[0.08em] text-foreground/45 uppercase", index > 0 && "pt-6")}>
                {entry.heading}
              </li>
            )
          }
          const selected = entry.id === active
          const Tag = entry.href ? "a" : "button"
          return (
            <li key={entry.id} data-rail-row className="relative">
              {hovered === entry.id && !selected && (
                <motion.span
                  layoutId={`${uid}-hover`}
                  aria-hidden
                  className="absolute inset-y-0.5 right-0 left-6 rounded-[10px] bg-foreground/[0.045]"
                  transition={slide}
                />
              )}
              {selected && (
                <motion.span
                  layoutId={`${uid}-active`}
                  aria-hidden
                  className="absolute inset-y-0.5 right-0 left-6 rounded-[10px] bg-foreground/[0.08] shadow-[inset_0_1px_0_oklch(1_0_0/8%),inset_0_0_0_1px_oklch(1_0_0/4%)]"
                  transition={slide}
                />
              )}
              <Tag
                ref={(node: HTMLElement | null) => {
                  if (node) buttons.current.set(entry.id, node)
                  else buttons.current.delete(entry.id)
                }}
                {...(entry.href ? { href: entry.href } : { type: "button" as const })}
                aria-current={selected ? "page" : undefined}
                onClick={() => choose(entry.id)}
                onPointerEnter={() => setHovered(entry.id)}
                onFocus={() => setHovered(entry.id)}
                onBlur={() => setHovered(null)}
                onKeyDown={(event: React.KeyboardEvent) => onKeyDown(event, entry.id)}
                className={cn(
                  "relative flex h-9 w-full cursor-pointer items-center gap-2.5 rounded-[10px] pr-3 pl-8 text-left text-sm outline-none transition-colors duration-150 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring [&_svg]:size-4 [&_svg]:shrink-0",
                  selected ? "font-medium text-foreground" : "text-foreground/60 hover:text-foreground"
                )}
              >
                {entry.icon && (
                  <motion.span
                    aria-hidden
                    className={cn("grid place-items-center transition-colors duration-200", selected && "text-glow")}
                    initial={false}
                    animate={selected ? iconGestures.pop : iconRest}
                    transition={reduceMotion ? { duration: 0 } : { duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
                  >
                    {entry.icon}
                  </motion.span>
                )}
                <span className="min-w-0 flex-1 truncate">{entry.label}</span>
                {entry.badge && (
                  <span className="rounded-full bg-glow/15 px-1.5 py-px text-[11px] font-medium text-glow">{entry.badge}</span>
                )}
              </Tag>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export { RailNav, type RailNavItem, type RailNavHeading, type RailNavProps }
