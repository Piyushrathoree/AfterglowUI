"use client"

import * as React from "react"
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, type MotionValue } from "motion/react"

import { springs } from "@/lib/afterglow"
import { cn } from "@/lib/utils"

type ScrollRailItem = {
  /** matches a `data-rail-id` on the element it points to */
  id: string
  title: string
  excerpt?: string
  /** items in the same group sit together; a new group starts with a little gap and a label */
  group?: string
}

type ScrollRailProps = Omit<React.ComponentProps<"nav">, "children"> & {
  items: ScrollRailItem[]
  /** the element that scrolls; leave it out to follow the page */
  container?: HTMLElement | null
  /** which edge of its content the rail sits on; the preview opens toward the content */
  side?: "left" | "right"
}

const TICK = 14
const REACH = 76
const REST = 12
const ACTIVE = 22
const SWELL = 14

// a column of ticks, one for each part of a long scroll. the tick you are on is longer, ticks
// swell toward your pointer, and hovering one opens a preview that glides from tick to tick
function ScrollRail({ items, container = null, side = "right", className, onPointerMove, onPointerLeave, ...props }: ScrollRailProps) {
  const reduceMotion = useReducedMotion()
  const [active, setActive] = React.useState(0)
  const [hover, setHover] = React.useState<{ index: number; y: number } | null>(null)
  const pointerY = useMotionValue(Infinity)
  const buttons = React.useRef<(HTMLButtonElement | null)[]>([])
  const hideTimer = React.useRef(0)
  // the tick you clicked stays lit even if the content ends before that part can reach the top;
  // it lets go as soon as you scroll yourself
  const pinned = React.useRef<number | null>(null)

  const find = React.useCallback(
    (id: string) => (container ?? document).querySelector<HTMLElement>(`[data-rail-id="${CSS.escape(id)}"]`),
    [container]
  )

  // the current part is the last one whose top has passed a line near the top of the view, so the part
  // you just jumped to is the one that lights up
  React.useEffect(() => {
    let frame = 0
    pinned.current = null
    const measure = () => {
      frame = 0
      if (pinned.current !== null) {
        setActive(pinned.current)
        return
      }
      const top = container ? container.getBoundingClientRect().top : 0
      const height = container ? container.clientHeight : window.innerHeight
      const line = top + height * 0.15
      let next = 0
      items.forEach((item, index) => {
        const node = find(item.id)
        if (node && node.getBoundingClientRect().top <= line) next = index
      })
      const atEnd = container
        ? container.scrollTop + container.clientHeight >= container.scrollHeight - 2
        : window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2
      const atStart = container ? container.scrollTop <= 2 : window.scrollY <= 2
      setActive(atStart ? 0 : atEnd ? items.length - 1 : next)
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure)
    }
    schedule()
    const scroller: HTMLElement | Window = container ?? window
    const release = () => {
      pinned.current = null
      schedule()
    }
    scroller.addEventListener("scroll", schedule, { passive: true })
    scroller.addEventListener("wheel", release, { passive: true })
    scroller.addEventListener("touchmove", release, { passive: true })
    scroller.addEventListener("pointerdown", release)
    window.addEventListener("keydown", release)
    window.addEventListener("resize", schedule)
    return () => {
      cancelAnimationFrame(frame)
      scroller.removeEventListener("scroll", schedule)
      scroller.removeEventListener("wheel", release)
      scroller.removeEventListener("touchmove", release)
      scroller.removeEventListener("pointerdown", release)
      window.removeEventListener("keydown", release)
      window.removeEventListener("resize", schedule)
    }
  }, [container, find, items])

  React.useEffect(() => () => window.clearTimeout(hideTimer.current), [])

  function show(index: number) {
    window.clearTimeout(hideTimer.current)
    const node = buttons.current[index]
    if (node) setHover({ index, y: node.offsetTop + node.offsetHeight / 2 })
  }

  function hideSoon() {
    window.clearTimeout(hideTimer.current)
    hideTimer.current = window.setTimeout(() => setHover(null), 120)
  }

  function go(index: number) {
    pinned.current = index
    setActive(index)
    find(items[index].id)?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" })
  }

  function onKeyDown(event: React.KeyboardEvent, index: number) {
    const to =
      event.key === "ArrowDown" || event.key === "ArrowRight"
        ? Math.min(index + 1, items.length - 1)
        : event.key === "ArrowUp" || event.key === "ArrowLeft"
          ? Math.max(index - 1, 0)
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? items.length - 1
              : null
    if (to === null) return
    event.preventDefault()
    buttons.current[to]?.focus()
  }

  const item = hover ? items[hover.index] : null

  return (
    <nav
      data-slot="scroll-rail"
      aria-label="Jump to"
      className={cn("relative w-8", className)}
      onPointerMove={(event) => {
        onPointerMove?.(event)
        pointerY.set(event.clientY)
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event)
        pointerY.set(Infinity)
        hideSoon()
      }}
      {...props}
    >
      <div className="relative flex flex-col" onPointerLeave={hideSoon}>
        {items.map((entry, index) => (
          <Tick
            key={entry.id}
            ref={(node) => {
              buttons.current[index] = node
            }}
            label={entry.title}
            className={index > 0 && entry.group !== items[index - 1].group ? "mt-3" : undefined}
            side={side}
            active={index === active}
            pointerY={pointerY}
            onClick={() => go(index)}
            onPointerEnter={() => show(index)}
            onFocus={() => show(index)}
            onBlur={hideSoon}
            onKeyDown={(event) => onKeyDown(event, index)}
            tabIndex={index === active ? 0 : -1}
          />
        ))}

        <AnimatePresence>
          {hover && item && (
            <motion.div
              key="preview"
              aria-hidden
              className={cn("pointer-events-none absolute top-0 z-10 w-72", side === "right" ? "right-full mr-3" : "left-full ml-3")}
              style={{ transformOrigin: side === "right" ? "right center" : "left center" }}
              initial={{ opacity: 0, scale: 0.96, y: hover.y }}
              animate={{ opacity: 1, scale: 1, y: hover.y }}
              exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.1 } }}
              transition={{
                opacity: { duration: 0.15 },
                scale: { type: "spring", duration: 0.25, bounce: 0 },
                y: reduceMotion ? { duration: 0 } : springs.snappy,
              }}
            >
              <div className="-translate-y-1/2 rounded-[20px] bg-glass p-3.5 shadow-glass backdrop-blur-2xl backdrop-saturate-150">
                <div className="relative">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.div
                      key={hover.index}
                      initial={{ opacity: 0, y: reduceMotion ? 0 : 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, transition: { duration: 0.08 } }}
                      transition={{ duration: 0.15, ease: [0.2, 0.8, 0.2, 1] }}
                    >
                      <p className="text-[11px] text-foreground/50 tabular-nums">
                        {item.group ? `${item.group} · ` : ""}
                        {hover.index + 1} of {items.length}
                      </p>
                      <p className="mt-0.5 truncate text-sm font-medium text-foreground">{item.title}</p>
                      {item.excerpt && (
                        <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-foreground/60">{item.excerpt}</p>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}

type TickProps = Omit<React.ComponentProps<"button">, "children"> & {
  label: string
  side: "left" | "right"
  active: boolean
  pointerY: MotionValue<number>
}

function Tick({ ref, label, side, active, pointerY, className, ...props }: TickProps) {
  const reduceMotion = useReducedMotion()
  const node = React.useRef<HTMLButtonElement | null>(null)
  const width = useSpring(REST, { stiffness: 420, damping: 32 })
  const opacity = useSpring(0.3, { stiffness: 420, damping: 32 })

  // swell with how near the pointer is, on top of the resting length
  React.useEffect(() => {
    const update = () => {
      const y = pointerY.get()
      let near = 0
      if (Number.isFinite(y) && node.current) {
        const rect = node.current.getBoundingClientRect()
        near = Math.max(0, 1 - Math.abs(y - (rect.top + rect.height / 2)) / REACH)
      }
      const nextWidth = (active ? ACTIVE : REST) + SWELL * near
      const nextOpacity = active ? 1 : 0.3 + 0.4 * near
      if (reduceMotion) {
        width.jump(nextWidth)
        opacity.jump(nextOpacity)
      } else {
        width.set(nextWidth)
        opacity.set(nextOpacity)
      }
    }
    update()
    return pointerY.on("change", update)
  }, [active, opacity, pointerY, reduceMotion, width])

  return (
    <button
      ref={(element) => {
        node.current = element
        if (typeof ref === "function") ref(element)
        else if (ref) ref.current = element
      }}
      type="button"
      aria-label={label}
      aria-current={active ? "true" : undefined}
      className={cn(
        "group flex w-8 cursor-pointer items-center rounded-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring",
        side === "right" ? "justify-end" : "justify-start",
        className
      )}
      style={{ height: TICK }}
      {...props}
    >
      <motion.span aria-hidden className="h-[2px] rounded-full bg-foreground" style={{ width, opacity }} />
    </button>
  )
}

export { ScrollRail, type ScrollRailItem, type ScrollRailProps }
