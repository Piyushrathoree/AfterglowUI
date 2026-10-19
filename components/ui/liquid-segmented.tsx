"use client"

import * as React from "react"
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react"

import { LiquidGlass } from "@/components/ui/liquid-glass"
import { springs } from "@/lib/afterglow"
import { cn } from "@/lib/utils"

type LiquidSegment = {
  value: string
  label: React.ReactNode
  icon?: React.ReactNode
}

type LiquidSegmentedProps = Omit<
  React.ComponentProps<"div">,
  "defaultValue" | "onChange"
> & {
  options: LiquidSegment[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  "aria-label"?: string
}

const PADDING = 4

function LiquidSegmented({
  options,
  value,
  defaultValue,
  onValueChange,
  className,
  "aria-label": ariaLabel,
  ...props
}: LiquidSegmentedProps) {
  const reduceMotion = useReducedMotion()
  const listRef = React.useRef<HTMLDivElement>(null)
  const itemRefs = React.useRef(new Map<string, HTMLButtonElement>())
  const [internal, setInternal] = React.useState(defaultValue ?? options[0]?.value)
  const active = value ?? internal
  const index = Math.max(
    options.findIndex((option) => option.value === active),
    0
  )
  // every segment is the same width (an equal grid), so the thumb never changes shape
  const [segment, setSegment] = React.useState(0)
  const drag = React.useRef<{ startX: number; from: number; moved: boolean }>(
    null
  )

  const x = useSpring(0, springs.snappy)
  const velocity = useVelocity(x)
  const held = useMotionValue(0)
  const lift = useSpring(held, { stiffness: 420, damping: 26 })
  const scale = useTransform(lift, [0, 1], [1, reduceMotion ? 1 : 1.12])
  // the thumb stretches along its path when it moves fast
  const stretch = useTransform(() =>
    reduceMotion ? 1 : 1 + Math.min(Math.abs(velocity.get()) / 3000, 0.16)
  )
  const scaleX = useTransform(() => scale.get() * stretch.get())

  React.useLayoutEffect(() => {
    const node = listRef.current
    if (!node) return
    const measure = () => {
      const first = node.querySelector<HTMLElement>("[role=radio]")
      if (first) setSegment(first.offsetWidth)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  React.useEffect(() => {
    if (drag.current?.moved || !segment) return
    const target = PADDING + index * segment
    if (reduceMotion || x.get() === 0) x.jump(target)
    else x.set(target)
  }, [index, reduceMotion, segment, x])

  function select(next: string) {
    if (next === active) {
      x.set(PADDING + index * segment)
      return
    }
    if (value === undefined) setInternal(next)
    onValueChange?.(next)
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    const target = {
      ArrowRight: options[(index + 1) % options.length],
      ArrowDown: options[(index + 1) % options.length],
      ArrowLeft: options[(index - 1 + options.length) % options.length],
      ArrowUp: options[(index - 1 + options.length) % options.length],
    }[event.key]
    if (!target) return
    event.preventDefault()
    select(target.value)
    itemRefs.current.get(target.value)?.focus()
  }

  function endDrag() {
    const state = drag.current
    drag.current = null
    held.set(0)
    if (!state?.moved || !segment) return
    const nearest = Math.round((x.get() - PADDING) / segment)
    select(options[Math.min(Math.max(nearest, 0), options.length - 1)].value)
  }

  return (
    <div
      data-slot="liquid-segmented"
      className={cn("relative inline-flex touch-pan-y rounded-full", className)}
      {...props}
    >
      <LiquidGlass className="absolute inset-0 rounded-[inherit]" />
      <div
        ref={listRef}
        role="radiogroup"
        aria-label={ariaLabel}
        className="relative grid auto-cols-fr grid-flow-col select-none"
        style={{ padding: PADDING }}
        onPointerDown={(event) => {
          if (event.button !== 0) return
          drag.current = { startX: event.clientX, from: x.get(), moved: false }
          held.set(1)
        }}
        onPointerMove={(event) => {
          const state = drag.current
          if (!state) return
          const delta = event.clientX - state.startX
          if (!state.moved) {
            if (Math.abs(delta) < 5) return
            state.moved = true
            event.currentTarget.setPointerCapture(event.pointerId)
          }
          const last = PADDING + (options.length - 1) * segment
          x.jump(Math.min(Math.max(state.from + delta, PADDING), last))
        }}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {segment > 0 && (
          <motion.span
            aria-hidden
            className="absolute left-0 rounded-full"
            style={{
              top: PADDING,
              bottom: PADDING,
              width: segment,
              x,
              scaleX,
              scaleY: scale,
            }}
          >
            <LiquidGlass
              className="absolute inset-0 rounded-full"
              tint="oklch(1 0 0 / 14%)"
              magnify={0.06}
              frost={0}
            />
          </motion.span>
        )}
        {options.map((option, i) => {
          const selected = i === index
          return (
            <button
              key={option.value}
              ref={(node) => {
                if (node) itemRefs.current.set(option.value, node)
                else itemRefs.current.delete(option.value)
              }}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={selected ? 0 : -1}
              className="relative inline-flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-full px-4 text-sm font-medium whitespace-nowrap text-foreground/70 outline-none transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring aria-checked:text-foreground [&_svg]:size-4"
              onClick={() => select(option.value)}
              onKeyDown={handleKeyDown}
            >
              {option.icon}
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export { LiquidSegmented, type LiquidSegment, type LiquidSegmentedProps }
