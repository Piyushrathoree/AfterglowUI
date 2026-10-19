"use client"

import * as React from "react"
import {
  motion,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react"

import { LiquidGlass } from "@/components/ui/liquid-glass"
import { springs } from "@/lib/afterglow"
import { cn } from "@/lib/utils"

const TRACK_WIDTH = 64
const TRACK_HEIGHT = 28
const PADDING = 2
const KNOB_WIDTH = 38
const KNOB_HEIGHT = TRACK_HEIGHT - PADDING * 2
const TRAVEL = TRACK_WIDTH - PADDING * 2 - KNOB_WIDTH
// how long the knob stays glass after a tap, so you see it slide as a lens
const LENS_HOLD = 240

type LiquidSwitchProps = Omit<
  React.ComponentProps<"button">,
  "value" | "defaultValue" | "onChange"
> & {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

function LiquidSwitch({
  checked,
  defaultChecked = false,
  onCheckedChange,
  className,
  style,
  disabled,
  onClick,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  ...props
}: LiquidSwitchProps) {
  const reduceMotion = useReducedMotion()
  const [internal, setInternal] = React.useState(defaultChecked)
  const on = checked ?? internal

  const x = useSpring(on ? TRAVEL : 0, springs.snappy)
  // 0 is the resting white knob, 1 is the swollen glass lens
  const lens = useSpring(0, { stiffness: 380, damping: 24, mass: 0.7 })
  const velocity = useVelocity(x)
  const drag = React.useRef<{ startX: number; from: number; moved: boolean }>(
    null
  )
  const skipClick = React.useRef(false)
  const settle = React.useRef<number>(undefined)

  const scale = useTransform(lens, [0, 1], [1, reduceMotion ? 1 : 1.5])
  // the lens stretches along its path when it moves fast, like a drop
  const stretch = useTransform(() =>
    reduceMotion ? 1 : 1 + Math.min(Math.abs(velocity.get()) / 2600, 0.18)
  )
  const scaleX = useTransform(() => scale.get() * stretch.get())
  const fill = useTransform(lens, [0, 0.6], [1, 0])
  const trackGlow = useTransform(x, [0, TRAVEL], [0, 1])

  React.useEffect(() => {
    if (drag.current) return
    if (reduceMotion) x.jump(on ? TRAVEL : 0)
    else x.set(on ? TRAVEL : 0)
  }, [on, reduceMotion, x])

  React.useEffect(() => () => window.clearTimeout(settle.current), [])

  function holdLens() {
    if (reduceMotion) return
    lens.set(1)
    window.clearTimeout(settle.current)
    settle.current = window.setTimeout(() => {
      if (!drag.current) lens.set(0)
    }, LENS_HOLD)
  }

  function setOn(next: boolean) {
    holdLens()
    if (checked === undefined) setInternal(next)
    onCheckedChange?.(next)
  }

  function release() {
    const state = drag.current
    drag.current = null
    if (!state?.moved) {
      holdLens()
      return
    }
    skipClick.current = true
    const next = x.get() > TRAVEL / 2
    if (next === on) {
      x.set(on ? TRAVEL : 0)
      holdLens()
    } else setOn(next)
  }

  return (
    <button
      data-slot="liquid-switch"
      data-state={on ? "checked" : "unchecked"}
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      className={cn(
        "relative inline-flex shrink-0 cursor-pointer touch-pan-y rounded-full bg-foreground/15 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:bg-foreground/8",
        className
      )}
      style={{ width: TRACK_WIDTH, height: TRACK_HEIGHT, ...style }}
      onClick={(event) => {
        onClick?.(event)
        const dragged = skipClick.current
        skipClick.current = false
        // a drag already decided the state; keyboard clicks (detail 0) always toggle
        if (dragged && event.detail !== 0) return
        if (!event.defaultPrevented) setOn(!on)
      }}
      onPointerDown={(event) => {
        onPointerDown?.(event)
        skipClick.current = false
        if (event.button !== 0) return
        event.currentTarget.setPointerCapture(event.pointerId)
        drag.current = { startX: event.clientX, from: x.get(), moved: false }
        window.clearTimeout(settle.current)
        if (!reduceMotion) lens.set(1)
      }}
      onPointerMove={(event) => {
        onPointerMove?.(event)
        const state = drag.current
        if (!state) return
        const delta = event.clientX - state.startX
        if (!state.moved && Math.abs(delta) < 3) return
        state.moved = true
        x.jump(Math.min(Math.max(state.from + delta, 0), TRAVEL))
      }}
      onPointerUp={(event) => {
        onPointerUp?.(event)
        release()
      }}
      onPointerCancel={(event) => {
        onPointerCancel?.(event)
        release()
      }}
      {...props}
    >
      <motion.span
        aria-hidden
        className="absolute inset-0 rounded-[inherit] bg-glow"
        style={{ opacity: trackGlow }}
      />
      <motion.span
        aria-hidden
        className="absolute rounded-full"
        style={{
          top: PADDING,
          left: PADDING,
          width: KNOB_WIDTH,
          height: KNOB_HEIGHT,
          x,
          scaleX,
          scaleY: scale,
        }}
      >
        {/* the glass lens shows the track through it, magnified */}
        <LiquidGlass
          className="absolute inset-0 rounded-full"
          magnify={0.16}
          frost={0}
          refraction={lens}
          presence={lens}
        />
        <motion.span
          className="absolute inset-0 rounded-full bg-white shadow-[0_2px_6px_-1px_oklch(0_0_0/30%),0_0_0_0.5px_oklch(0_0_0/6%)]"
          style={{ opacity: fill }}
        />
      </motion.span>
    </button>
  )
}

export { LiquidSwitch, type LiquidSwitchProps }
