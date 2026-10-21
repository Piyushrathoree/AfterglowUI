"use client"

import { Check } from "@/components/animate-ui/icons/check"
import { Copy } from "@/components/animate-ui/icons/copy"
import { useEffect, useRef, useState } from "react"

// navigator.clipboard only exists on https or localhost, so a phone on the LAN falls back to a hidden textarea
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

export function CopyButton({ text, label = "Copy code" }: { text: string; label?: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle")
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])
  async function copy() {
    clearTimeout(timer.current)
    try {
      await writeClipboard(text)
      setStatus("copied")
    } catch {
      setStatus("error")
    }
    timer.current = setTimeout(() => setStatus("idle"), 2200)
  }
  const title = status === "copied" ? "Copied" : status === "error" ? "Copy failed. Select the code to copy." : label
  return (
    <button type="button" className="docs-copy" onClick={copy} aria-label={title} title={title}>
      {status === "copied" ? <Check size={15} /> : <Copy size={15} />}
      <span role="status" className="sr-only">{status === "copied" ? "Copied to clipboard" : status === "error" ? title : ""}</span>
    </button>
  )
}
