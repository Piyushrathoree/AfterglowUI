export type SourceFile = { path: string; code: string; html: string }

// One request per component per visit: the workspace warms this in the background,
// so opening the Code view reads from memory instead of showing a loading state.
const pending = new Map<string, Promise<SourceFile[]>>()
const loaded = new Map<string, SourceFile[]>()

export function loadSource(name: string) {
  let request = pending.get(name)
  if (!request) {
    request = fetch(`/api/docs/source/${encodeURIComponent(name)}`)
      .then(async (response) => {
        if (!response.ok) throw new Error("Source unavailable")
        const { files } = await response.json() as { files: SourceFile[] }
        loaded.set(name, files)
        return files
      })
    // a failed request is forgotten, so the retry button asks again
    request.catch(() => pending.delete(name))
    pending.set(name, request)
  }
  return request
}

export function loadedSource(name: string) {
  return loaded.get(name) ?? null
}
