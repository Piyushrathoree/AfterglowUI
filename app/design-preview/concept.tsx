"use client"

import Link from "next/link"
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { CodeXml, ArrowUpRight } from "lucide-react"
import { BookOpen } from "@/components/animate-ui/icons/book-open"
import { Eye } from "@/components/animate-ui/icons/eye"
import { Search } from "@/components/animate-ui/icons/search"
import { Check } from "@/components/animate-ui/icons/check"
import { PanelLeft } from "@/components/animate-ui/icons/panel-left"
import { X } from "@/components/animate-ui/icons/x"
import { Maximize as Maximize2 } from "@/components/animate-ui/icons/maximize"
import { Minimize as Minimize2 } from "@/components/animate-ui/icons/minimize"
import { useReducedMotion } from "motion/react"
import { ReadingRail as RailToc } from "@/components/ui/reading-rail"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import { LiquidSegmented } from "@/components/ui/liquid-segmented"
import { GlossButton } from "@/components/ui/gloss-button"
import { LiquidButton } from "@/components/ui/liquid-button"
import { AccentPicker } from "@/components/ui/accent-picker"
import { AfterglowMark } from "@/components/ui/auth-parts"
import { ThemeToggle } from "@/components/site/theme-toggle"
import { concepts } from "./catalog"

const views = [
  { value: "preview", label: "Preview", icon: <Eye /> },
  { value: "docs", label: "Docs", icon: <BookOpen /> },
  { value: "code", label: "Code", icon: <CodeXml /> },
]

