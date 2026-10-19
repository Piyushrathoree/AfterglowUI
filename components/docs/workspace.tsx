"use client"

import dynamic from "next/dynamic"
import { AnimatePresence, motion, useDragControls, useReducedMotion } from "motion/react"
import { CodeXml, Maximize, Minimize, Palette, RotateCcw, X } from "lucide-react"
import { useEffect, useRef, useState, type ReactNode } from "react"
import { AccentPicker } from "@/components/ui/accent-picker"
import { ThemeToggle } from "@/components/site/theme-toggle"
import { FloatingInstall } from "./floating-install"

const SourceViewer = dynamic(() => import("./source-viewer").then((module) => module.SourceViewer), {
  loading: () => <p className="workspace-source-loading">Loading source…</p>,
})

export function ComponentWorkspace({ name, title, preview, documentation }: {
  name: string; title: string; preview: ReactNode; documentation: ReactNode
}) {
  const [panel, setPanel] = useState<"docs" | "code" | null>("docs")
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [iteration, setIteration] = useState(0)
  const reduceMotion = useReducedMotion()
  const dragControls = useDragControls()
  const details = useRef<HTMLElement>(null)
  const controls = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function keydown(event: KeyboardEvent) {
      if (event.key !== "Escape" || event.defaultPrevented || document.querySelector("dialog[open]")) return
      if (paletteOpen) setPaletteOpen(false)
      else if (panel === "code") setPanel("docs")
      else if (panel) {
        setPanel(null)
        controls.current?.querySelector<HTMLButtonElement>("[data-docs-toggle]")?.focus()
      }
    }
    window.addEventListener("keydown", keydown)
    return () => window.removeEventListener("keydown", keydown)
  }, [panel, paletteOpen])

  function openPanel(next: "docs" | "code" | null) {
    setPanel(next)
    if (next && window.matchMedia("(max-width: 959px)").matches) {
      requestAnimationFrame(() => details.current?.scrollIntoView({ behavior: reduceMotion ? "instant" : "smooth", block: "start" }))
    }
  }

  return (
    <div className="workspace-page" data-panel-open={panel !== null} data-component={name}>
      <main id="docs-content" className="workspace-canvas" tabIndex={-1} aria-label={`${title} preview`}>
        <div className="workspace-demo" key={iteration}>{preview}</div>
      </main>
      <div className="workspace-toolbar" ref={controls}>
        <FloatingInstall name={name} />
        <div className="workspace-toolbar-buttons">
          <button type="button" data-docs-toggle onClick={() => openPanel(panel ? null : "docs")}
            aria-label={panel ? "Hide documentation" : "Show documentation"} title={panel ? "Expand preview" : "Show documentation"}
            aria-expanded={panel !== null} aria-controls="component-documentation">
            {panel ? <Maximize size={16} /> : <Minimize size={16} />}
          </button>
          <button type="button" onClick={() => openPanel(panel === "code" ? "docs" : "code")}
            aria-label={panel === "code" ? "Close source code" : "Show source code"} title={panel === "code" ? "Close source code" : "Get code"} aria-pressed={panel === "code"}>
            {panel === "code" ? <X size={16} /> : <CodeXml size={16} />}
          </button>
          <ThemeToggle />
        </div>
      </div>
      <aside ref={details} id="component-documentation" className="workspace-details" aria-label={`${title} documentation`} inert={panel === null}>
        <div className="workspace-description" aria-hidden={panel === "code"} inert={panel === "code"}>{documentation}</div>
        <AnimatePresence initial={false}>
          {panel === "code" && <motion.div key="source" className="workspace-source-drawer"
            drag="y" dragListener={false} dragControls={dragControls} dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0, bottom: 0.3 }}
            onDragEnd={(_, info) => { if (info.offset.y > 120) setPanel("docs") }}
            initial={{ y: "105%" }} animate={{ y: 0 }} exit={{ y: "105%" }}
            transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 320, damping: 34 }}>
            <SourceViewer name={name} title={title} onClose={() => setPanel("docs")} onGrab={(event) => dragControls.start(event)} />
          </motion.div>}
        </AnimatePresence>
      </aside>
      <div className="workspace-preview-controls">
        <div className="workspace-palette" hidden={!paletteOpen}><AccentPicker /><button type="button" onClick={() => setIteration((value) => value + 1)}><RotateCcw size={13} />Replay preview</button></div>
        <button type="button" className="workspace-palette-toggle" aria-label="Preview settings" title="Preview settings" aria-expanded={paletteOpen} onClick={() => setPaletteOpen((value) => !value)}><Palette size={14} /></button>
      </div>
    </div>
  )
}
