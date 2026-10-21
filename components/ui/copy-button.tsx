"use client"

import * as React from "react"
import { AnimateIcon } from "@/components/animate-ui/icons/icon"
import { Check } from "@/components/animate-ui/icons/check"
import { Copy } from "@/components/animate-ui/icons/copy"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { spring } from "@/lib/afterglow"
import { cn } from "@/lib/utils"

type CopyButtonProps = Omit<
  React.ComponentProps<"button">,
  "value" | "children" | "onCopy"
> & {
  value: string
  timeout?: number
  showLabel?: boolean
  /** soft sits on a faint fill; ghost has no fill until you hover it */
  variant?: "soft" | "ghost"
  /** a small "Copied" bubble pops up above the button */
  tooltip?: boolean
  onCopy?: (value: string) => void
}

// navigator.clipboard only exists on https or localhost, so plain http (a phone on the LAN) uses a hidden textarea
async function writeClipboard(text: string) {
  if (window.isSecureContext && navigator.clipboard) return navigator.clipboard.writeText(text)
  const area = document.createElement("textarea")
  area.value = text
  area.readOnly = true
  area.style.cssText = "position:fixed;top:0;left:0;opacity:0;font-size:16px"
  document.body.append(area)
  area.select()
  area.setSelectionRange(0, text.length)
  const ok = document.execCommand("copy")
  area.remove()
  if (!ok) throw new Error("Copy failed")
}

function CopyButton({
  value,
  timeout = 1600,
  showLabel = false,
  variant = "soft",
  tooltip = false,
  onCopy,
  className,
  onClick,
  ...props
}: CopyButtonProps) {
  const reduceMotion = useReducedMotion()
  const [copied, setCopied] = React.useState(false)
  // bumps on every copy, so copying again restarts the reset timer
  const [pulse, setPulse] = React.useState(0)

  React.useEffect(() => {
    if (!copied) return
    const id = window.setTimeout(() => setCopied(false), timeout)
    return () => window.clearTimeout(id)
  }, [copied, pulse, timeout])

  async function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    onClick?.(event)
    if (event.defaultPrevented) return
    try {
      await writeClipboard(value)
      setCopied(true)
      setPulse((count) => count + 1)
      onCopy?.(value)
    } catch {
      // clipboard blocked or denied: stay idle
    }
  }

  // icon cross-fade: scale from 0.25, a 4px blur, a spring with no bounce
  // the resting state is identical either way, so server and client agree
  const swap = reduceMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
        exit: { opacity: 0 },
      }
    : {
        initial: { opacity: 0, scale: 0.25, filter: "blur(4px)" },
        animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
        exit: { opacity: 0, scale: 0.25, filter: "blur(4px)", transition: { duration: 0.15 } },
      }
  const iconTransition = { type: "spring", duration: 0.3, bounce: 0 } as const

  const slide = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -8 },
      }

  const state = copied ? "copied" : "idle"

  return (
    <AnimateIcon animateOnHover asChild>
      <button
        data-slot="copy-button"
        data-state={state}
        type="button"
        aria-label={copied ? "Copied" : showLabel ? "Copy" : "Copy to clipboard"}
        className={cn(
          // a capsule with no rim of its own, so it sits cleanly inside a bordered field. 32px tall,
          // its 16px radius nests concentric in a 48px row with 8px of padding
          "relative inline-flex h-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-[13px] font-medium outline-none transition-[background-color,color,scale] duration-150 ease-out select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50",
          variant === "soft"
            ? "bg-foreground/[0.07] text-foreground hover:bg-foreground/[0.12]"
            : "text-foreground/65 hover:bg-foreground/[0.08] hover:text-foreground",
          showLabel ? "px-3" : "w-8",
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {/* an invisible copy of the widest state sets the width, so the button never resizes */}
        <span className="grid place-items-center">
          {showLabel && (
            <span aria-hidden className="invisible col-start-1 row-start-1 inline-flex items-center gap-1.5">
              <span className="size-4" />
              Copied
            </span>
          )}
          <span className="col-start-1 row-start-1 inline-flex items-center gap-1.5">
            {/* the icon glides as the label beside it changes width, so the pair stays centered */}
            <motion.span
              aria-hidden
              layout={showLabel ? "position" : false}
              transition={reduceMotion ? { duration: 0 } : iconTransition}
              className="grid size-4 place-items-center [&_svg]:size-3.5"
            >
              <AnimatePresence initial={false}>
                <motion.span
                  key={state}
                  className="col-start-1 row-start-1 grid place-items-center"
                  transition={iconTransition}
                  {...swap}
                >
                  {copied ? <Check aria-hidden className="text-glow" /> : <Copy aria-hidden />}
                </motion.span>
              </AnimatePresence>
            </motion.span>

            {showLabel && (
              <span aria-hidden className="relative grid overflow-hidden">
                <AnimatePresence initial={false} mode="popLayout">
                  <motion.span key={state} transition={spring("snappy")} {...slide}>
                    {copied ? "Copied" : "Copy"}
                  </motion.span>
                </AnimatePresence>
              </span>
            )}
          </span>
        </span>

        <AnimatePresence>
          {tooltip && copied && (
            <motion.span
              aria-hidden
              className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded-full bg-foreground px-2.5 py-1 text-xs font-medium whitespace-nowrap text-background shadow-lg"
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 4, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={
                reduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: -4, filter: "blur(4px)", transition: { duration: 0.15 } }
              }
              transition={{ type: "spring", duration: 0.3, bounce: 0 }}
            >
              Copied
            </motion.span>
          )}
        </AnimatePresence>

        <span className="sr-only" aria-live="polite">
          {copied ? "Copied to clipboard" : ""}
        </span>
      </button>
    </AnimateIcon>
  )
}

export { CopyButton, type CopyButtonProps }