export function DesignConcept({ team, glass, sources, usage }: { team: ReactNode; glass: ReactNode; sources: Record<string, ReactNode>; usage: Record<string, ReactNode> }) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null)
  const [current, setCurrent] = useState<string>(concepts[0].name)
  const [view, setView] = useState("docs")
  const [expanded, setExpanded] = useState(false)
  const anchor = useRef<string>(concepts[0].name)
  const navigatingUntil = useRef(0)
  const [query, setQuery] = useState("")
  const [menu, setMenu] = useState(false)
  const [clicks, setClicks] = useState(0)
  const [period, setPeriod] = useState("weekly")
  const selected = concepts.find((item) => item.name === current) ?? concepts[0]
  const items = useMemo(() => concepts.filter((item) => item.label.toLowerCase().includes(query.toLowerCase())).map((item) => ({
    id: `concept-${item.name}`, label: item.label, depth: item.depth,
  })), [query])

  useEffect(() => {
    if (!container) return
    let frame = 0
    const measure = () => {
      frame = 0
      if (performance.now() < navigatingUntil.current) return
      const top = container.getBoundingClientRect().top
      let best: string = concepts[0].name
      let distance = Infinity
      concepts.forEach((item) => {
        const element = document.getElementById(`concept-${item.name}`)
        if (!element) return
        const delta = Math.abs(element.getBoundingClientRect().top - top)
        if (delta < distance) { distance = delta; best = item.name }
      })
      anchor.current = best
      setCurrent(best)
    }
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(measure) }
    let height = container.clientHeight
    let resizeTimer = 0
    const onResize = () => {
      navigatingUntil.current = performance.now() + 1200
      container.style.scrollSnapType = "none"
      window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(() => {
        const index = concepts.findIndex((item) => item.name === anchor.current)
        container.scrollTo({ top: Math.max(0, index) * container.clientHeight, behavior: "instant" })
        container.style.scrollSnapType = ""
      }, 500)
    }
    window.addEventListener("resize", onResize)
    const observer = new ResizeObserver(() => {
      const next = container.clientHeight
      if (Math.abs(next - height) > 1) {
        const index = concepts.findIndex((item) => item.name === anchor.current)
        navigatingUntil.current = Math.max(navigatingUntil.current, performance.now() + 800)
        container.scrollTo({ top: Math.max(0, index) * next, behavior: "instant" })
        height = next
      }
    })
    observer.observe(container)
    container.addEventListener("scroll", onScroll, { passive: true })
    return () => { window.removeEventListener("resize", onResize); window.clearTimeout(resizeTimer); observer.disconnect(); container.removeEventListener("scroll", onScroll); cancelAnimationFrame(frame) }
  }, [container])

  useEffect(() => {
    function keydown(event: KeyboardEvent) {
      if (event.key !== "Escape") return
      setView("preview"); setMenu(false)
    }
    window.addEventListener("keydown", keydown)
    return () => window.removeEventListener("keydown", keydown)
  }, [])

  return (
    <div className="ag-concept">
      <button className="ag-mobile-menu" aria-label="Toggle component sidebar" aria-expanded={menu} onClick={() => setMenu((value) => !value)}><PanelLeft size={18} /></button>
      <aside className="ag-sidebar" data-open={menu}>
        <LiquidGlass className="ag-shell-glass absolute inset-0 rounded-[inherit]" refraction={0} frost={16} tint="color-mix(in oklch, var(--card) 65%, transparent)" />
        <div className="ag-sidebar-content">
          <Link href="/" prefetch={false} className="ag-brand"><AfterglowMark className="size-6" /><span>afterglow</span></Link>
          <label className="ag-search"><Search size={15} /><input placeholder="Find a component" aria-label="Find a component" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
          <div className="ag-nav" onClickCapture={(event) => {
            const button = (event.target as HTMLElement).closest("button")
            const item = concepts.find((item) => item.label === button?.textContent)
            if (item && container) {
              event.stopPropagation()
              anchor.current = item.name; navigatingUntil.current = performance.now() + 800; setCurrent(item.name)
              const index = concepts.findIndex((entry) => entry.name === item.name)
              container.scrollTo({ top: index * container.clientHeight, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" })
            }
            setMenu(false)
          }}>
            {items.length ? <RailToc title="Components" items={items} container={container} offset={0} /> : <p className="ag-empty">No matching components.</p>}
          </div>
          <div className="ag-sidebar-bottom"><p>Accent color</p><AccentPicker /><Link href="/docs" prefetch={false}>Current documentation <ArrowUpRight size={13} /></Link></div>
        </div>
      </aside>
      <main className="ag-main">
        <header className="ag-header">
          <div><p className="ag-section-label">Components <span>/</span> {selected.label}</p><h1>{selected.label}</h1><p className="ag-description">{selected.description}</p></div>
          <div className="ag-header-actions"><LiquidSegmented aria-label="Workspace view" options={views} value={view} onValueChange={setView} /><ThemeToggle /></div>
        </header>
        <div className="ag-stage-frame" data-view={view} data-expanded={expanded}>
          <div className="ag-preview-pane">
          <div className="ag-stage-scroll" aria-label={`${selected.label} live preview`} ref={setContainer}>
            {concepts.map((item) => (
              <section key={item.name} id={`concept-${item.name}`} className="ag-stage-section" aria-label={`${item.label} preview`}>
                <div className="ag-stage-section-inner">
                  {item.name === "fan-cards" ? team
                    : item.name === "liquid-glass" ? glass
                    : item.name === "liquid-segmented" ? <div className="ag-centered-demo"><h2>A small change in perspective.</h2><p>Drag the glass thumb, or choose a view.</p><LiquidSegmented aria-label="Example period" value={period} onValueChange={setPeriod} options={[{value:"weekly",label:"Weekly"},{value:"monthly",label:"Monthly"},{value:"yearly",label:"Yearly"}]} /><span className="ag-demo-status">Showing your {period} view</span></div>
                    : item.name === "gloss-button" ? <div className="ag-centered-demo"><h2>Made to be pressed.</h2><p>A shared accent. A soft response. A lingering highlight.</p><div className="ag-demo-buttons"><GlossButton size="lg" onClick={() => setClicks((value) => value + 1)}><Check />{clicks ? `Pressed ${clicks} ${clicks === 1 ? "time" : "times"}` : "Try the gloss"}</GlossButton><LiquidButton size="lg" onClick={() => setClicks(0)}>Reset</LiquidButton></div></div>
                    : <RailExample />}
                </div>
              </section>
            ))}
          </div>
          </div>
          <aside className="ag-detail-pane" aria-label="Component documentation" aria-hidden={view === "preview"} inert={view === "preview"}>
            <LiquidGlass className="ag-shell-glass absolute inset-0 rounded-[inherit]" refraction={0} frost={16} tint="color-mix(in oklch, var(--card) 88%, transparent)" />
            <div className="ag-detail-content">
              <header className="ag-detail-header"><span>{view === "code" ? "Source files" : "Documentation"}</span><div><button aria-label={expanded ? "Reduce panel" : "Expand panel"} aria-pressed={expanded} onClick={() => setExpanded((value) => !value)}>{expanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}</button><button aria-label="Close documentation panel" onClick={() => setView("preview")}><X size={16} /></button></div></header>
              <div className="ag-reading-panel" aria-label={`${selected.label} ${view === "code" ? "code" : "docs"}`} tabIndex={0} key={`${view}-${current}`}>

            {view === "code" ? <div className="ag-source"><div className="ag-reading-heading"><h2>{selected.label}</h2><p>The component and its local dependencies. Copy each file into the matching path in your project.</p></div>{sources[selected.name]}</div> : <article className="ag-doc-article">
              <div className="ag-reading-heading"><h2>{selected.label}</h2><p>{selected.detail}</p></div>
              <section><h3>Usage</h3><p>{selected.guidance}</p><div className="ag-source ag-usage">{usage[selected.name]}</div></section>
              <section><h3>Properties</h3><div className="ag-table-scroll"><table><thead><tr><th>Property</th><th>Type</th><th>Description</th></tr></thead><tbody>{selected.props.map(([name, type, description]) => <tr key={name}><td><code>{name}</code></td><td><code>{type}</code></td><td>{description}</td></tr>)}</tbody></table></div></section>
              <section><h3>Interaction</h3><p>{selected.interaction}</p></section>
            </article>}
          </div>
          </div>
          </aside>
        </div>
      </main>
    </div>
  )
}

function RailExample() {
  const [container, setContainer] = useState<HTMLDivElement | null>(null)
  const reduceMotion = useReducedMotion()
  const items = useMemo(() => [
    { id: "concept-rail-material", label: "The material" },
    { id: "concept-rail-edge", label: "The edge", depth: 1 },
    { id: "concept-rail-motion", label: "The movement" },
    { id: "concept-rail-response", label: "The response", depth: 1 },
  ], [])
  return <div className="ag-rail-example"><RailToc items={items} container={container} title="Contents" offset={16} /><div ref={setContainer} className="ag-rail-article" style={{ scrollBehavior: reduceMotion ? "auto" : "smooth" }}>{items.map((item) => <section id={item.id} key={item.id}><h2>{item.label}</h2><p>A component should feel connected to everything around it. The same material, the same light, and the same response to your touch.</p><p>Scroll to watch the marker follow the path, or select a heading in the rail.</p></section>)}</div></div>
}
