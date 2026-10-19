"use client"

import * as React from "react"
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react"

import { afterglow, spring, springs } from "@/lib/afterglow"
import { cn } from "@/lib/utils"

const THUMB = 22
// the thumb's center travels from one radius in to one radius short of the end
const INSET = THUMB / 2
const MAX_STRETCH = 26

type GlassSliderProps = Omit<
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
  formatValue?: (value: number) => React.ReactNode
}

function GlassSlider({
  value,
  defaultValue,
  min = 0,
  max = 100,
  step = 1,
  disabled,
  onValueChange,
  onValueCommit,
  formatValue = (v) => v,
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  ...props
}: GlassSliderProps) {
  const reduceMotion = useReducedMotion()
  const rootRef = React.useRef<HTMLDivElement>(null)
  const thumbRef = React.useRef<HTMLDivElement>(null)
  const [internal, setInternal] = React.useState(defaultValue ?? min)
  const [dragging, setDragging] = React.useState(false)
  const [focusVisible, setFocusVisible] = React.useState(false)

  const clamp = (v: number) => Math.min(Math.max(v, min), max)
  const current = clamp(value ?? internal)
  // the newest value, readable between renders while a drag is in flight
  const latest = React.useRef(current)
  React.useEffect(() => {
    latest.current = current
  }, [current])
  const ratio = max > min ? (current - min) / (max - min) : 0
  const label = formatValue(current)

  const progress = useSpring(ratio, springs.snappy)
  const width = useMotionValue(0)
  // signed rubber-band distance while dragging past either end
  const band = useSpring(0, springs.snappy)
  const halo = useMotionValue(0)

  const baseX = useTransform(
    () => INSET + progress.get() * Math.max(width.get() - THUMB, 0)
  )
  const thumbX = useTransform(() => baseX.get() + band.get())
  const fillX = useTransform(() => baseX.get() - width.get())
  const trackScale = useTransform(() => {
    const w = width.get()
    return w ? 1 + Math.abs(band.get()) / w : 1
  })
  const trackOrigin = useTransform(band, (b) => (b < 0 ? 1 : 0))
  // the value bubble leans into fast movement, then settles upright
  const tilt = useTransform(useVelocity(progress), [-3, 0, 3], [-14, 0, 14])

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
    const usable = Math.max(rect.width - THUMB, 1)
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

  function glowUp() {
    animate(halo, 1, { duration: 0.15 })
  }

  function glowDown() {
    animate(halo, 0, { duration: afterglow.linger, ease: afterglow.ease })
  }

  function stopDrag() {
    if (!dragging) return
    setDragging(false)
    band.set(0)
    glowDown()
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
    setFocusVisible(true)
    const committed = commit(next)
    onValueCommit?.(committed)
    halo.jump(1)
    glowDown()
  }

  return (
    <div
      ref={rootRef}
      data-slot="glass-slider"
      data-disabled={disabled ? "" : undefined}
      className={cn(
        "relative flex h-8 w-full touch-pan-y items-center select-none data-disabled:pointer-events-none data-disabled:opacity-50",
        className
      )}
      onPointerDown={(event) => {
        if (disabled || event.button !== 0) return
        event.preventDefault()
        event.currentTarget.setPointerCapture(event.pointerId)
        thumbRef.current?.focus({ preventScroll: true })
        setDragging(true)
        glowUp()
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
        className="relative h-2 w-full overflow-hidden rounded-full bg-foreground/12 shadow-well"
        style={{ scaleX: trackScale, originX: trackOrigin }}
      >
        {/* hottest at the thumb, cooling to violet behind it */}
        <motion.div
          className="absolute inset-0 rounded-full bg-linear-to-r from-glow-3/60 via-glow-2/85 to-glow"
          style={{ x: fillX }}
        />
        <div className="absolute inset-x-0 top-0 h-1/2 bg-linear-to-b from-white/25 to-transparent" />
      </motion.div>

      <motion.div className="absolute top-1/2 left-0" style={{ x: thumbX }}>
        <AnimatePresence>
          {(dragging || focusVisible) && (
            <motion.div
              aria-hidden
              className="absolute bottom-5 left-0 origin-bottom -translate-x-1/2"
              style={{ rotate: reduceMotion ? 0 : tilt }}
            >
              <motion.div
                className="mb-1 min-w-9 rounded-lg bg-card px-2 py-1 text-center font-mono text-xs font-medium text-foreground tabular-nums shadow-glass"
                initial={{ opacity: 0, y: 6, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.95, transition: { duration: 0.12 } }}
                transition={spring("snappy")}
              >
                {label}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          ref={thumbRef}
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={current}
          aria-valuetext={typeof label === "string" ? label : undefined}
          aria-disabled={disabled || undefined}
          className="relative -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:cursor-grabbing"
          style={{ width: THUMB, height: THUMB }}
          animate={{ scale: dragging && !reduceMotion ? 1.15 : 1 }}
          transition={spring("snappy")}
          onKeyDown={handleKeyDown}
          onFocus={(event) =>
            setFocusVisible(event.currentTarget.matches(":focus-visible"))
          }
          onBlur={() => setFocusVisible(false)}
        >
          <motion.span
            aria-hidden
            className="absolute -inset-1.5 rounded-full bg-glow blur-md"
            style={{ opacity: halo }}
          />
          <span
            aria-hidden
            className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_28%,oklch(1_0_0),oklch(0.93_0.01_285)_55%,oklch(0.84_0.015_285))] shadow-gloss"
          />
          <span
            aria-hidden
            className="absolute inset-x-1 top-0.5 h-1/2 rounded-full bg-linear-to-b from-white/90 to-transparent"
          />
        </motion.div>
      </motion.div>
    </div>
  )
}

export { GlassSlider, type GlassSliderProps }
