import "server-only"

import { readFile } from "node:fs/promises"
import path from "node:path"
import { cacheLife } from "next/cache"
import { createHighlighter, type BundledLanguage } from "shiki"
import registry from "@/registry.json"

let highlighter: ReturnType<typeof createHighlighter> | undefined

export async function highlightCode(code: string, language: BundledLanguage = "tsx") {
  "use cache"
  cacheLife("max")
  highlighter ??= createHighlighter({
    themes: ["github-light", "github-dark"],
    langs: ["tsx", "typescript", "bash", "css", "json"],
  })
  return (await highlighter).codeToHtml(code.trim(), {
    lang: language, themes: { light: "github-light", dark: "github-dark" }, defaultColor: false,
  })
}

function readRegistryFile(file: string) {
  if (file.startsWith("components/ui/")) {
    return readFile(path.join(process.cwd(), "components/ui", file.slice("components/ui/".length)), "utf8")
  }
  if (file.startsWith("components/blocks/")) {
    return readFile(path.join(process.cwd(), "components/blocks", file.slice("components/blocks/".length)), "utf8")
  }
  if (file.startsWith("lib/")) {
    return readFile(path.join(process.cwd(), "lib", file.slice("lib/".length)), "utf8")
  }
  throw new Error(`Unsupported registry source: ${file}`)
}

export async function getRegistrySources(name: string) {
  "use cache"
  cacheLife("max")
  const item = registry.items.find((item) => item.name === name)
  if (!item) return null
  if (!item.files?.length) return [{ path: "afterglow-theme.json", code: JSON.stringify(item, null, 2) }]
  return Promise.all(item.files.map(async (file) => ({
    path: file.path, code: await readRegistryFile(file.path),
  })))
}

export async function getHighlightedSources(name: string) {
  "use cache"
  cacheLife("max")
  const files = await getRegistrySources(name)
  if (!files) return null
  return Promise.all(files.map(async (file) => ({ ...file, html: await highlightCode(file.code) })))
}
