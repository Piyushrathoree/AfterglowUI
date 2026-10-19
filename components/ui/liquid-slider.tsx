"use client"

import * as React from "react"
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react"

import { LiquidGlass } from "@/components/ui/liquid-glass"
import { springs } from "@/lib/afterglow"
import { cn } from "@/lib/utils"

const THUMB_WIDTH = 38
const THUMB_HEIGHT = 24
// the thumb's center travels from one half-width in to one half-width short of the end
const INSET = THUMB_WIDTH / 2
const MAX_STRETCH = 22

type LiquidSliderProps = Omit<
  React.ComponentProps<"div">,
  "defaultValue" | "onChange"
> & {
  value?: number
  defaultValue?: number
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  onValueChange?: (value: number) => void
  onValueCommit?: (value: number) => void
  /** text read out by screen readers, e.g. "40%" */
  getValueText?: (value: number) => string
}

function LiquidSlider({
  value,
  defaultValue,
  min = 0,
  max = 100,
  step = 1,
  disabled,
  onValueChange,
  onValueCommit,
  getValueText,
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  ...props
}: LiquidSliderProps) {
  const reduceMotion = useReducedMotion()
  const rootRef = React.useRef<HTMLDivElement>(null)
  const thumbRef = React.useRef<HTMLDivElement>(null)
  const [internal, setInternal] = React.useState(defaultValue ?? min)
  const [dragging, setDragging] = React.useState(false)

  const clamp = (v: number) => Math.min(Math.max(v, min), max)
  const current = clamp(value ?? internal)
  // the newest value, readable between renders while a drag is in flight
  const latest = React.useRef(current)
  React.useEffect(() => {
    latest.current = current
  }, [current])
  const ratio = max > min ? (current - min) / (max - min) : 0

  const progress = useSpring(ratio, springs.snappy)
  const width = useMotionValue(0)
  const band = useSpring(0, springs.snappy)
  const lens = useSpring(0, { stiffness: 380, damping: 24, mass: 0.7 })

  const baseX = useTransform(
    () => INSET + progress.get() * Math.max(width.get() - THUMB_WIDTH, 0)
  )
  const thumbX = useTransform(() => baseX.get() + band.get())
  const fillX = useTransform(() => baseX.get() - width.get())
  const trackScale = useTransform(() => {
    const w = width.get()
    return w ? 1 + Math.abs(band.get()) / w : 1
  })
  const trackOrigin = useTransform(band, (b) => (b < 0 ? 1 : 0))
  const thumbScale = useTransform(lens, [0, 1], [1, reduceMotion ? 1 : 1.6])
  const fill = useTransform(lens, [0, 0.6], [1, 0])

  React.useEffect(() => {
    if (reduceMotion) progress.jump(ratio)
    else progress.set(ratio)
  }, [progress, ratio, reduceMotion])

  React.useLayoutEffect(() => {
    const node = rootRef.current
    if (!node) return
    width.jump(node.offsetWidth)
    const observer = new ResizeObserver(() => width.jump(node.offsetWidth))
    observer.observe(node)
    return () => observer.disconnect()
  }, [width])

  function commit(next: number) {
    const decimals = (String(step).split(".")[1] ?? "").length
    const snapped = clamp(
      Number((Math.round((next - min) / step) * step + min).toFixed(decimals))
    )
    if (snapped === latest.current) return snapped
    latest.current = snapped
    if (value === undefined) setInternal(snapped)
    onValueChange?.(snapped)
    return snapped
  }

  function fromPointer(clientX: number) {
    const rect = rootRef.current?.getBoundingClientRect()
    if (!rect) return
    const usable = Math.max(rect.width - THUMB_WIDTH, 1)
    const r = Math.min(Math.max((clientX - rect.left - INSET) / usable, 0), 1)
    commit(min + r * (max - min))
    if (reduceMotion) return
    const over =
      clientX < rect.left
        ? clientX - rect.left
        : clientX > rect.right
          ? clientX - rect.right
          : 0
    // resistance grows the further you pull, so it never stretches past MAX_STRETCH
    band.set(Math.sign(over) * MAX_STRETCH * (1 - 1 / (1 + Math.abs(over) / 60)))
  }

  function stopDrag() {
    if (!dragging) return
    setDragging(false)
    band.set(0)
    lens.set(0)
    onValueCommit?.(latest.current)
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const big = Math.max(step, (max - min) / 10)
    const delta = {
      ArrowRight: step,
      ArrowUp: step,
      ArrowLeft: -step,
      ArrowDown: -step,
      PageUp: big,
      PageDown: -big,
    }[event.key]
    let next: number | undefined
    if (delta !== undefined) next = latest.current + delta
    else if (event.key === "Home") next = min
    else if (event.key === "End") next = max
    if (next === undefined) return
    event.preventDefault()
    const committed = commit(next)
    onValueCommit?.(committed)
  }

  return (
    <div
      ref={rootRef}
      data-slot="liquid-slider"
      data-disabled={disabled ? "" : undefined}
      className={cn(
        "relative flex h-9 w-full touch-pan-y items-center select-none data-disabled:pointer-events-none data-disabled:opacity-50",
        className
      )}
      onPointerDown={(event) => {
        if (disabled || event.button !== 0) return
        event.preventDefault()
        event.currentTarget.setPointerCapture(event.pointerId)
        thumbRef.current?.focus({ preventScroll: true })
        setDragging(true)
        if (!reduceMotion) lens.set(1)
        fromPointer(event.clientX)
      }}
      onPointerMove={(event) => {
        if (dragging) fromPointer(event.clientX)
      }}
      onPointerUp={stopDrag}
      onPointerCancel={stopDrag}
      {...props}
    >
      <motion.div
        className="relative h-1.5 w-full overflow-hidden rounded-full bg-foreground/15"
        style={{ scaleX: trackScale, originX: trackOrigin }}
      >
        <motion.div
          className="absolute inset-0 rounded-full bg-glow"
          style={{ x: fillX }}
        />
      </motion.div>

      <motion.div className="absolute top-1/2 left-0" style={{ x: thumbX }}>
        <motion.div
          ref={thumbRef}
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={current}
          aria-valuetext={getValueText?.(current)}
          aria-disabled={disabled || undefined}
          className="relative -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:cursor-grabbing"
          style={{ width: THUMB_WIDTH, height: THUMB_HEIGHT, scale: thumbScale }}
          onKeyDown={handleKeyDown}
        >
          {/* while held, the thumb turns into a lens that magnifies the track */}
          <LiquidGlass
            className="absolute inset-0 rounded-full"
            magnify={0.18}
            frost={0}
            refraction={lens}
            presence={lens}
          />
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-full bg-white shadow-[0_2px_6px_-1px_oklch(0_0_0/30%),0_0_0_0.5px_oklch(0_0_0/6%)]"
            style={{ opacity: fill }}
          />
        </motion.div>
      </motion.div>
    </div>
  )
}

export { LiquidSlider, type LiquidSliderProps }
