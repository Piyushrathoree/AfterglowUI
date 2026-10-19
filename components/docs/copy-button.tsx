"use client"

import { Check, Copy } from "lucide-react"
import { useEffect, useRef, useState } from "react"

export function CopyButton({ text, label = "Copy code" }: { text: string; label?: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle")
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])
  async function copy() {
    clearTimeout(timer.current)
    try {
      await navigator.clipboard.writeText(text)
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
