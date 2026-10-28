"use client"

import { usePathname } from "next/navigation"
import { useEffect, useRef, useState, type ReactNode } from "react"
import { CodeXml } from "lucide-react"
import { BookOpen } from "@/components/animate-ui/icons/book-open"
import { Eye } from "@/components/animate-ui/icons/eye"
import { getShowcase } from "@/lib/docs/showcases"
import { componentCatalog } from "@/lib/docs/catalog"
import { ThemeToggle } from "@/components/site/theme-toggle"
import LibrarySource from "./library-source"
import { loadSource } from "./source-cache"
import { DocsPicker } from "./docs-picker"

type ReferenceDoc = { name: string; title: string; description: string; documentation: ReactNode }

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
  referenceDocs = [],
  guide = false,
}: {
  name: string
  title: string
  description: string
  preview?: ReactNode
  documentation: ReactNode
  referenceDocs?: ReferenceDoc[]
  guide?: boolean
}) {
  const pathname = usePathname()
  const showcase = getShowcase(name)
  const pathName = pathname.split("/").filter(Boolean).at(-1)
  const activeReference = referenceDocs.find((item) => item.name === pathName)
  const currentName = activeReference?.name ?? name
  const currentTitle = activeReference?.title ?? referenceTitle
  const currentDescription = activeReference?.description ?? referenceDescription
  const currentDocumentation = activeReference?.documentation ?? documentation
  const title = guide ? referenceTitle : (showcase?.title ?? referenceTitle)
  const description = guide
    ? referenceDescription
    : (showcase?.description ?? referenceDescription)
  const references =
    showcase?.components.map(
      (component) => componentCatalog.find((item) => item.name === component)!,
    ) ?? []
  const [view, setView] = useState("docs")
  const reading = useRef<HTMLDivElement>(null)
  const readingContent = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const viewport = reading.current
    const content = readingContent.current
    if (!viewport || !content) return
    let frame = 0
    const measure = () => {
      frame = 0
      viewport.dataset.fadeTop = String(viewport.scrollTop > 4)
      viewport.dataset.fadeBottom = String(viewport.scrollHeight - viewport.clientHeight - viewport.scrollTop > 4)
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure)
    }
    const observer = new ResizeObserver(schedule)
    observer.observe(viewport)
    observer.observe(content)
    viewport.addEventListener("scroll", schedule, { passive: true })
    schedule()
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      viewport.removeEventListener("scroll", schedule)
    }
  }, [guide, currentName, view])
  // fetch the source once the page is idle, so the Code view opens instantly
  useEffect(() => {
    if (guide || !currentName) return
    const warm = () => { loadSource(currentName).catch(() => {}) }
    if (!("requestIdleCallback" in window)) {
      const timer = setTimeout(warm, 600)
      return () => clearTimeout(timer)
    }
    const id = requestIdleCallback(warm, { timeout: 2000 })
    return () => cancelIdleCallback(id)
  }, [guide, currentName])
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
  return (
    <main className="ag-main" id="docs-content" tabIndex={-1} data-guide={guide}>
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
            <div className="ag-workspace-tools">
              <div className="ag-view-switch" role="group" aria-label="Workspace view">
                {views.map((item) => (
                  <button key={item.value} aria-pressed={view === item.value}
                    onPointerEnter={item.value === "code" ? () => { loadSource(currentName).catch(() => {}) } : undefined}
                    onClick={() => changeView(item.value)}>
                    {item.icon}<span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
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
        >
          <div className="ag-preview-pane">
            <div
              className="ag-library-preview"
              data-component-preview={currentName}
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
            <div className="ag-detail-content">
              <div
                ref={reading}
                className="ag-reading-panel"
                key={view}
                tabIndex={0}
                aria-label={`${title} ${view === "code" ? "code" : "docs"}`}
              >
                <div ref={readingContent} className="ag-reading-inner">
                  {references.length > 1 && referenceDocs.length > 1 && (
                    <DocsPicker
                      label="Component reference"
                      variant="reference"
                      items={references.map(item => item.title)}
                      selected={Math.max(0, references.findIndex(item => item.name === currentName))}
                      onSelect={index => {
                        const next = references[index]?.name
                        if (next && next !== currentName) window.history.pushState(null, "", `/docs/components/${next}`)
                      }}
                    />
                  )}
                  <div className="ag-reading-heading">
                    <h2>{currentTitle}</h2>
                    <p>{view === "code"
                      ? "The component and its shared local dependencies. Select a file to read or copy its source."
                      : currentDescription}</p>
                  </div>
                  {view === "code" ? (
                    <LibrarySource key={currentName} name={currentName} />
                  ) : (
                    <article className="ag-doc-article ag-mdx">
                      {currentDocumentation}
                    </article>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </main>
  )
}
