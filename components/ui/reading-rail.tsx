"use client"

import * as React from "react"
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue } from "motion/react"

import { buildTrack, lengthAt, useRailRows, type RailTrack } from "@/components/ui/rail-path"
import { cn } from "@/lib/utils"

type ReadingRailItem = {
  /** matches the `id` of the heading it points to */
  id: string
  label: string
  /** Optional destination when the rail is used for page navigation. */
  href?: string
  /** indents the row, and bends the rail sideways to reach it; 0 is a top level heading */
  depth?: number
}

type ReadingRailProps = Omit<React.ComponentProps<"nav">, "children"> & {
  items: ReadingRailItem[]
  /** the element that scrolls; leave it out to follow the page */
  container?: HTMLElement | null
  /** how far below the top of the view a heading counts as reached, in px */
  offset?: number
  title?: string
  /** Controls the active item for route-based navigation instead of scroll tracking. */
  activeId?: string
  /** Called when a controlled item is selected. */
  onActiveIdChange?: (id: string) => void
  /** Enlarges the rail for a standalone contents view. */
  size?: "default" | "large"
}

const RAIL_X = 7
const STEP = 14

function RailDot({ x, y, at, reached, current, index, large }: {
  x: number
  y: number
  at: number
  reached: MotionValue<number>
  current: number
  index: number
  large: boolean
}) {
  // Let the travelling arrow cover a dot as it arrives, rather than hiding the destination early.
  const opacity = useTransform(reached, (length) =>
    large && current >= 0 ? Math.min(1, Math.max(0, (Math.abs(length - at) - 9) / 10)) : 1
  )
  const passed = useTransform(reached, (length) => length + 0.5 >= at ? 1 : 0)
  if (large) {
    return (
      <motion.g style={{ opacity }}>
        <circle cx={x} cy={y} r={7} className="fill-card stroke-[color-mix(in_oklch,var(--foreground)_40%,var(--card))]" strokeWidth={2.5} />
        <motion.circle cx={x} cy={y} r={7} className="fill-[color-mix(in_oklch,var(--foreground)_65%,var(--card))]" style={{ opacity: passed }} />
      </motion.g>
    )
  }
  return (
    <motion.circle
      cx={x}
      cy={y}
      r={index === current ? 3.25 : 2.25}
      style={{ opacity }}
      className={cn(index <= current ? "fill-glow" : "fill-background stroke-foreground/35", "transition-[r,fill,stroke] duration-200 motion-reduce:transition-none")}
      strokeWidth={1.25}
    />
  )
}

