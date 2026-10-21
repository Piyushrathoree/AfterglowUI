"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState, type ReactNode } from "react"
import { CodeXml } from "lucide-react"
import { BookOpen } from "@/components/animate-ui/icons/book-open"
import { Eye } from "@/components/animate-ui/icons/eye"
import { getShowcase } from "@/lib/docs/showcases"
import { componentCatalog } from "@/lib/docs/catalog"
import { ThemeToggle } from "@/components/site/theme-toggle"
import LibrarySource from "./library-source"
import { loadSource } from "./source-cache"

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
  // fetch the source once the page is idle, so the Code view opens instantly
  useEffect(() => {
    if (guide || !name) return
    const warm = () => { loadSource(name).catch(() => {}) }
    if (!("requestIdleCallback" in window)) {
      const timer = setTimeout(warm, 600)
      return () => clearTimeout(timer)
    }
    const id = requestIdleCallback(warm, { timeout: 2000 })
    return () => cancelIdleCallback(id)
  }, [guide, name])
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
                    onPointerEnter={item.value === "code" ? () => { loadSource(name).catch(() => {}) } : undefined}
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
            <div className="ag-detail-content">
              <div
                className="ag-reading-panel"
                key={`${name}-${view}`}
                tabIndex={0}
                aria-label={`${title} ${view === "code" ? "code" : "docs"}`}
              >
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
                <div className="ag-reading-heading">
                  <h2>{referenceTitle}</h2>
                  <p>{view === "code"
                    ? "The component and its shared local dependencies. Select a file to read or copy its source."
                    : referenceDescription}</p>
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
  )
}
