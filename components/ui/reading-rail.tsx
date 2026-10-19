"use client"

import * as React from "react"
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react"

import { buildTrack, lengthAt, useRailRows, type RailTrack } from "@/components/ui/rail-path"
import { cn } from "@/lib/utils"

type ReadingRailItem = {
  /** matches the `id` of the heading it points to */
  id: string
  label: string
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
}

const RAIL_X = 7
const STEP = 14

// a table of contents on a dashed rail that bends in where a heading is indented. a solid line fills
// the rail as you read, and a small ember at its tip turns with every bend
function ReadingRail({ items, container = null, offset = 24, title = "On this page", className, ...props }: ReadingRailProps) {
  const reduceMotion = useReducedMotion()
  const list = React.useRef<HTMLUListElement>(null)
  const base = React.useRef<SVGPathElement>(null)
  const trackRef = React.useRef<RailTrack | null>(null)
  const [current, setCurrent] = React.useState(0)
  const [percent, setPercent] = React.useState(0)
  const position = useMotionValue(0)

  const rows = useRailRows(list, RAIL_X, STEP, items)
  const track = React.useMemo(() => buildTrack(rows ?? []), [rows])

  // the fill, in px along the path. one spring drives the line and the ember together
  const reached = useSpring(0, reduceMotion ? { duration: 0 } : { stiffness: 200, damping: 30, mass: 0.7 })
  const fill = useMotionValue(0)
  const x = useMotionValue(RAIL_X)
  const y = useMotionValue(0)
  const angle = useMotionValue(0)

  React.useEffect(() => {
    trackRef.current = track
    const target = lengthAt(track, position.get())
    if (reduceMotion) reached.jump(target)
    else reached.set(target)
  }, [position, reduceMotion, reached, track])

  // keep the line and the ember on the path
  const place = React.useCallback(
    (length: number) => {
      const path = base.current
      const total = trackRef.current?.total ?? 0
      if (!path || !total) return
      fill.set(Math.min(length / total, 1))
      const here = path.getPointAtLength(Math.min(length, total))
      const ahead = path.getPointAtLength(Math.min(length + 1, total))
      const behind = path.getPointAtLength(Math.max(length - 1, 0))
      x.set(here.x)
      y.set(here.y)
      angle.set((Math.atan2(-(ahead.x - behind.x), ahead.y - behind.y) * 180) / Math.PI)
    },
    [angle, fill, x, y]
  )

  React.useEffect(() => reached.on("change", place), [place, reached])

  // when the rows are measured or move, put the ember back where the rail now is
  React.useEffect(() => place(reached.get()), [place, reached, track])

  React.useEffect(() => {
    let frame = 0
    const measure = () => {
      frame = 0
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
      const atEnd = scrollable > 0 && scrolled >= scrollable - 2
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
      if (reduceMotion) reached.jump(length)
      else reached.set(length)
      setCurrent(atEnd ? items.length - 1 : Math.max(index, 0))
      setPercent(scrollable > 0 ? Math.round(Math.min(Math.max(scrolled / scrollable, 0), 1) * 100) : 0)
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
  }, [container, items, offset, position, reached, reduceMotion, track])

  function go(id: string) {
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
    <nav data-slot="reading-rail" aria-label={title} className={cn("relative", className)} {...props}>
      <div className="mb-3 flex items-baseline justify-between pl-7">
        <p className="text-[11px] font-medium tracking-[0.08em] text-foreground/45 uppercase">{title}</p>
        <p className="text-[11px] text-foreground/45 tabular-nums">{percent}%</p>
      </div>
      <ul ref={list} className="relative flex flex-col">
        {rows && track.d && (
          <svg aria-hidden className="pointer-events-none absolute top-0 left-0 h-full w-8 overflow-visible">
            <path ref={base} d={track.d} fill="none" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="0.1 5" className="stroke-foreground/35" />
            <motion.path d={track.d} fill="none" strokeWidth="1.75" strokeLinecap="round" className="stroke-glow" style={{ pathLength: fill }} />
            {rows.map((row, index) => (
              <circle
                key={index}
                cx={row.x}
                cy={row.y}
                r={index === current ? 3.25 : 2.25}
                className={cn(index <= current ? "fill-glow" : "fill-background stroke-foreground/35", "transition-[r] duration-200")}
                strokeWidth="1.25"
              />
            ))}
            <motion.g style={{ x, y, rotate: angle }}>
              <rect x="-2.5" y="-6.5" width="5" height="13" rx="2.5" className="fill-glow stroke-background" strokeWidth="2" paintOrder="stroke" />
            </motion.g>
          </svg>
        )}
        {items.map((item, index) => (
          <li key={item.id} data-rail-row data-depth={item.depth ?? 0} className="relative">
            <button
              type="button"
              onClick={() => go(item.id)}
              aria-current={index === current ? "location" : undefined}
              className={cn(
                "flex min-h-8 w-full cursor-pointer items-center rounded-lg py-1.5 pr-2 text-left text-[13px] leading-snug outline-none transition-colors duration-150 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
                index === current ? "font-medium text-foreground" : index < current ? "text-foreground/70 hover:text-foreground" : "text-foreground/45 hover:text-foreground"
              )}
              style={{ paddingLeft: 28 + (item.depth ?? 0) * STEP }}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export { ReadingRail, type ReadingRailItem, type ReadingRailProps }
