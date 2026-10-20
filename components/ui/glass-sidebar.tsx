"use client"

import * as React from "react"
import { ChevronRight } from "lucide-react"
import { motion, useMotionValue, useSpring, useTransform } from "motion/react"
import { cn } from "@/lib/utils"
import { LiquidSearch } from "@/components/ui/liquid-search"

type GlassSidebarItem = {
  id: string
  label: string
  icon?: React.ReactNode
  badge?: string
  href?: string
  /** Additional terms matched by the local search. */
  keywords?: string
}
type GlassSidebarHeading = { heading: string }
type GlassSidebarProps = Omit<React.ComponentProps<"aside">, "children" | "defaultValue" | "onChange"> & {
  items: (GlassSidebarItem | GlassSidebarHeading)[]
  value?: string
  defaultValue?: string
  onValueChange?: (id: string) => void
  /** Replaces the brand row above search. */
  header?: React.ReactNode
  /** Account details or other content anchored below navigation. */
  footer?: React.ReactNode
  /** Shows a local filter for the navigation rows. */
  searchable?: boolean
  searchPlaceholder?: string
}

const reducedMotionQuery = "(prefers-reduced-motion: reduce)"
function subscribeReducedMotion(onChange: () => void) {
  const media = window.matchMedia(reducedMotionQuery)
  media.addEventListener("change", onChange)
  return () => media.removeEventListener("change", onChange)
}
const readReducedMotion = () => window.matchMedia(reducedMotionQuery).matches
const serverReducedMotion = () => true

