"use client"

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { iconGestures, iconRest, springs, type IconGesture } from "@/lib/afterglow"
import { cn } from "@/lib/utils"

type TrailTab = {
  value: string
  label: React.ReactNode
  icon?: React.ReactNode
  /** how the icon moves when its tab is picked: a bell rings, a gear turns. defaults to a small pop */
  iconGesture?: IconGesture
  /** the panel shown when this tab is active */
  content?: React.ReactNode
  disabled?: boolean
}

type TrailTabsProps = Omit<
  React.ComponentProps<"div">,
  "defaultValue" | "onChange"
> & {
  tabs: TrailTab[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** classes for the tab strip, when panels sit below it */
  listClassName?: string
  /** "active" folds every other tab down to its icon; "all" always shows every label */
  labels?: "active" | "all"
}

function TrailTabs({
  tabs,
  value,
  defaultValue,
  onValueChange,
  className,
  listClassName,
  labels = "active",
  ...props
}: TrailTabsProps) {
  const id = React.useId()
  const reduceMotion = useReducedMotion()
  const [internal, setInternal] = React.useState(
    defaultValue ?? tabs.find((tab) => !tab.disabled)?.value
  )
  // which way the panels slide: forward when moving right along the tabs
  const [direction, setDirection] = React.useState(1)
  const [panelHeight, setPanelHeight] = React.useState<number>()
  const panelRef = React.useRef<HTMLDivElement>(null)
  const tabRefs = React.useRef(new Map<string, HTMLButtonElement>())
  const active = value ?? internal
  const current = tabs.find((tab) => tab.value === active)
  const hasPanels = tabs.some((tab) => tab.content !== undefined)

  // the panel area follows the height of whichever panel is showing
  React.useEffect(() => {
    const node = panelRef.current
    if (!node) return
    const observer = new ResizeObserver(([entry]) => {
      setPanelHeight(entry.borderBoxSize[0].blockSize)
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  function select(next: string) {
    if (next === active) return
    const index = (v?: string) => tabs.findIndex((tab) => tab.value === v)
    setDirection(index(next) > index(active) ? 1 : -1)
    if (value === undefined) setInternal(next)
    onValueChange?.(next)
  }

  function handleKeyDown(event: React.KeyboardEvent, from: string) {
    const enabled = tabs.filter((tab) => !tab.disabled)
    const index = enabled.findIndex((tab) => tab.value === from)
    const target = {
      ArrowRight: enabled[(index + 1) % enabled.length],
      ArrowLeft: enabled[(index - 1 + enabled.length) % enabled.length],
      Home: enabled[0],
      End: enabled[enabled.length - 1],
    }[event.key]
    if (!target) return
    event.preventDefault()
    select(target.value)
    tabRefs.current.get(target.value)?.focus()
  }

  const list = (
    <div
      role="tablist"
      aria-orientation="horizontal"
      className={cn(
        "relative isolate inline-flex items-center gap-1 rounded-full border border-foreground/[0.08] bg-foreground/[0.06] p-[3px]",
        hasPanels ? listClassName : cn(listClassName, className)
      )}
      {...(hasPanels ? {} : { "data-slot": "trail-tabs", ...props })}
    >
      {tabs.map((tab) => {
        const selected = tab.value === active
        return (
          <button
            key={tab.value}
            ref={(node) => {
              if (node) tabRefs.current.set(tab.value, node)
              else tabRefs.current.delete(tab.value)
            }}
            id={`${id}-tab-${tab.value}`}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={tab.content !== undefined ? `${id}-panel` : undefined}
            tabIndex={selected ? 0 : -1}
            disabled={tab.disabled}
            data-state={selected ? "active" : "inactive"}
            className="relative inline-flex h-9 min-w-9 cursor-pointer items-center justify-center rounded-full px-2.5 text-sm font-medium text-foreground/60 outline-none transition-[color,scale] duration-150 ease-out hover:text-foreground motion-safe:active:scale-[0.97] motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-40 aria-selected:text-foreground [&_svg]:size-4 [&_svg]:shrink-0"
            onClick={() => select(tab.value)}
            onKeyDown={(event) => handleKeyDown(event, tab.value)}
          >
            {selected && (
              <motion.span
                layoutId={`${id}-indicator`}
                aria-hidden
                className="absolute inset-0 rounded-[inherit] border border-foreground/[0.08] bg-background/75 shadow-[0_1px_2px_oklch(0_0_0/0.08)] dark:bg-foreground/[0.14]"
                transition={
                  reduceMotion ? { duration: 0 } : { type: "spring", visualDuration: 0.3, bounce: 0 }
                }
              />
            )}

            {/* labels sit above every tab's pill, so the sliding pill passes under them */}
            {tab.icon && (
              <motion.span
                aria-hidden
                className={cn(
                  "relative z-10 grid place-items-center transition-colors duration-150",
                  tab.iconGesture === "ring" && "origin-top",
                  selected && "text-glow"
                )}
                initial={false}
                // the same target either way, so server and client agree; reduced motion only skips the timing
                animate={selected ? iconGestures[tab.iconGesture ?? "pop"] : iconRest}
                transition={reduceMotion ? { duration: 0 } : { duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
              >
                {tab.icon}
              </motion.span>
            )}
            {/* only the picked tab shows its name; the others fold down to their icon */}
            <motion.span
              className="relative z-10 overflow-hidden whitespace-nowrap"
              initial={false}
              animate={
                selected || labels === "all" || !tab.icon
                  ? { width: "auto", opacity: 1 }
                  : { width: 0, opacity: 0 }
              }
              transition={reduceMotion ? { duration: 0 } : { type: "spring", visualDuration: 0.32, bounce: 0 }}
            >
              <span className={cn("block pr-1", tab.icon && "pl-1.5")}>{tab.label}</span>
            </motion.span>
          </button>
        )
      })}
    </div>
  )

  if (!hasPanels) return list

  return (
    <div data-slot="trail-tabs" className={cn("flex flex-col gap-4", className)} {...props}>
      {list}
      {/* the height glides between panels; the padding keeps focus rings and shadows unclipped */}
      <motion.div
        className="-m-1 overflow-hidden"
        initial={false}
        animate={{ height: panelHeight ?? "auto" }}
        transition={reduceMotion ? { duration: 0 } : { type: "spring", ...springs.soft }}
      >
        <div ref={panelRef} className="relative p-1">
          {/* the new panel slides in from the side you moved toward; the old one leaves fast */}
          <AnimatePresence mode="popLayout" initial={false} custom={direction}>
            <motion.div
              key={active}
              id={`${id}-panel`}
              role="tabpanel"
              aria-labelledby={`${id}-tab-${active}`}
              tabIndex={0}
              className="outline-none"
              custom={direction}
              variants={{
                enter: (dir: number) => ({ opacity: 0, x: reduceMotion ? 0 : dir * 8, filter: "blur(2px)" }),
                center: { opacity: 1, x: 0, filter: "blur(0px)" },
                exit: (dir: number) => ({
                  opacity: 0,
                  x: reduceMotion ? 0 : dir * -8,
                  filter: "blur(2px)",
                  transition: { duration: 0.1, ease: "easeOut" },
                }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", visualDuration: 0.3, bounce: 0 }}
            >
              {current?.content}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

export { TrailTabs, type TrailTab, type TrailTabsProps }
