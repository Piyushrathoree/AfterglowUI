"use client"

import Link from "next/link"
import { ArrowRight, Search, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import type { DocsLink } from "@/lib/docs/navigation"

export function DocsSearch({ pages }: { pages: DocsLink[] }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState(0)
  const results = pages.filter((page) => query.toLowerCase().trim().split(/\s+/).every(
    (word) => `${page.title} ${page.description ?? ""}`.toLowerCase().includes(word)
  ))

  function open() {
    setQuery("")
    setSelected(0)
    if (!dialog.current?.open) dialog.current?.showModal()
  }

  useEffect(() => {
    function keydown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        open()
      }
    }
    window.addEventListener("keydown", keydown)
    window.addEventListener("afterglow:search", open)
    return () => {
      window.removeEventListener("keydown", keydown)
      window.removeEventListener("afterglow:search", open)
    }
  }, [])

  return (
    <>
      <button type="button" className="docs-search-trigger" onClick={open} aria-label="Search documentation">
        <Search size={15} /><span>Search documentation…</span><kbd>⌘ K / Ctrl K</kbd>
      </button>
      <dialog ref={dialog} className="docs-search-dialog" aria-labelledby="docs-search-title"
        onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close() }}>
        <div className="docs-search-surface">
          <h2 id="docs-search-title" className="sr-only">Search documentation</h2>
          <div className="docs-search-input">
            <Search size={18} />
            <input aria-label="Search documentation" placeholder="Find a component or guide…" value={query}
              autoComplete="off" spellCheck={false}
              onChange={(event) => { setQuery(event.target.value); setSelected(0) }}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                  event.preventDefault()
                  const direction = event.key === "ArrowDown" ? 1 : -1
                  setSelected((value) => Math.max(0, Math.min(results.length - 1, value + direction)))
                } else if (event.key === "Enter") {
                  event.preventDefault()
                  dialog.current?.querySelector<HTMLAnchorElement>(`[data-result="${selected}"]`)?.click()
                }
              }}
            />
            <button type="button" aria-label="Close search" onClick={() => dialog.current?.close()}><X size={17} /></button>
          </div>
          <div className="docs-search-results" aria-live="polite">
            <p className="docs-search-label">{query ? `${results.length} result${results.length === 1 ? "" : "s"}` : "Components & guides"}</p>
            {results.map((page, index) => (
              <Link href={page.url} key={page.url} data-result={index} data-selected={index === selected}
                prefetch={false} onClick={() => dialog.current?.close()} onMouseMove={() => setSelected(index)}>
                <span><strong>{page.title}</strong><small>{page.description}</small></span><ArrowRight size={16} />
              </Link>
            ))}
            {!results.length && <p className="docs-search-empty">No matches. Try “glass”, “cards”, or “installation”.</p>}
          </div>
          <div className="docs-search-footer"><span>↑ ↓ to navigate · Enter to open</span><span>Esc to close</span></div>
        </div>
      </dialog>
    </>
  )
}
