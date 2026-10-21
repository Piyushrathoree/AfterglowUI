"use client"

import * as React from "react"
import { AnimateIcon } from "@/components/animate-ui/icons/icon"
import { X } from "@/components/animate-ui/icons/x"
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type AnimationPlaybackControls,
} from "motion/react"

import { spring } from "@/lib/afterglow"
import { cn } from "@/lib/utils"

type ToastOptions = {
  id?: string
  description?: React.ReactNode
  icon?: React.ReactNode
  /** milliseconds, Infinity keeps the toast until dismissed */
  duration?: number
  action?: { label: string; onClick: () => void }
}

type ToastItem = Omit<ToastOptions, "id"> & {
  id: string
  title: React.ReactNode
}

// a tiny store, so toast() can be called from anywhere
let toasts: ToastItem[] = []
let count = 0
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((listener) => listener())
const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
const getSnapshot = () => toasts
const empty: ToastItem[] = []

function toast(title: React.ReactNode, { id, ...options }: ToastOptions = {}) {
  const key = id ?? `toast-${++count}`
  toasts = [
    { id: key, title, ...options },
    ...toasts.filter((item) => item.id !== key),
  ].slice(0, 20)
  emit()
  return key
}

toast.dismiss = (id?: string) => {
  toasts = id ? toasts.filter((item) => item.id !== id) : []
  emit()
}

const positions = {
  "top-left": "top-6 left-6",
  "top-center": "top-6 left-1/2 -translate-x-1/2",
  "top-right": "top-6 right-6",
  "bottom-left": "bottom-6 left-6",
  "bottom-center": "bottom-6 left-1/2 -translate-x-1/2",
  "bottom-right": "bottom-6 right-6",
}

type GlassToasterProps = Omit<React.ComponentProps<"section">, "children"> & {
  position?: keyof typeof positions
  /** how many toasts show in the collapsed stack */
  visible?: number
  gap?: number
}

const PEEK = 14

function GlassToaster({
  position = "bottom-right",
  visible = 3,
  gap = 10,
  className,
  ...props
}: GlassToasterProps) {
  const items = React.useSyncExternalStore(subscribe, getSnapshot, () => empty)
  const [hovered, setHovered] = React.useState(false)
  const [hidden, setHidden] = React.useState(false)
  const [heights, setHeights] = React.useState<Record<string, number>>({})
  const expanded = hovered && items.length > 0
  const top = position.startsWith("top")
  const direction = top ? 1 : -1

  React.useEffect(() => {
    const update = () => setHidden(document.visibilityState === "hidden")
    document.addEventListener("visibilitychange", update)
    return () => document.removeEventListener("visibilitychange", update)
  }, [])

  const report = React.useCallback((id: string, height: number) => {
    setHeights((prev) => (prev[id] === height ? prev : { ...prev, [id]: height }))
  }, [])

  const front = heights[items[0]?.id] ?? 0
  const shown = items.slice(0, visible)
  const stackHeight = expanded
    ? shown.reduce((sum, item) => sum + (heights[item.id] ?? 0), 0) +
      gap * Math.max(shown.length - 1, 0)
    : front + PEEK * Math.max(shown.length - 1, 0)

  // expanded, each toast sits above the ones that arrived after it
  const offsets: number[] = []
  items.forEach((item, index) => {
    offsets.push(
      index === 0 ? 0 : offsets[index - 1] + (heights[items[index - 1].id] ?? 0) + gap
    )
  })

  return (
    <section
      data-slot="glass-toaster"
      aria-label="Notifications"
      className={cn(
        "fixed z-50 w-[min(356px,calc(100vw-3rem))]",
        positions[position],
        className
      )}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setHovered(false)
      }}
      {...props}
    >
      <ol
        aria-live="polite"
        aria-relevant="additions text"
        className="relative"
        style={{ height: stackHeight }}
      >
        <AnimatePresence initial={false}>
          {items.map((item, index) => {
            const height = heights[item.id]
            const y = expanded ? offsets[index] : index * PEEK
            return (
              <ToastCard
                key={item.id}
                item={item}
                index={index}
                y={direction * y}
                direction={direction}
                anchor={top ? "top" : "bottom"}
                expanded={expanded}
                hiddenInStack={index >= visible}
                height={!expanded && index > 0 ? front : height}
                paused={expanded || hidden || index >= visible}
                onHeight={report}
              />
            )
          })}
        </AnimatePresence>
      </ol>
    </section>
  )
}

type ToastCardProps = {
  item: ToastItem
  index: number
  y: number
  direction: number
  anchor: "top" | "bottom"
  expanded: boolean
  hiddenInStack: boolean
  height: number | undefined
  paused: boolean
  onHeight: (id: string, height: number) => void
}

