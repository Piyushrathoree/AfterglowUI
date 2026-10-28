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

type LiquidTab = {
  value: string
  label: string
  icon: React.ReactNode
}

type LiquidTabsProps = Omit<
  React.ComponentProps<"div">,
  "defaultValue" | "onChange"
> & {
  tabs: LiquidTab[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}

// every tab is the same width, so the lens never has to change shape
const TAB_WIDTH = 64
const PADDING = 4

function LiquidTabs({
  tabs,
  value,
  defaultValue,
  onValueChange,
  className,
  ...props
}: LiquidTabsProps) {
  const reduceMotion = useReducedMotion()
  const [internal, setInternal] = React.useState(defaultValue ?? tabs[0]?.value)
  const active = value ?? internal
  const index = Math.max(
    tabs.findIndex((tab) => tab.value === active),
    0
  )
  const tabRefs = React.useRef(new Map<string, HTMLButtonElement>())
  const drag = React.useRef<{ startX: number; from: number; moved: boolean }>(
    null
  )

  const x = useSpring(PADDING + index * TAB_WIDTH, springs.soft)
  const velocity = useVelocity(x)
  const held = useMotionValue(0)
  // the lens appears while you drag, and while the selection is travelling
  const lens = useSpring(
    useTransform(() =>
      reduceMotion
        ? 0
        : Math.max(held.get(), Math.min(Math.abs(velocity.get()) / 650, 1))
    ),
    { stiffness: 320, damping: 30 }
  )
  const pill = useTransform(lens, [0, 0.5], [1, 0])
  const lensScale = useTransform(lens, [0, 1], [1, 1.24])

  React.useEffect(() => {
    if (drag.current?.moved) return
    const target = PADDING + index * TAB_WIDTH
    if (reduceMotion) x.jump(target)
    else x.set(target)
  }, [index, reduceMotion, x])

  function select(next: string) {
    if (next === active) {
      x.set(PADDING + index * TAB_WIDTH)
      return
    }
    if (value === undefined) setInternal(next)
    onValueChange?.(next)
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    const target = {
      ArrowRight: tabs[(index + 1) % tabs.length],
      ArrowLeft: tabs[(index - 1 + tabs.length) % tabs.length],
      Home: tabs[0],
      End: tabs[tabs.length - 1],
    }[event.key]
    if (!target) return
    event.preventDefault()
    select(target.value)
    tabRefs.current.get(target.value)?.focus()
  }

  function endDrag() {
    const state = drag.current
    drag.current = null
    held.set(0)
    if (!state?.moved) return
    // drop the lens on whichever tab it's mostly over
    const nearest = Math.round((x.get() - PADDING) / TAB_WIDTH)
    select(tabs[Math.min(Math.max(nearest, 0), tabs.length - 1)].value)
  }

  return (
    <div
      data-slot="liquid-tabs"
      className={cn("relative inline-flex touch-pan-y rounded-full", className)}
      {...props}
    >
      <LiquidGlass className="absolute inset-0 rounded-[inherit]" />
      <div
        role="tablist"
        aria-orientation="horizontal"
        className="relative flex select-none"
        style={{ padding: PADDING }}
        onPointerDown={(event) => {
          if (event.button !== 0) return
          drag.current = { startX: event.clientX, from: x.get(), moved: false }
        }}
        onPointerMove={(event) => {
          const state = drag.current
          if (!state) return
          const delta = event.clientX - state.startX
          if (!state.moved) {
            if (Math.abs(delta) < 6) return
            state.moved = true
            event.currentTarget.setPointerCapture(event.pointerId)
            held.set(1)
          }
          const last = PADDING + (tabs.length - 1) * TAB_WIDTH
          x.jump(Math.min(Math.max(state.from + delta, PADDING), last))
        }}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <motion.span
          aria-hidden
          className="absolute left-0 rounded-full bg-foreground/10"
          style={{
            top: PADDING,
            bottom: PADDING,
            width: TAB_WIDTH,
            x,
            opacity: pill,
          }}
        />
        {tabs.map((tab, i) => {
          const selected = i === index
          return (
            <button
              key={tab.value}
              ref={(node) => {
                if (node) tabRefs.current.set(tab.value, node)
                else tabRefs.current.delete(tab.value)
              }}
              type="button"
              role="tab"
              aria-selected={selected}
              tabIndex={selected ? 0 : -1}
              data-state={selected ? "active" : "inactive"}
              className="relative flex cursor-pointer flex-col items-center justify-center gap-0.5 rounded-full py-1.5 text-[10px] font-medium text-foreground/75 outline-none transition-[color,scale] duration-150 motion-safe:active:scale-[0.97] motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring aria-selected:text-glow [&_svg]:size-[22px]"
              style={{ width: TAB_WIDTH }}
              onClick={() => select(tab.value)}
              onKeyDown={handleKeyDown}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          )
        })}
        {/* a glass lens over the tabs, magnifying the icons it passes */}
        <motion.span
          aria-hidden
          className="pointer-events-none absolute left-0 rounded-full"
          style={{
            top: PADDING,
            bottom: PADDING,
            width: TAB_WIDTH,
            x,
            scale: lensScale,
          }}
        >
          <LiquidGlass
            className="absolute inset-0 rounded-full"
            magnify={0.14}
            frost={0}
            refraction={lens}
            presence={lens}
          />
        </motion.span>
      </div>
    </div>
  )
}

export { LiquidTabs, type LiquidTab, type LiquidTabsProps }
