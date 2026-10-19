"use client"

import Link from "next/link"
import { PanelLeft, PanelLeftClose, X } from "lucide-react"
import { useRef, useState, type ReactNode } from "react"
import type { DocsGroup } from "@/lib/docs/navigation"
import { DocsNavigation } from "./navigation"
import { DocsSearch } from "./search"
import { AccentPicker } from "@/components/ui/accent-picker"

function SidebarContents({ groups, onNavigate }: { groups: DocsGroup[]; onNavigate?: () => void }) {
  return <>
    <div className="workspace-sidebar-heading">Components</div>
    <div className="workspace-nav-scroll"><DocsNavigation groups={groups} onNavigate={onNavigate} /></div>
    <div className="workspace-sidebar-footer">
      {onNavigate && <button type="button" onClick={() => { onNavigate(); requestAnimationFrame(() => window.dispatchEvent(new Event("afterglow:search"))) }}>Search documentation</button>}
      <Link href="/" prefetch={false}>afterglow <span>/ ui</span></Link>
    </div>
  </>
}

export function DocsShell({ groups, children }: { groups: DocsGroup[]; children: ReactNode }) {
  const [navigationOpen, setNavigationOpen] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const mobile = useRef<HTMLDialogElement>(null)
  function closeMobile() {
    mobile.current?.close()
    setMobileOpen(false)
  }
  return (
    <div className="docs-root">
      <div hidden inert><AccentPicker /></div>
      <a className="docs-skip" href="#docs-content">Skip to component</a>
      <div className="workspace-shell" data-navigation-open={navigationOpen}>
        <DocsSearch pages={groups.flatMap((group) => group.items)} />
        <button type="button" className="workspace-nav-toggle workspace-desktop-toggle" onClick={() => setNavigationOpen((value) => !value)}
          aria-expanded={navigationOpen} aria-controls="workspace-sidebar" aria-label={navigationOpen ? "Close sidebar" : "Open sidebar"} title={navigationOpen ? "Close sidebar" : "Open sidebar"}>
          {navigationOpen ? <PanelLeftClose size={17} /> : <PanelLeft size={17} />}
        </button>
        <button type="button" className="workspace-nav-toggle workspace-mobile-toggle" aria-label="Open sidebar" aria-haspopup="dialog" aria-expanded={mobileOpen}
          onClick={() => { mobile.current?.showModal(); setMobileOpen(true) }}><PanelLeft size={17} /></button>
        <aside id="workspace-sidebar" className="workspace-sidebar" aria-label="Component navigation" inert={!navigationOpen}><SidebarContents groups={groups} /></aside>
        <dialog ref={mobile} className="workspace-mobile-dialog" aria-label="Component navigation" onClose={() => setMobileOpen(false)}
          onClick={(event) => { if (event.target === event.currentTarget) closeMobile() }}>
          <div className="workspace-mobile-sidebar">
            <button type="button" className="workspace-nav-toggle" aria-label="Close sidebar" onClick={closeMobile}><X size={17} /></button>
            <SidebarContents groups={groups} onNavigate={closeMobile} />
          </div>
        </dialog>
        <div className="workspace-route">{children}</div>
      </div>
    </div>
  )
}
