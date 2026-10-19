"use client"

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { LiquidGlass } from "@/components/ui/liquid-glass"
import { cn } from "@/lib/utils"

type LiquidMenuItem = {
  label: string
  icon?: React.ReactNode
  shortcut?: string
  onSelect?: () => void
  destructive?: boolean
}

type LiquidMenuEntry = LiquidMenuItem | "divider"

type LiquidMenuProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** what the closed button shows */
  trigger: React.ReactNode
  /** accessible name for an icon-only trigger */
  triggerLabel?: string
  items: LiquidMenuEntry[]
  /** which edge the menu grows from */
  align?: "start" | "end"
  width?: number
}

const ITEM = 36
const DIVIDER = 9
const PAD = 6

// the morph settles without bounce, then the items arrive
const morph = { type: "spring", stiffness: 420, damping: 38, mass: 0.8 } as const

function LiquidMenu({
  trigger,
  triggerLabel,
  items,
  align = "start",
  width = 224,
  className,
  ...props
}: LiquidMenuProps) {
  const reduceMotion = useReducedMotion()
  const rootRef = React.useRef<HTMLDivElement>(null)
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const itemRefs = React.useRef<HTMLButtonElement[]>([])
  const [open, setOpen] = React.useState(false)
  const [closed, setClosed] = React.useState({ w: 0, h: 0 })
  const menuId = React.useId()

  const height =
    PAD * 2 +
    items.reduce((sum, item) => sum + (item === "divider" ? DIVIDER : ITEM), 0)

  React.useLayoutEffect(() => {
    const node = triggerRef.current
    if (!node) return
    const measure = () => setClosed({ w: node.offsetWidth, h: node.offsetHeight })
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  // close on a click outside
  React.useEffect(() => {
    if (!open) return
    const onDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener("pointerdown", onDown)
    return () => document.removeEventListener("pointerdown", onDown)
  }, [open])

  React.useEffect(() => {
    if (open) {
      const first = itemRefs.current.find(Boolean)
      const id = window.setTimeout(() => first?.focus({ preventScroll: true }), 60)
      return () => window.clearTimeout(id)
    }
  }, [open])

  function close(refocus: boolean) {
    setOpen(false)
    if (refocus) triggerRef.current?.focus({ preventScroll: true })
  }

  function handleMenuKey(event: React.KeyboardEvent) {
    const all = itemRefs.current.filter(Boolean)
    const index = all.indexOf(document.activeElement as HTMLButtonElement)
    const next = {
      ArrowDown: all[(index + 1) % all.length],
      ArrowUp: all[(index - 1 + all.length) % all.length],
      Home: all[0],
      End: all[all.length - 1],
    }[event.key]
    if (next) {
      event.preventDefault()
      next.focus()
    } else if (event.key === "Escape") {
      event.preventDefault()
      close(true)
    } else if (event.key === "Tab") {
      close(false)
    }
  }

  // the position of each entry among the focusable ones (dividers are -1)
  const positions: number[] = []
  let count = 0
  for (const entry of items) positions.push(entry === "divider" ? -1 : count++)

  return (
    <div
      ref={rootRef}
      data-slot="liquid-menu"
      className={cn("relative inline-block", className)}
      style={{ width: closed.w || undefined, height: closed.h || undefined }}
      {...props}
    >
      <motion.div
        className={cn(
          "absolute top-0 z-50 overflow-hidden shadow-[0_18px_50px_-12px_var(--liquid-shadow)]",
          align === "end" ? "right-0" : "left-0"
        )}
        initial={false}
        animate={{
          width: open ? width : closed.w,
          height: open ? height : closed.h,
          borderRadius: open ? 22 : closed.h / 2,
        }}
        transition={reduceMotion ? { duration: 0 } : morph}
      >
        {/* menus get more frost than buttons, so their text stays readable */}
        <LiquidGlass
          className="absolute inset-0 rounded-[inherit]"
          frost={open ? 8 : 1}
          tint={open ? "color-mix(in oklch, var(--card) 62%, transparent)" : undefined}
        />

        <button
          ref={triggerRef}
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={open ? menuId : undefined}
          aria-label={triggerLabel}
          className={cn(
            "relative inline-flex h-10 cursor-pointer items-center gap-2 rounded-full px-4 text-sm font-medium whitespace-nowrap outline-none transition-opacity duration-150 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring [&_svg]:size-4",
            open && "pointer-events-none opacity-0"
          )}
          onClick={() => setOpen(true)}
        >
          {trigger}
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              id={menuId}
              role="menu"
              className="absolute top-0 left-0 flex flex-col"
              style={{ width, padding: PAD }}
              onKeyDown={handleMenuKey}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: reduceMotion ? 0 : 0.08, duration: 0.15 } }}
              exit={{ opacity: 0, transition: { duration: 0.08 } }}
            >
              {items.map((item, i) => {
                if (item === "divider") {
                  return (
                    <span
                      key={`divider-${i}`}
                      role="separator"
                      className="mx-2 my-1 h-px shrink-0 bg-foreground/12"
                    />
                  )
                }
                const index = positions[i]
                return (
                  <button
                    key={item.label}
                    ref={(node) => {
                      if (node) itemRefs.current[index] = node
                    }}
                    type="button"
                    role="menuitem"
                    tabIndex={-1}
                    className={cn(
                      "flex shrink-0 cursor-pointer items-center gap-2.5 rounded-xl px-2.5 text-left text-sm outline-none transition-colors duration-100 hover:bg-foreground/10 focus-visible:bg-foreground/10 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-foreground/70",
                      item.destructive && "text-glow-2 [&_svg]:text-glow-2"
                    )}
                    style={{ height: ITEM }}
                    onClick={() => {
                      item.onSelect?.()
                      close(true)
                    }}
                  >
                    {item.icon}
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.shortcut && (
                      <kbd className="font-sans text-xs text-muted-foreground">
                        {item.shortcut}
                      </kbd>
                    )}
                  </button>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export { LiquidMenu, type LiquidMenuEntry, type LiquidMenuItem, type LiquidMenuProps }
