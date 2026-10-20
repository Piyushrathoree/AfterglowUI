"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import {
  BookOpen,
  CodeXml,
  Eye,
  PanelLeft,
  X,
  Maximize2,
  Minimize2,
} from "lucide-react"
import { getShowcase, showcases } from "@/lib/docs/showcases"
import { componentCatalog } from "@/lib/docs/catalog"
import { GlassSidebar, type GlassSidebarHeading, type GlassSidebarItem } from "@/components/ui/glass-sidebar"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import { LiquidSegmented } from "@/components/ui/liquid-segmented"
import { AccentPicker } from "@/components/ui/accent-picker"
import { AfterglowMark } from "@/components/ui/auth-parts"
import { ThemeToggle } from "@/components/site/theme-toggle"

const LibrarySource = dynamic(() => import("./library-source"), {
  loading: () => <p role="status">Loading source…</p>,
})
const views = [
  { value: "preview", label: "Preview", icon: <Eye /> },
  { value: "docs", label: "Docs", icon: <BookOpen /> },
  { value: "code", label: "Code", icon: <CodeXml /> },
]

export function LibraryWorkspace({
  name,
  title: referenceTitle,
  description: referenceDescription,
  preview,
  documentation,
  guide = false,
}: {
  name: string
  title: string
  description: string
  preview?: ReactNode
  documentation: ReactNode
  guide?: boolean
}) {
  const router = useRouter()
  const showcase = getShowcase(name)
  const title = guide ? referenceTitle : (showcase?.title ?? referenceTitle)
  const description = guide
    ? referenceDescription
    : (showcase?.description ?? referenceDescription)
  const references =
    showcase?.components.map(
      (component) => componentCatalog.find((item) => item.name === component)!,
    ) ?? []
  const [view, setView] = useState("docs")
  const [expanded, setExpanded] = useState(false)
  const [menu, setMenu] = useState(false)
  const sidebar = useRef<HTMLElement>(null)
  const items = useMemo(() => {
    const rows: (GlassSidebarHeading | GlassSidebarItem)[] = [
      { heading: "Getting started" },
      { id: "introduction", label: "Introduction", href: "/docs" },
      { id: "installation", label: "Installation", href: "/docs/installation" },
      { id: "theming", label: "Theming", href: "/docs/theming" },
    ]
    const groups = new Map<string, typeof showcases[number][]>()
    for (const scene of showcases) {
      const group = groups.get(scene.group) ?? []
      group.push(scene)
      groups.set(scene.group, group)
    }
    for (const [group, scenes] of groups) {
      rows.push({ heading: group })
      rows.push(...scenes.map(scene => ({
        id: scene.id,
        label: scene.title,
        href: `/docs/components/${scene.components[0]}`,
        keywords: `${scene.group} ${scene.description} ${scene.components.join(" ")}`,
      })))
    }
    const foundations = componentCatalog.filter(item => !getShowcase(item.name))
    if (foundations.length) rows.push({ heading: "Foundations" })
    rows.push(...foundations.map(item => ({
      id: item.name,
      label: item.title,
      href: `/docs/components/${item.name}`,
      keywords: `${item.name} ${item.description}`,
    })))
    return rows
  }, [])
  useEffect(() => {
    const current = sidebar.current?.querySelector('[aria-current="page"]')
    current?.scrollIntoView({ block: "nearest" })
  }, [name, showcase])
  useEffect(() => {
    function key(event: KeyboardEvent) {
      if (event.defaultPrevented) return
      if (event.key === "Escape") {
        setMenu(false)
        setExpanded(false)
      }
    }
    window.addEventListener("keydown", key)
    return () => window.removeEventListener("keydown", key)
  }, [])
  function changeView(value: string) {
    setView(value)
    if (
      value !== "preview" &&
      window.matchMedia("(max-width: 1023px)").matches
    ) {
      requestAnimationFrame(() =>
        document
          .querySelector(".ag-detail-pane")
          ?.scrollIntoView({
            block: "start",
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
              .matches
              ? "instant"
              : "smooth",
          }),
      )
    }
  }
  function navigate(event: React.MouseEvent) {
    const link = (event.target as HTMLElement).closest<HTMLAnchorElement>(
      'a[href^="/docs"]',
    )
    if (
      !link ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    )
      return
    event.preventDefault()
    setMenu(false)
    router.push(link.getAttribute("href")!, {
      scroll: window.matchMedia("(max-width: 1023px)").matches,
    })
  }
  return (
    <div className="ag-concept ag-library" data-guide={guide}>
      <a className="ag-skip-link" href="#docs-content">
        Skip to content
      </a>
      <button
        className="ag-mobile-menu"
        aria-label="Toggle component sidebar"
        aria-expanded={menu}
        aria-controls="docs-navigation"
        onClick={() => setMenu((value) => !value)}
      >
        <PanelLeft size={18} />
      </button>
      {menu && <button className="ag-nav-backdrop" aria-label="Close component sidebar" onClick={() => setMenu(false)} />}
      <GlassSidebar
        ref={sidebar}
        id="docs-navigation"
        className="ag-sidebar"
        data-open={menu}
        aria-label="Library navigation"
        items={items}
        value={guide ? name : (showcase?.id ?? name)}
        searchPlaceholder="Find a component"
        onClick={navigate}
        header={<Link href="/" prefetch={false} className="ag-docs-brand"><AfterglowMark className="size-6" /><span>afterglow</span><span className="ag-docs-brand-note">UI</span></Link>}
        footer={<div className="ag-docs-accent"><p>Accent color</p><AccentPicker /></div>}
      />
      <main className="ag-main" id="docs-content" tabIndex={-1}>
        <header className="ag-header">
          <div>
            <p className="ag-section-label">
              {guide ? "Documentation" : "Components"}
              <span>/</span>
              {title}
            </p>
            <h1>{title}</h1>
            <p className="ag-description">{description}</p>
          </div>
          <div className="ag-header-actions">
            {!guide && (
              <LiquidSegmented
                aria-label="Workspace view"
                options={views}
                value={view}
                onValueChange={changeView}
              />
            )}
            <ThemeToggle />
          </div>
        </header>
        {guide ? (
          <div className="ag-guide-surface">
            <article className="ag-doc-article ag-mdx">{documentation}</article>
          </div>
        ) : (
          <div
            className="ag-stage-frame"
            data-view={view}
            data-expanded={expanded}
          >
            <div className="ag-preview-pane">
              <div
                className="ag-library-preview"
                data-component-preview={name}
                data-showcase={showcase?.id ?? name}
                key={showcase?.id ?? name}
              >
                <div className="ag-stage-section-inner">{preview}</div>
              </div>
            </div>
            <aside
              className="ag-detail-pane"
              aria-label="Component documentation"
              aria-hidden={view === "preview"}
              inert={view === "preview"}
            >
              <LiquidGlass
                className="ag-shell-glass absolute inset-0 rounded-[inherit]"
                refraction={0}
                frost={16}
                tint="color-mix(in oklch, var(--card) 88%, transparent)"
              />
              <div className="ag-detail-content">
                <header className="ag-detail-header">
                  <span>
                    {view === "code" ? "Source files" : "Documentation"}
                  </span>
                  <div>
                    <button
                      aria-label={expanded ? "Reduce panel" : "Expand panel"}
                      aria-pressed={expanded}
                      onClick={() => setExpanded((value) => !value)}
                    >
                      {expanded ? (
                        <Minimize2 size={15} />
                      ) : (
                        <Maximize2 size={15} />
                      )}
                    </button>
                    <button
                      aria-label="Close documentation panel"
                      onClick={() => setView("preview")}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </header>
                {references.length > 1 && (
                  <label className="ag-reference-picker">
                    Component reference
                    <select
                      aria-label="Component reference"
                      value={name}
                      onChange={(event) =>
                        router.push(`/docs/components/${event.target.value}`, {
                          scroll: false,
                        })
                      }
                    >
                      {references.map((item) => (
                        <option key={item.name} value={item.name}>
                          {item.title}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                <div
                  className="ag-reading-panel"
                  key={`${name}-${view}`}
                  tabIndex={0}
                  aria-label={`${title} ${view === "code" ? "code" : "docs"}`}
                >
                  <div className="ag-reading-heading">
                    <h2>{referenceTitle}</h2>
                    {view === "code" && (
                      <p>The component and its shared local dependencies.</p>
                    )}
                  </div>
                  {view === "code" ? (
                    <LibrarySource key={name} name={name} />
                  ) : (
                    <article className="ag-doc-article ag-mdx">
                      {documentation}
                    </article>
                  )}
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  )
}
