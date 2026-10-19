"use client"

import * as React from "react"
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react"

import { afterglow, springs } from "@/lib/afterglow"
import { cn } from "@/lib/utils"

const TRACK_WIDTH = 52
const TRACK_HEIGHT = 30
const PADDING = 3
const KNOB = TRACK_HEIGHT - PADDING * 2
const TRAVEL = TRACK_WIDTH - PADDING * 2 - KNOB

type GlassSwitchProps = Omit<
  React.ComponentProps<"button">,
  "value" | "defaultValue" | "onChange"
> & {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

function GlassSwitch({
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
}: GlassSwitchProps) {
  const reduceMotion = useReducedMotion()
  const [internal, setInternal] = React.useState(defaultChecked)
  const on = checked ?? internal

  const x = useSpring(on ? TRAVEL : 0, springs.snappy)
  const press = useSpring(0, springs.snappy)
  const velocity = useVelocity(x)
  const linger = useMotionValue(0)
  const drag = React.useRef<{ startX: number; from: number; moved: boolean }>(
    null
  )
  const skipClick = React.useRef(false)
  const wasOn = React.useRef(on)

  // the bead stretches while pressed and while it travels, like a drop of liquid
  const stretch = useTransform(() =>
    reduceMotion
      ? 1
      : 1 + press.get() * 0.2 + Math.min(Math.abs(velocity.get()) / 2200, 0.25)
  )
  const squash = useTransform(stretch, (s) => 1 - (s - 1) * 0.3)
  // keep the stretched bead inside the track by leaning it toward the center
  const knobX = useTransform(() => {
    const position = x.get()
    return position + (1 - (2 * position) / TRAVEL) * (stretch.get() - 1) * (KNOB / 2)
  })
  const progress = useTransform(x, [0, TRAVEL], [0, 1])
  const fill = useTransform(() => Math.max(progress.get(), linger.get()))

  React.useEffect(() => {
    if (!drag.current) {
      if (reduceMotion) x.jump(on ? TRAVEL : 0)
      else x.set(on ? TRAVEL : 0)
    }
    // switching off leaves the track glowing for a moment
    if (wasOn.current && !on && !reduceMotion) {
      linger.jump(1)
      // ease in-out, so the glow holds for a beat before it fades
      animate(linger, 0, { duration: afterglow.linger, ease: "easeInOut" })
    }
    wasOn.current = on
  }, [linger, on, reduceMotion, x])

  function setOn(next: boolean) {
    if (checked === undefined) setInternal(next)
    onCheckedChange?.(next)
  }

  function release() {
    press.set(0)
    const state = drag.current
    drag.current = null
    if (!state?.moved) return
    skipClick.current = true
    const next = x.get() > TRAVEL / 2
    if (next === on) x.set(on ? TRAVEL : 0)
    else setOn(next)
  }

  return (
    <button
      data-slot="glass-switch"
      data-state={on ? "checked" : "unchecked"}
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      className={cn(
        "relative isolate inline-flex shrink-0 cursor-pointer touch-pan-y rounded-full bg-foreground/12 shadow-well outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50",
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
        // touch drags may end without a click, so never carry the flag over
        skipClick.current = false
        if (event.button !== 0) return
        event.currentTarget.setPointerCapture(event.pointerId)
        drag.current = { startX: event.clientX, from: x.get(), moved: false }
        press.set(1)
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
        className="absolute inset-0 rounded-[inherit] bg-linear-to-b from-[color-mix(in_oklch,var(--glow),var(--glow-2)_30%)] to-glow shadow-well"
        style={{ opacity: fill }}
      />
      <motion.span
        aria-hidden
        className="absolute rounded-full"
        style={{
          top: PADDING,
          left: PADDING,
          width: KNOB,
          height: KNOB,
          x: knobX,
          scaleX: stretch,
          scaleY: squash,
        }}
      >
        {/* a glossy bead: lit from the top left, with a bright rim */}
        <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_28%,oklch(1_0_0),oklch(0.93_0.01_285)_55%,oklch(0.84_0.015_285))] shadow-gloss" />
        <span className="absolute inset-x-1 top-0.5 h-1/2 rounded-full bg-linear-to-b from-white/90 to-transparent" />
      </motion.span>
    </button>
  )
}

export { GlassSwitch, type GlassSwitchProps }
