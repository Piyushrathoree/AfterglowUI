"use client"

import * as React from "react"
import { AnimateIcon } from "@/components/animate-ui/icons/icon"
import { Search } from "@/components/animate-ui/icons/search"
import { X } from "@/components/animate-ui/icons/x"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import { cn } from "@/lib/utils"

type LiquidSearchProps = Omit<React.ComponentProps<"input">, "type" | "size" | "value" | "defaultValue" | "onChange"> & {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Styles the input text separately from the glass capsule. */
  inputClassName?: string
}

function LiquidSearch({ value, defaultValue = "", onValueChange, placeholder = "Search anything", className, inputClassName, disabled, readOnly, ref, onKeyDown, "aria-label": label, ...props }: LiquidSearchProps) {
  const [internal, setInternal] = React.useState(defaultValue)
  const input = React.useRef<HTMLInputElement>(null)
  React.useImperativeHandle(ref, () => input.current!, [])
  const text = value ?? internal
  function update(next: string) {
    if (value === undefined) setInternal(next)
    onValueChange?.(next)
  }
  function clear() {
    update("")
    input.current?.focus()
  }
  return <AnimateIcon animateOnHover asChild><div data-slot="liquid-search" className={cn("group relative flex h-9 w-full min-w-0 items-center gap-2 rounded-[16px] p-1 text-foreground transition-shadow duration-200 focus-within:ring-2 focus-within:ring-glow/25", disabled && "pointer-events-none opacity-50", className)}>
    <LiquidGlass refraction={0} frost={6} tint="color-mix(in oklch, var(--card) 35%, transparent)" className="pointer-events-none absolute inset-0 rounded-[inherit]" />
    <span aria-hidden className="relative grid size-7 shrink-0 place-items-center rounded-concentric bg-linear-to-b from-foreground/[0.065] to-foreground/[0.015] text-foreground/50 shadow-gloss transition-[color,scale] duration-200 group-focus-within:scale-[1.04] group-focus-within:text-glow motion-reduce:transition-none motion-reduce:group-focus-within:scale-100"><Search aria-hidden size={14} strokeWidth={1.7} /></span>
    <input {...props} ref={input} aria-label={label ?? placeholder} type="search" disabled={disabled} readOnly={readOnly} placeholder={placeholder} value={text} onChange={event => update(event.target.value)} onKeyDown={event => {
      onKeyDown?.(event)
      if (!event.defaultPrevented && !event.nativeEvent.isComposing && event.key === "Escape" && text && !readOnly) {
        event.preventDefault()
        clear()
      }
    }} className={cn("relative h-full min-w-0 flex-1 appearance-none bg-transparent text-xs outline-none placeholder:text-foreground/40 [&::-webkit-search-cancel-button]:appearance-none", inputClassName)} />
    <AnimateIcon animateOnHover asChild><button type="button" aria-label="Clear search" disabled={disabled || readOnly || !text} tabIndex={text && !readOnly ? 0 : -1} onClick={clear} className={cn("relative grid size-6 shrink-0 cursor-pointer place-items-center rounded-concentric text-foreground/45 outline-none transition-[opacity,background-color] duration-150 hover:bg-foreground/[0.07] hover:text-foreground focus-visible:ring-2 focus-visible:ring-glow/50", text && !readOnly ? "opacity-100" : "pointer-events-none opacity-0")}><X aria-hidden size={13} /></button></AnimateIcon>
  </div></AnimateIcon>
}

export { LiquidSearch, type LiquidSearchProps }
