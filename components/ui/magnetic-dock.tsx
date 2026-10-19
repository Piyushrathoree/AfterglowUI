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
  type MotionValue,
} from "motion/react"

import { spring, springs } from "@/lib/afterglow"
import { cn } from "@/lib/utils"

type DockItem = {
  label: string
  icon: React.ReactNode
  /** a CSS background for an app-style tile, e.g. a gradient */
  tone?: string
  /** shows the running dot */
  active?: boolean
  onClick?: () => void
}

/** "divider" draws a thin separator, like the one before the trash */
type DockEntry = DockItem | "divider"

type MagneticDockProps = Omit<React.ComponentProps<"nav">, "children"> & {
  items: DockEntry[]
  size?: number
  magnification?: number
  range?: number
}

function MagneticDock({
  items,
  size = 48,
  magnification = 76,
  range = 150,
  className,
  style,
  onPointerMove,
  onPointerLeave,
  ...props
}: MagneticDockProps) {
  // Infinity means "pointer is not over the dock"
  const pointerX = useMotionValue(Infinity)

  return (
    <nav
      data-slot="magnetic-dock"
      aria-label="Dock"
      className={cn(
        "flex items-end gap-2 rounded-[22px] border border-transparent bg-glass px-2.5 pb-2.5 shadow-glass backdrop-blur-2xl backdrop-saturate-150",
        className
      )}
      style={{ height: size + 20, ...style }}
      onPointerMove={(event) => {
        onPointerMove?.(event)
        pointerX.set(event.clientX)
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event)
        pointerX.set(Infinity)
      }}
      {...props}
    >
      {items.map((item, index) =>
        item === "divider" ? (
          <span
            key={`divider-${index}`}
            aria-hidden
            className="mx-0.5 mb-1.5 w-px shrink-0 self-end bg-foreground/15"
            style={{ height: size - 12 }}
          />
        ) : (
          <DockIcon
            key={item.label}
            item={item}
            pointerX={pointerX}
            size={size}
            magnification={magnification}
            range={range}
          />
        )
      )}
    </nav>
  )
}

type DockIconProps = {
  item: DockItem
  pointerX: MotionValue<number>
  size: number
  magnification: number
  range: number
}

function DockIcon({ item, pointerX, size, magnification, range }: DockIconProps) {
  const ref = React.useRef<HTMLButtonElement>(null)
  const reduceMotion = useReducedMotion()
  const [focused, setFocused] = React.useState(false)
  const [hovered, setHovered] = React.useState(false)

  const distance = useTransform(pointerX, (x) => {
    const node = ref.current
    if (!node || !Number.isFinite(x)) return Infinity
    const rect = node.getBoundingClientRect()
    return x - rect.left - rect.width / 2
  })
  const magnified = useTransform(
    distance,
    [-range, 0, range],
    [size, magnification, size]
  )

  const width = useSpring(size, springs.snappy)
  // the glow uses a slower spring, so it trails behind the pointer
  const glow = useSpring(0, springs.glide)
  const iconSize = useTransform(width, (w) => w * (item.tone ? 0.52 : 0.5))
  const lift = useMotionValue(0)

  React.useEffect(() => {
    const update = () => {
      const target = focused ? magnification : magnified.get()
      width.set(reduceMotion ? size : target)
      const growth = magnification - size
      glow.set(growth > 0 ? (target - size) / growth : focused ? 1 : 0)
    }
    update()
    return magnified.on("change", update)
  }, [focused, glow, magnification, magnified, reduceMotion, size, width])

  return (
    <motion.button
      ref={ref}
      type="button"
      aria-label={item.label}
      aria-current={item.active ? "page" : undefined}
      className="relative shrink-0 cursor-pointer rounded-[28%] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      style={{ width, height: width }}
      onClick={() => {
        // an app bounces as it opens
        if (!reduceMotion && !item.active) {
          animate(lift, [0, -22, 0, -10, 0], { duration: 0.85, ease: "easeOut" })
        }
        item.onClick?.()
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <motion.span
        aria-hidden
        className="pointer-events-none absolute -inset-2 -z-10 rounded-full bg-glow/35 blur-xl"
        style={{ opacity: glow }}
      />
      <motion.span
        aria-hidden
        className={cn(
          "absolute inset-0 grid place-items-center overflow-hidden rounded-[inherit] shadow-gloss",
          item.tone
            ? "text-white [&_svg]:drop-shadow-[0_1px_1px_oklch(0_0_0/25%)]"
            : "bg-linear-to-b from-card to-muted text-foreground"
        )}
        style={{ y: lift, background: item.tone }}
      >
        {/* specular sheen on the upper half of the glossy tile */}
        <span className="pointer-events-none absolute inset-x-[6%] top-px h-1/2 rounded-[inherit] bg-linear-to-b from-white/35 to-transparent" />
        <motion.span
          className="relative grid place-items-center [&>svg]:size-full"
          style={{ width: iconSize, height: iconSize }}
        >
          {item.icon}
        </motion.span>
      </motion.span>
      <AnimatePresence>
        {item.active && (
          <motion.span
            aria-hidden
            className="absolute -bottom-2 left-1/2 size-1 -translate-x-1/2 rounded-full bg-foreground/80 shadow-[0_0_6px_var(--glow)]"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {(hovered || focused) && (
          <motion.span
            aria-hidden
            className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 rounded-lg bg-glass px-2.5 py-1 text-xs font-medium whitespace-nowrap text-foreground shadow-glass backdrop-blur-xl"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 2, transition: { duration: 0.1 } }}
            transition={spring("snappy")}
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

export { MagneticDock, type DockEntry, type DockItem, type MagneticDockProps }