function GlassSidebar({ items, value, defaultValue, onValueChange, header, footer, searchable = true, searchPlaceholder = "Find a page", className, "aria-label": label = "Sidebar", ...props }: GlassSidebarProps) {
  const [query, setQuery] = React.useState("")
  const [internal, setInternal] = React.useState(defaultValue ?? items.find(item => "id" in item)?.id)
  const [hovered, setHovered] = React.useState<string | null>(null)
  const [focused, setFocused] = React.useState<string | null>(null)
  const uid = React.useId()
  const reduceMotion = React.useSyncExternalStore(subscribeReducedMotion, readReducedMotion, serverReducedMotion)
  const active = value ?? internal
  const highlighted = hovered ?? focused ?? active
  const nav = React.useRef<HTMLElement>(null)
  const [track, setTrack] = React.useState<{ top: number; bottom: number; width: number; rows: Record<string, number>; heights: Record<string, number> } | null>(null)
  const lineStart = useMotionValue(0)
  const lineEnd = useMotionValue(0)
  const lineWidth = useMotionValue(240)
  const rowHeight = useMotionValue(36)
  const lineY = useSpring(0, { stiffness: 400, damping: 40, mass: 0.8 })
  const ready = React.useRef(false)
  const target = track?.rows[highlighted ?? ""]
  // One continuous seam opens out around the current row, then rejoins below it.
  // Keeping the same path commands lets direction changes stay interruptible.
  const contour = useTransform([lineY, lineWidth, rowHeight], ([y, width, height]: number[]) => {
    const top = y - height / 2
    const bottom = y + height / 2
    const right = Math.max(32, width - 1)
    return `M 9 ${top - 9} Q 9 ${top} 18 ${top} H ${right - 16} Q ${right} ${top} ${right} ${top + 16} V ${bottom - 16} Q ${right} ${bottom} ${right - 16} ${bottom} H 18 Q 9 ${bottom} 9 ${bottom + 9}`
  })
  const seam = useTransform([lineStart, lineEnd, lineY, lineWidth, rowHeight], ([start, end, y, width, height]: number[]) => {
    const top = y - height / 2
    const bottom = y + height / 2
    const right = Math.max(32, width - 1)
    return `M 9 ${start} V ${top - 9} Q 9 ${top} 18 ${top} H ${right - 16} Q ${right} ${top} ${right} ${top + 16} V ${bottom - 16} Q ${right} ${bottom} ${right - 16} ${bottom} H 18 Q 9 ${bottom} 9 ${bottom + 9} V ${end}`
  })
  const rowFill = useTransform([lineY, lineWidth, rowHeight], ([y, width, height]: number[]) => {
    const top = y - height / 2
    const bottom = y + height / 2
    const right = Math.max(32, width - 1)
    return `M 9 ${top} H ${right - 16} Q ${right} ${top} ${right} ${top + 16} V ${bottom - 16} Q ${right} ${bottom} ${right - 16} ${bottom} H 9 Z`
  })

  function choose(id: string) {
    if (value === undefined) setInternal(id)
    onValueChange?.(id)
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    const rows = [...(nav.current?.querySelectorAll<HTMLElement>("[data-sidebar-item]") ?? [])]
    const index = rows.indexOf(event.target as HTMLElement)
    if (index < 0) return
    const target = event.key === "ArrowDown" ? Math.min(index + 1, rows.length - 1)
      : event.key === "ArrowUp" ? Math.max(index - 1, 0)
      : event.key === "Home" ? 0 : event.key === "End" ? rows.length - 1 : null
    if (target === null) return
    event.preventDefault()
    setHovered(null)
    rows[target]?.focus()
  }
  const visible = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    const result: (GlassSidebarItem | GlassSidebarHeading)[] = []
    let heading: GlassSidebarHeading | undefined
    for (const item of items) {
      if ("heading" in item) heading = item
      else if (`${item.label} ${item.keywords ?? ""}`.toLowerCase().includes(q)) {
        if (heading) { result.push(heading); heading = undefined }
        result.push(item)
      }
    }
    return result
  }, [items, query])
  // Measure only on layout changes; spring values move the SVG without React renders.
  React.useLayoutEffect(() => {
    const root = nav.current
    if (!root) { ready.current = false; return }
    const measure = () => {
      const bounds = root.getBoundingClientRect()
      const rows: Record<string, number> = {}
      const heights: Record<string, number> = {}
      root.querySelectorAll<HTMLElement>("[data-sidebar-item]").forEach(row => {
        const rect = row.getBoundingClientRect()
        rows[row.dataset.sidebarItem!] = rect.top - bounds.top + rect.height / 2
        heights[row.dataset.sidebarItem!] = rect.height
      })
      const positions = Object.values(rows)
      if (!positions.length) { setTrack(null); return }
      setTrack({ top: 0, bottom: bounds.height, width: bounds.width, rows, heights })
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(root)
    root.querySelectorAll("[data-sidebar-item]").forEach(row => observer.observe(row))
    return () => observer.disconnect()
  }, [visible])

  React.useLayoutEffect(() => {
    if (!track) return
    lineStart.set(track.top)
    lineEnd.set(track.bottom)
    lineWidth.set(track.width)
    rowHeight.set(track.heights[highlighted ?? ""] ?? 36)
    if (target === undefined) return
    if (!ready.current || reduceMotion) lineY.jump(target)
    else lineY.set(target)
    ready.current = true
  }, [highlighted, lineEnd, lineStart, lineWidth, lineY, reduceMotion, rowHeight, target, track])

  return <aside data-slot="glass-sidebar" aria-label={label} className={cn("relative flex min-h-96 w-full max-w-[264px] min-w-0 flex-col overflow-hidden rounded-[24px] border border-foreground/[0.09] bg-card/95 text-foreground antialiased shadow-[inset_0_1px_0_var(--gloss-highlight),0_16px_40px_-24px_var(--gloss-depth)] backdrop-blur-xl", className)} {...props}>
    <div data-slot="sidebar-header" className="shrink-0 px-2 pb-1 pt-3">
      {header ?? <div className="flex items-center gap-3">
        <span className="grid size-8 shrink-0 place-items-center rounded-[10px] border border-foreground/[0.08] bg-linear-to-b from-foreground/[0.055] to-foreground/[0.025] shadow-[inset_0_1px_0_var(--gloss-highlight)]"><svg aria-hidden viewBox="0 0 24 24" className="size-5 text-glow"><path d="M5.5 14a6.5 6.5 0 0 1 13 0Z" fill="currentColor" /><path d="M3 17h18M7.5 20h9" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg></span>
        <div className="min-w-0"><p className="text-sm font-semibold tracking-tight">Afterglow</p><p className="mt-0.5 text-[11px] text-muted-foreground">Workspace</p></div>
        <span className="ml-auto rounded-md border border-foreground/[0.08] px-1.5 py-0.5 text-[10px] tabular-nums text-foreground/40">1.0</span>
      </div>}
      {searchable && <LiquidSearch className="mt-3" aria-label={searchPlaceholder} placeholder={searchPlaceholder} value={query} onValueChange={setQuery} />}

    </div>
    <div data-slot="sidebar-scroll" className="min-h-0 flex-1 overflow-y-auto px-2 pb-2 pt-1 [scrollbar-width:thin]">
      {visible.length ? <nav ref={nav} className="relative py-3" aria-label={`${label} links`} onKeyDown={onKeyDown} onPointerLeave={() => setHovered(null)} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(null) }}>
        {track && target !== undefined && <svg aria-hidden data-sidebar-line className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
          <defs><linearGradient id={`${uid}-line`} x1="0" y1="0" x2="1" y2="0"><stop stopColor="var(--glow)" stopOpacity="0.25" /><stop offset="0.45" stopColor="var(--glow)" stopOpacity="0.8" /><stop offset="1" stopColor="var(--glow)" stopOpacity="0.45" /></linearGradient></defs>
          <motion.path d={rowFill} fill="currentColor" fillOpacity="0.035" />
          <motion.path data-sidebar-seam d={seam} fill="none" stroke="currentColor" strokeOpacity="0.13" strokeWidth="1" strokeLinecap="round" />
          <motion.path data-sidebar-contour d={contour} fill="none" stroke={`url(#${uid}-line)`} strokeWidth="1.1" strokeLinecap="round" />
        </svg>}
        <ul className="space-y-0.5 pl-5">
          {visible.map((item, index) => {
            if ("heading" in item) return <li key={`heading-${index}`} className={cn("flex items-center gap-3 px-3 pb-1.5 pt-3 text-[11px] font-medium text-foreground/45", index === 0 && "pt-0")}><span>{item.heading}</span><span aria-hidden className="h-px flex-1 bg-foreground/[0.06]" /></li>
            const selected = active === item.id
            const contents = <>
              {item.icon && <span aria-hidden className={cn("relative grid size-7 shrink-0 place-items-center rounded-[8px] transition-colors duration-200 [&>svg]:size-[15px] [&>svg]:stroke-[1.65]", selected || highlighted === item.id ? "text-glow" : "text-foreground/50 group-hover:text-foreground/80")}>{item.icon}</span>}
              <span className="relative min-w-0 flex-1 truncate">{item.label}</span>
              {item.badge ? <span className={cn("relative min-w-5 shrink-0 rounded-md border border-foreground/[0.07] bg-foreground/[0.025] px-1.5 py-0.5 text-center text-[10px] leading-none tabular-nums transition-colors duration-150", selected ? "text-glow" : "text-foreground/45")}>{item.badge}</span> : <ChevronRight aria-hidden size={13} className={cn("relative shrink-0 transition-[opacity,translate] duration-200 motion-reduce:transition-none", highlighted === item.id ? "translate-x-0 opacity-50" : "-translate-x-1 opacity-0")} />}
            </>
            const common = {
              "data-sidebar-item": item.id,
              "aria-current": selected ? "page" as const : undefined,
              className: cn("group relative flex min-h-9 scroll-my-3 w-full cursor-pointer items-center gap-2.5 rounded-[16px] px-2.5 py-1 text-left text-[13px] outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-glow/60 motion-reduce:transition-none", selected ? "font-medium text-foreground" : "text-foreground/60 hover:text-foreground focus-visible:text-foreground"),
              onPointerEnter: (event: React.PointerEvent) => { if (event.pointerType !== "touch") setHovered(item.id) },
              onFocus: () => setFocused(item.id),
              onClick: () => choose(item.id),
            }
            return <li key={item.id}>{item.href ? <a {...common} href={item.href}>{contents}</a> : <button {...common} type="button">{contents}</button>}</li>
          })}
        </ul>
      </nav> : <p role="status" className="px-3 text-xs text-muted-foreground">No matching pages.</p>}
    </div>
    {footer && <div className="shrink-0 border-t border-foreground/[0.06] bg-foreground/[0.01] p-3">{footer}</div>}
  </aside>
}

export { GlassSidebar, type GlassSidebarProps, type GlassSidebarItem, type GlassSidebarHeading }
