"use client"

import { useEffect, useState, type PointerEvent } from "react"
import { CopyButton } from "./copy-button"

type SourceFile = { path: string; code: string; html: string }

export function SourceViewer({ name, title, onClose, onGrab }: {
  name: string; title: string; onClose: () => void; onGrab?: (event: PointerEvent<HTMLButtonElement>) => void
}) {
  const [files, setFiles] = useState<SourceFile[] | null>(null)
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [selected, setSelected] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    fetch(`/api/docs/source/${encodeURIComponent(name)}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load source")
        const data: { files: SourceFile[] } = await response.json()
        if (!controller.signal.aborted) setFiles(data.files)
      })
      .catch(() => { if (!controller.signal.aborted) setError(true) })
    return () => controller.abort()
  }, [name, attempt])
  const current = files?.[selected]
  return (
    <div className="workspace-source-viewer">
      <button type="button" className="workspace-source-grab" aria-label="Close source drawer" onPointerDown={onGrab} onClick={onClose}><span /></button>
      <div className="workspace-source-heading">{title}</div>
      {files && files.length > 1 && <select aria-label="Source file" className="workspace-source-select" value={selected} onChange={(event) => setSelected(Number(event.target.value))}>
        {files.map((file, index) => <option value={index} key={file.path}>{file.path}</option>)}
      </select>}
      {error ? <div className="workspace-source-loading" role="alert"><p>Source could not be loaded.</p><button type="button" onClick={() => { setError(false); setAttempt((value) => value + 1) }}>Try again</button></div>
        : current ? <div className="workspace-source-code docs-code">
          <CopyButton text={current.code} label="Copy source code" />
          <div className="workspace-source-scroller" key={current.path} dangerouslySetInnerHTML={{ __html: current.html }} />
        </div> : <p className="workspace-source-loading" role="status">Loading source…</p>}
    </div>
  )
}
