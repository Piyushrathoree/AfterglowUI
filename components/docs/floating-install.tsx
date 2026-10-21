"use client"

import { useEffect, useRef, useState } from "react"
import { X } from "@/components/animate-ui/icons/x"
import { CopyButton } from "./copy-button"
import { useInstallCommand, runners } from "./install-command"

export function FloatingInstall({ name }: { name: string }) {
  const [open, setOpen] = useState(false)
  const [manager, setManager] = useState<keyof typeof runners>("pnpm")
  const ref = useRef<HTMLDivElement>(null)
  const command = useInstallCommand(name, manager)
  useEffect(() => {
    if (!open) return
    function outside(event: PointerEvent) {
      if (!ref.current?.contains(event.target as Node)) setOpen(false)
    }
    function keydown(event: KeyboardEvent) {
      if (event.key === "Escape") { event.preventDefault(); setOpen(false) }
    }
    document.addEventListener("pointerdown", outside)
    document.addEventListener("keydown", keydown)
    return () => {
      document.removeEventListener("pointerdown", outside)
      document.removeEventListener("keydown", keydown)
    }
  }, [open])
  return (
    <div ref={ref} className="workspace-install" data-open={open}>
      <button type="button" className="workspace-install-toggle" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={open ? "Close install command" : "Show install command"}>
        {open ? <X size={13} /> : "Install"}
      </button>
      <div className="workspace-install-expand" inert={!open}>
        <div className="workspace-install-content">
          <select aria-label="Install package manager" value={manager} onChange={(event) => setManager(event.target.value as keyof typeof runners)}>
            {Object.keys(runners).map((item) => <option key={item}>{item}</option>)}
          </select>
          <code title={command}>{command}</code><CopyButton text={command} label="Copy install command" />
        </div>
      </div>
    </div>
  )
}
