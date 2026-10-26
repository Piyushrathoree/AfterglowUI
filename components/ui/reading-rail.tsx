"use client"

import * as React from "react"
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react"

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

// a table of contents on a dashed rail that bends in where a heading is indented. a solid line fills
// the rail as you read, and a small endpoint bead follows the path
function ReadingRail({ items, container = null, offset = 24, title = "On this page", activeId, onActiveIdChange, size = "default", className, ...props }: ReadingRailProps) {
  const reduceMotion = useReducedMotion()
  const large = size === "large"
  const railX = large ? 12 : RAIL_X
  const step = large ? 20 : STEP
  const list = React.useRef<HTMLUListElement>(null)
  const base = React.useRef<SVGPathElement>(null)
  const trackRef = React.useRef<RailTrack | null>(null)
  const [current, setCurrent] = React.useState(0)
  const position = useMotionValue(0)

  const rows = useRailRows(list, railX, step, items)
  const track = React.useMemo(() => buildTrack(rows ?? []), [rows])

  // the fill, in px along the path. one spring drives the line and endpoint bead together
  const reached = useSpring(0, reduceMotion ? { duration: 0 } : { stiffness: 200, damping: 30, mass: 0.7 })
  const fill = useMotionValue(0)
  const x = useMotionValue(railX)
  const y = useMotionValue(0)

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
        if (index < 0) { position.set(0); reached.jump(0); setCurrent(-1); return }
        position.set(index)
        const length = lengthAt(trackRef.current ?? track, index)
        if (reduceMotion) reached.jump(length)
        else reached.set(length)
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
      if (reduceMotion) reached.jump(length)
      else reached.set(length)
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
  }, [activeId, container, items, offset, position, reached, reduceMotion, track])

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
          <span aria-hidden className="flex w-6 shrink-0 flex-col gap-[4px] text-foreground/55">
            <span className="h-[2px] w-full rounded-full bg-current" />
            <span className="h-[2px] w-[17px] rounded-full bg-current" />
            <span className="h-[2px] w-[21px] rounded-full bg-current" />
          </span>
        )}
        <p className={cn("text-[13px] font-medium tracking-tight text-foreground/70", large && "text-[24px] leading-tight font-normal text-foreground/65 sm:text-[30px]")}>{title}</p>
      </div>
      <ul ref={list} className="relative flex flex-col">
        {rows && track.d && (
          <svg aria-hidden className={cn("pointer-events-none absolute top-0 left-0 h-full overflow-visible", large ? "w-16" : "w-8")}>
            <path ref={base} d={track.d} fill="none" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="0.1 5" className="stroke-foreground/35" />
            <motion.path d={track.d} fill="none" strokeWidth={large ? 2 : 1.75} strokeLinecap="round" className={large ? "stroke-foreground/55" : "stroke-glow"} style={{ pathLength: fill }} />
            {rows.map((row, index) => (
              <circle
                key={index}
                cx={row.x}
                cy={row.y}
                r={large ? (index === current ? 4 : 3.5) : (index === current ? 3.25 : 2.25)}
                className={cn(index <= current ? (large ? "fill-foreground/35" : "fill-glow") : "fill-background stroke-foreground/35", "transition-[r] duration-200")}
                strokeWidth={large ? 1.5 : 1.25}
              />
            ))}
            <motion.g style={{ x, y, opacity: current < 0 ? 0 : 1 }}>
              <circle
                r={large ? 5.5 : 4.25}
                className={large ? "fill-background stroke-foreground/75" : "fill-background stroke-glow"}
                strokeWidth={large ? 1.75 : 1.5}
              />
              <circle r={large ? 1.8 : 1.5} className={large ? "fill-foreground" : "fill-glow"} />
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
                cn("flex min-h-8 w-full cursor-pointer items-center rounded-lg py-1.5 pr-2 text-left text-[13px] leading-snug outline-none transition-colors duration-150 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring", large && "min-h-[48px] rounded-none py-1.5 text-[20px] sm:min-h-[52px] sm:text-[24px]"),
                index === current ? "font-medium text-foreground" : index < current ? "text-foreground/70 hover:text-foreground" : "text-foreground/45 hover:text-foreground"
              )}
              style={{ paddingLeft: (large ? 40 : 28) + (item.depth ?? 0) * step }}
            >
              {item.label}
            </Element>
          </li>
        )})}
      </ul>
    </nav>
  )
}

export { ReadingRail, type ReadingRailItem, type ReadingRailProps }
