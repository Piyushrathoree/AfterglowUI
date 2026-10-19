"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import {
  BookOpen,
  CodeXml,
  Eye,
  Search,
  PanelLeft,
  X,
  Maximize2,
  Minimize2,
} from "lucide-react"
import { getShowcase, showcases } from "@/lib/docs/showcases"
import { componentCatalog } from "@/lib/docs/catalog"
import { ReadingRail } from "@/components/ui/reading-rail"
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
  const [query, setQuery] = useState("")
  const [menu, setMenu] = useState(false)
  const sidebar = useRef<HTMLElement>(null)
  const items = useMemo(() => {
    const q = query.trim().toLowerCase()
    const scenes = showcases.filter((item) =>
      `${item.title} ${item.group} ${item.description} ${item.components.join(" ")}`
        .toLowerCase()
        .includes(q),
    )
    const rows = scenes.map((item, index) => ({
      id: item.id,
      label: item.title,
      href: `/docs/components/${item.components[0]}`,
      depth: scenes[index - 1]?.group === item.group ? 1 : 0,
    }))
    const foundations = componentCatalog
      .filter(
        (item) =>
          !getShowcase(item.name) &&
          (!q || `${item.title} ${item.description}`.toLowerCase().includes(q)),
      )
      .map((item) => ({
        id: item.name,
        label: item.title,
        href: `/docs/components/${item.name}`,
        depth: 1,
      }))
    return q ? [...rows, ...foundations] : rows
  }, [query])
  useEffect(() => {
    const current = sidebar.current?.querySelector(
      `a[href="/docs/components/${showcase?.components[0] ?? name}"]`,
    )
    current?.scrollIntoView({ block: "nearest" })
  }, [name, showcase])
  useEffect(() => {
    function key(event: KeyboardEvent) {
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
        onClick={() => setMenu((value) => !value)}
      >
        <PanelLeft size={18} />
      </button>
      <aside
        ref={sidebar}
        className="ag-sidebar"
        data-open={menu}
        aria-label="Library navigation"
      >
        <LiquidGlass
          className="ag-shell-glass absolute inset-0 rounded-[inherit]"
          refraction={0}
          frost={16}
          tint="color-mix(in oklch, var(--card) 65%, transparent)"
        />
        <div className="ag-sidebar-content">
          <Link href="/" prefetch={false} className="ag-brand">
            <AfterglowMark className="size-6" />
            <span>afterglow</span>
          </Link>
          <label className="ag-search">
            <Search size={15} />
            <input
              aria-label="Find a component"
              placeholder="Find a component"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <div className="ag-guide-links">
            {[
              { href: "/docs", label: "Introduction" },
              { href: "/docs/installation", label: "Installation" },
              { href: "/docs/theming", label: "Theming" },
            ].map((item) => (
              <Link
                prefetch={false}
                key={item.href}
                href={item.href}
                onClick={() => setMenu(false)}
                aria-current={
                  guide && title === item.label ? "page" : undefined
                }
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="ag-nav" onClick={navigate}>
            {items.length ? (
              <ReadingRail
                title="Components"
                activeId={showcase?.id ?? name}
                items={items}
              />
            ) : (
              <p className="ag-empty">No matching components.</p>
            )}
          </div>
          <div className="ag-sidebar-bottom">
            <p>Accent color</p>
            <AccentPicker />
          </div>
        </div>
      </aside>
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
