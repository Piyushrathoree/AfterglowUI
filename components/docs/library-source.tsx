"use client"

import { useEffect, useState } from "react"
import { CopyButton } from "./copy-button"

type File = { path: string; code: string; html: string }
export default function LibrarySource({ name }: { name: string }) {
  const [files, setFiles] = useState<File[] | null>(null)
  const [selected, setSelected] = useState(0)
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    fetch(`/api/docs/source/${encodeURIComponent(name)}`, { signal: controller.signal }).then(async (response) => {
      if (!response.ok) throw new Error("Source unavailable")
      const result = await response.json() as { files: File[] }
      if (!controller.signal.aborted) { setFiles(result.files); setSelected(0) }
    }).catch(() => { if (!controller.signal.aborted) setError(true) })
    return () => controller.abort()
  }, [name, attempt])
  if (error) return <div role="alert"><p>Source could not be loaded.</p><button className="ag-retry" onClick={() => { setError(false); setAttempt(value => value + 1) }}>Try again</button></div>
  if (!files) return <p role="status">Loading source…</p>
  const file = files[selected]
  return <div className="ag-source">
    <label className="ag-file-label">Source file<select value={selected} aria-label="Source file" onChange={event => setSelected(Number(event.target.value))}>{files.map((file, index) => <option value={index} key={file.path}>{file.path}</option>)}</select></label>
    <div className="docs-code"><CopyButton text={file.code} label="Copy source code" /><div dangerouslySetInnerHTML={{ __html: file.html }} /></div>
  </div>
}