// a table of contents on a dashed rail that bends in where a heading is indented. a solid line fills
// the rail as you read, and a small endpoint bead follows the path
function ReadingRail({ items, container = null, offset = 24, title = "On this page", activeId, onActiveIdChange, size = "default", className, ...props }: ReadingRailProps) {
  const reduceMotion = useReducedMotion()
  const stemId = React.useId()
  const large = size === "large"
  const railX = large ? 12 : RAIL_X
  const step = large ? 30 : STEP
  const list = React.useRef<HTMLUListElement>(null)
  const base = React.useRef<SVGPathElement>(null)
  const trackRef = React.useRef<RailTrack | null>(null)
  const [current, setCurrent] = React.useState(0)
  const position = useMotionValue(0)
  const direction = useMotionValue(0)
  const previousTarget = React.useRef<number | null>(null)

  const rows = useRailRows(list, railX, step, items)
  const track = React.useMemo(() => buildTrack(rows ?? [], 7, large ? "diagonal" : "rounded"), [large, rows])

  // the fill, in px along the path. one spring drives the line and endpoint bead together
  const reached = useSpring(0, reduceMotion ? { duration: 0 } : { stiffness: 240, damping: 31, mass: 1 })
  const rotation = useSpring(direction, reduceMotion ? { duration: 0 } : { stiffness: 260, damping: 28, mass: 0.7 })
  const fill = useMotionValue(0)
  const x = useMotionValue(railX)
  const y = useMotionValue(0)

  const moveTo = React.useCallback((target: number) => {
    if (large && previousTarget.current !== null && Math.abs(target - previousTarget.current) > 0.5) {
      const angle = target < previousTarget.current ? 180 : 0
      if (reduceMotion) {
        direction.jump(angle)
        rotation.jump(angle)
      } else {
        direction.set(angle)
      }
    }
    if (previousTarget.current === null || Math.abs(target - previousTarget.current) > 0.5) previousTarget.current = target
    if (reduceMotion) reached.jump(target)
    else reached.set(target)
  }, [direction, large, reached, reduceMotion, rotation])

  React.useEffect(() => {
    trackRef.current = track
    const target = lengthAt(track, position.get())
    moveTo(target)
  }, [moveTo, position, track])

  // keep the line and the ember on the path
  const place = React.useCallback(
    (length: number) => {
      const path = base.current
      const total = trackRef.current?.total ?? 0
      if (!path || !total) return
      const clamped = Math.max(0, Math.min(length, total))
      fill.set(clamped / total)
      const here = path.getPointAtLength(clamped)
      x.set(here.x)
      y.set(here.y)
    },
    [fill, x, y]
  )

  React.useEffect(() => reached.on("change", place), [place, reached])

  // when the rows are measured or move, put the ember back where the rail now is
  React.useEffect(() => place(reached.get()), [place, reached, track])

  // keep the active row visible when the rail itself sits inside a scrollable sidebar
  React.useEffect(() => {
    if (current < 0) return
    const row = list.current?.children.item(current)?.querySelector<HTMLElement>("button, a")
    if (!row) return

    let viewport = list.current?.parentElement ?? null
    while (viewport && viewport !== document.body && viewport !== document.documentElement) {
      const style = window.getComputedStyle(viewport)
      const canScroll = /auto|scroll/.test(style.overflowY) && viewport.scrollHeight > viewport.clientHeight + 1
      if (canScroll) {
        const rowBounds = row.getBoundingClientRect()
        const viewportBounds = viewport.getBoundingClientRect()
        const top = viewportBounds.top + viewport.clientTop
        const bottom = top + viewport.clientHeight
        const margin = 12

        if (rowBounds.top < top + margin) {
          viewport.scrollTo({ top: viewport.scrollTop + rowBounds.top - top - margin, behavior: reduceMotion ? "auto" : "smooth" })
        } else if (rowBounds.bottom > bottom - margin) {
          viewport.scrollTo({ top: viewport.scrollTop + rowBounds.bottom - bottom + margin, behavior: reduceMotion ? "auto" : "smooth" })
        }
        return
      }
      viewport = viewport.parentElement
    }
  }, [current, reduceMotion])

  React.useEffect(() => {
    let frame = 0
    const measure = () => {
      frame = 0
      if (activeId !== undefined) {
        const index = items.findIndex((item) => item.id === activeId)
        if (index < 0) { position.set(0); moveTo(0); reached.jump(0); setCurrent(-1); return }
        position.set(index)
        const length = lengthAt(trackRef.current ?? track, index)
        moveTo(length)
        setCurrent(index)
        return
      }
      const top = container ? container.getBoundingClientRect().top : 0
      const line = top + offset
      const tops = items.map((item) => document.getElementById(item.id)?.getBoundingClientRect().top ?? Infinity)
      let index = -1
      tops.forEach((value, i) => {
        if (value <= line + 1) index = i
      })
      const scrollable = container
        ? container.scrollHeight - container.clientHeight
        : document.documentElement.scrollHeight - window.innerHeight
      const scrolled = container ? container.scrollTop : window.scrollY
      // scroll snapping can settle a few pixels before the exact scroll limit
      const atEnd = scrollable > 0 && scrolled >= scrollable - Math.max(24, offset)
      let next: number
      if (atEnd) next = items.length - 1
      else if (index < 0) next = 0
      else if (index >= items.length - 1) next = items.length - 1
      else {
        const span = tops[index + 1] - tops[index]
        next = index + (span > 0 ? Math.min(Math.max((line - tops[index]) / span, 0), 1) : 0)
      }
      position.set(next)
      const length = lengthAt(trackRef.current ?? track, next)
      moveTo(length)
      setCurrent(atEnd ? items.length - 1 : Math.max(index, 0))
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure)
    }
    schedule()
    const scroller: HTMLElement | Window = container ?? window
    scroller.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", schedule)
    return () => {
      cancelAnimationFrame(frame)
      scroller.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
    }
  }, [activeId, container, items, moveTo, offset, position, reached, track])

  function go(id: string) {
    if (activeId !== undefined) {
      onActiveIdChange?.(id)
      return
    }
    const target = document.getElementById(id)
    if (!target) return
    const behavior = reduceMotion ? "auto" : "smooth"
    if (container) {
      const delta = target.getBoundingClientRect().top - (container.getBoundingClientRect().top + offset)
      container.scrollTo({ top: container.scrollTop + delta, behavior })
    } else {
      window.scrollTo({ top: window.scrollY + target.getBoundingClientRect().top - offset, behavior })
    }
  }

  return (
    <nav data-slot="reading-rail" data-size={size} aria-label={title} className={cn("relative", className)} {...props}>
      <div className={cn("mb-4 flex items-center pl-7", large && "mb-5 gap-4 pl-0 sm:mb-6")}>
        {large && (
          <span aria-hidden className="flex w-6 shrink-0 flex-col gap-[4px] text-foreground/65">
            <span className="h-[3px] w-full rounded-full bg-current" />
            <span className="h-[3px] w-[17px] rounded-full bg-current" />
            <span className="h-[3px] w-[21px] rounded-full bg-current" />
          </span>
        )}
        <p className={cn("text-[13px] font-medium tracking-tight text-foreground/70", large && "text-[24px] leading-tight font-semibold text-foreground/80 sm:text-[30px]")}>{title}</p>
      </div>
      <ul ref={list} className="relative flex flex-col">
        {rows && track.d && (
          <svg aria-hidden className={cn("pointer-events-none absolute top-0 left-0 h-full overflow-visible", large ? "w-16" : "w-8")}>
            {large && rows[0] && (
              <>
                <defs>
                  <linearGradient id={stemId} gradientUnits="userSpaceOnUse" x1={rows[0].x} y1={rows[0].y - 32} x2={rows[0].x} y2={rows[0].y}>
                    <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
                    <stop offset="100%" stopColor="currentColor" />
                  </linearGradient>
                </defs>
                <path d={`M ${rows[0].x} ${rows[0].y - 32} V ${rows[0].y}`} fill="none" stroke={`url(#${stemId})`} strokeWidth="3" className="text-foreground/45" />
              </>
            )}
            <path ref={base} d={track.d} fill="none" strokeWidth={large ? 2.5 : 1.5} strokeLinecap="round" strokeDasharray={large ? "3 10" : "0.1 5"} className={large ? "stroke-foreground/35" : "stroke-foreground/30"} />
            <motion.path d={track.d} fill="none" strokeWidth={large ? 3 : 1.75} strokeLinecap="round" className={large ? "stroke-[color-mix(in_oklch,var(--foreground)_65%,var(--card))]" : "stroke-glow"} style={{ pathLength: fill }} />
            {rows.map((row, index) => (
              <RailDot
                key={index}
                x={row.x}
                y={row.y}
                at={track.at[index]}
                reached={reached}
                current={current}
                index={index}
                large={large}
              />
            ))}
            <motion.g style={{ x, y, opacity: current < 0 ? 0 : 1 }}>
              {large ? (
                <motion.g data-rail-arrow style={{ rotate: rotation, originX: 0.5, originY: 13 / 29 }}>
                  <path d="M -13 -13 L 0 16 L 13 -13 L 0 -7 Z" className="fill-foreground" />
                </motion.g>
              ) : (
              <>
              <circle
                r={large ? 5.5 : 4.25}
                className="fill-background stroke-glow"
                strokeWidth={large ? 1.75 : 1.5}
              />
              <circle r={large ? 1.8 : 1.5} className="fill-glow" />
              </>
              )}
            </motion.g>
          </svg>
        )}
        {items.map((item, index) => {
          const Element = item.href ? "a" : "button"
          return (
          <li key={item.id} data-rail-row data-depth={item.depth ?? 0} className="relative">
            <Element
              type={item.href ? undefined : "button"}
              href={item.href}
              onClick={item.href ? undefined : () => go(item.id)}
              aria-current={index === current ? "location" : undefined}
              className={cn(
                cn("group flex min-h-8 w-full cursor-pointer items-center rounded-lg py-1.5 pr-2 text-left text-[13px] leading-snug outline-none transition-colors duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none", large && "min-h-[56px] rounded-none py-1.5 text-[22px] font-medium sm:min-h-[68px] sm:text-[26px]"),
                index === current ? (large ? "font-semibold text-foreground" : "font-medium text-foreground") : large ? "text-foreground/60 hover:text-foreground/90 focus-visible:text-foreground" : index < current ? "text-foreground/70 hover:text-foreground" : "text-foreground/45 hover:text-foreground"
              )}
              style={{ paddingLeft: (large ? 40 : 28) + (item.depth ?? 0) * step }}
            >
              <span className={cn(large && "block origin-left transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-[3px] group-focus-visible:translate-x-[3px] group-active:translate-x-px motion-reduce:transform-none motion-reduce:transition-none")}>{item.label}</span>
            </Element>
          </li>
        )})}
      </ul>
    </nav>
  )
}

export { ReadingRail, type ReadingRailItem, type ReadingRailProps }
