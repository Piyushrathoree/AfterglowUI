"use client"

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { Check } from "@/components/animate-ui/icons/check"
import { ChevronDown } from "@/components/animate-ui/icons/chevron-down"

type Placement = {
  left: number
  width: number
  maxHeight: number
  top?: number
  bottom?: number
}

export function DocsPicker({ items, selected, onSelect, label = "Source file", variant = "source" }: {
  items: string[]
  selected: number
  onSelect: (index: number) => void
  label?: string
  variant?: "source" | "reference"
}) {
  const id = useId()
  const trigger = useRef<HTMLButtonElement>(null)
  const menu = useRef<HTMLDivElement>(null)
  const options = useRef<(HTMLButtonElement | null)[]>([])
  const anchor = useRef<{ top: number; left: number } | null>(null)
  const [open, setOpen] = useState(false)
  const [placement, setPlacement] = useState<Placement | null>(null)
  const reducedMotion = useReducedMotion()

  function show(index = selected) {
    const rect = trigger.current?.getBoundingClientRect()
    if (!rect) return
    anchor.current = { top: rect.top, left: rect.left }
    const below = window.innerHeight - rect.bottom - 12
    const above = rect.top - 12
    const upwards = below < Math.min(240, items.length * 36 + 10) && above > below
    const width = Math.min(rect.width, window.innerWidth - 24)
    setPlacement({
      left: Math.max(12, Math.min(rect.left, window.innerWidth - width - 12)),
      width,
      maxHeight: Math.min(320, Math.max(80, upwards ? above : below)),
      ...(upwards ? { bottom: window.innerHeight - rect.top + 6 } : { top: rect.bottom + 6 }),
    })
    setOpen(true)
    requestAnimationFrame(() => options.current[index]?.focus({ preventScroll: true }))
  }

  function close(restoreFocus = false) {
    setOpen(false)
    if (restoreFocus) trigger.current?.focus({ preventScroll: true })
  }

  useEffect(() => {
    if (!open) return
    const outside = (event: PointerEvent) => {
      const target = event.target as Node
      if (!menu.current?.contains(target) && !trigger.current?.contains(target)) setOpen(false)
    }
    const scroll = (event: Event) => {
      if (menu.current?.contains(event.target as Node)) return
      const rect = trigger.current?.getBoundingClientRect()
      if (!rect || !anchor.current || Math.abs(rect.top - anchor.current.top) > 1 || Math.abs(rect.left - anchor.current.left) > 1) setOpen(false)
    }
    const resize = () => setOpen(false)
    document.addEventListener("pointerdown", outside)
    document.addEventListener("scroll", scroll, true)
    window.addEventListener("resize", resize)
    return () => {
      document.removeEventListener("pointerdown", outside)
      document.removeEventListener("scroll", scroll, true)
      window.removeEventListener("resize", resize)
    }
  }, [open])

  function navigate(event: KeyboardEvent<HTMLDivElement>) {
    const index = options.current.findIndex(option => option === document.activeElement)
    let next: number | undefined
    if (event.key === "ArrowDown") next = (index + 1) % items.length
    if (event.key === "ArrowUp") next = (index - 1 + items.length) % items.length
    if (event.key === "Home") next = 0
    if (event.key === "End") next = items.length - 1
    if (next !== undefined) {
      event.preventDefault()
      options.current[next]?.focus({ preventScroll: true })
      options.current[next]?.scrollIntoView({ block: "nearest" })
    } else if (event.key === "Escape") {
      event.preventDefault()
      event.stopPropagation()
      close(true)
    } else if (event.key === "Tab") {
      // Return to the trigger before the browser advances focus through the page.
      trigger.current?.focus({ preventScroll: true })
      close()
    }
  }

  return (
    <div className="ag-file-label" data-variant={variant}>
      <span id={`${id}-label`}>{label}</span>
      <button
        ref={trigger}
        type="button"
        className="ag-file-trigger"
        aria-labelledby={`${id}-label ${id}-value`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-menu`}
        onClick={() => open ? close() : show()}
        onKeyDown={event => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault()
            show(event.key === "ArrowUp" ? items.length - 1 : selected)
          }
        }}
      >
        <span id={`${id}-value`} className="ag-file-value" title={items[selected]}>{items[selected]}</span>
        <span className="ag-file-chevron" data-open={open}><ChevronDown size={15} animate={false} /></span>
      </button>
      {placement && createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              ref={menu}
              id={`${id}-menu`}
              role="listbox"
              aria-labelledby={`${id}-label`}
              className="ag-file-menu"
              data-variant={variant}
              style={{ ...placement, transformOrigin: placement.bottom === undefined ? "top" : "bottom" }}
              initial={{ opacity: reducedMotion ? 1 : 0, y: reducedMotion ? 0 : placement.bottom === undefined ? -4 : 4, scale: reducedMotion ? 1 : 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: reducedMotion ? 1 : 0, y: reducedMotion ? 0 : -2, scale: reducedMotion ? 1 : 0.99 }}
              transition={{ duration: reducedMotion ? 0 : 0.16, ease: [0.22, 1, 0.36, 1] }}
              onKeyDown={navigate}
            >
              {items.map((path, index) => (
                <button
                  key={path}
                  ref={element => { options.current[index] = element }}
                  type="button"
                  role="option"
                  aria-selected={selected === index}
                  tabIndex={selected === index ? 0 : -1}
                  className="ag-file-option"
                  onClick={() => { onSelect(index); close(true) }}
                >
                  <span>{path}</span>
                  {selected === index && <Check size={15} />}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  )
}