function ToastCard({
  item,
  index,
  y,
  direction,
  anchor,
  expanded,
  hiddenInStack,
  height,
  paused,
  onHeight,
}: ToastCardProps) {
  const reduceMotion = useReducedMotion()
  const contentRef = React.useRef<HTMLDivElement>(null)
  const life = useMotionValue(1)
  const timer = React.useRef<AnimationPlaybackControls>(null)
  const x = useMotionValue(0)
  const swipeFade = useTransform(x, [-240, 0, 240], [0, 1, 0])
  const duration = item.duration ?? 4000
  const collapsedBehind = !expanded && index > 0

  React.useLayoutEffect(() => {
    const node = contentRef.current
    if (!node) return
    onHeight(item.id, node.offsetHeight)
    const observer = new ResizeObserver(() => onHeight(item.id, node.offsetHeight))
    observer.observe(node)
    return () => observer.disconnect()
  }, [item.id, onHeight])

  // the progress line burns down like an ember, and the toast leaves when it's out
  React.useEffect(() => {
    if (!Number.isFinite(duration)) return
    timer.current = animate(life, 0, {
      duration: duration / 1000,
      ease: "linear",
      onComplete: () => toast.dismiss(item.id),
    })
    timer.current.pause()
    return () => timer.current?.stop()
  }, [duration, item.id, life])

  React.useEffect(() => {
    if (paused) timer.current?.pause()
    else timer.current?.play()
  }, [paused])

  const scale = expanded ? 1 : 1 - Math.min(index, 3) * 0.05

  return (
    <motion.li
      className={cn(
        "absolute inset-x-0",
        anchor === "top" ? "top-0" : "bottom-0",
        hiddenInStack && "pointer-events-none"
      )}
      style={{ zIndex: 100 - index }}
      initial={{ opacity: 0, y: -direction * 24, scale: 0.95 }}
      animate={{
        opacity: hiddenInStack ? 0 : 1,
        y,
        scale,
        height: height ?? "auto",
      }}
      exit={{
        opacity: 0,
        scale: 0.95,
        transition: { duration: 0.15, ease: "easeIn" },
      }}
      transition={reduceMotion ? { duration: 0 } : spring("soft")}
    >
      <motion.div
        className="relative h-full overflow-hidden rounded-2xl bg-card/80 shadow-glass backdrop-blur-xl backdrop-saturate-150"
        style={{ x, opacity: swipeFade }}
        drag={reduceMotion ? false : "x"}
        dragMomentum={false}
        onDragEnd={(_, info) => {
          const out = Math.abs(info.offset.x) > 90 || Math.abs(info.velocity.x) > 600
          if (out) {
            const side = Math.sign(info.offset.x || info.velocity.x)
            animate(x, side * 400, { duration: 0.2, ease: "easeOut" }).then(() =>
              toast.dismiss(item.id)
            )
          } else {
            animate(x, 0, spring("snappy"))
          }
        }}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-linear-to-b from-gloss-highlight/40 to-transparent"
        />
        <motion.div
          ref={contentRef}
          className="relative flex gap-3 p-4 pr-10"
          animate={{ opacity: collapsedBehind ? 0 : 1 }}
          transition={{ duration: 0.15 }}
        >
          {item.icon && (
            <span className="relative mt-0.5 grid size-5 shrink-0 place-items-center text-glow [&>svg]:size-4">
              <span className="absolute inset-0 rounded-full bg-glow/30 blur-sm" />
              <span className="relative">{item.icon}</span>
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground">{item.title}</p>
            {item.description && (
              <p className="mt-0.5 text-[13px] text-muted-foreground">
                {item.description}
              </p>
            )}
            {item.action && (
              <button
                type="button"
                className="mt-3 h-7 rounded-full bg-glow px-3 text-xs font-medium text-glow-foreground shadow-gloss outline-none transition-transform duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-96"
                onClick={() => {
                  item.action?.onClick()
                  toast.dismiss(item.id)
                }}
              >
                {item.action.label}
              </button>
            )}
          </div>
          <AnimateIcon animateOnHover asChild>
          <button
            type="button"
            aria-label="Dismiss notification"
            className="absolute top-3 right-3 grid size-6 place-items-center rounded-full text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
            onClick={() => toast.dismiss(item.id)}
          >
            <X aria-hidden className="size-3.5" />
          </button>
          </AnimateIcon>
        </motion.div>
        {Number.isFinite(duration) && (
          <motion.span
            aria-hidden
            className="absolute inset-x-4 bottom-0 h-px origin-left bg-linear-to-r from-glow-3/0 via-glow-2 to-glow shadow-[0_0_8px_var(--glow)]"
            style={{ scaleX: life }}
          />
        )}
      </motion.div>
    </motion.li>
  )
}

export { GlassToaster, toast, type GlassToasterProps, type ToastOptions }
