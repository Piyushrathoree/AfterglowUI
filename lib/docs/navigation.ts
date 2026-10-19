import type { Node } from "fumadocs-core/page-tree"

export type DocsLink = { title: string; url: string; description?: string }
export type DocsGroup = { title: string; items: DocsLink[] }

// Pass only page metadata to the browser, never the MDX collection or demos.
export function getNavigation(nodes: Node[], title = "Getting started"): DocsGroup[] {
  const groups: DocsGroup[] = [{ title, items: [] }]
  for (const node of nodes) {
    if (node.type === "page") {
      groups[groups.length - 1].items.push({
        title: String(node.name), url: node.url,
        description: typeof node.description === "string" ? node.description : undefined,
      })
    } else if (node.type === "folder") {
      groups.push(...getNavigation(node.children, String(node.name)))
    } else {
      groups.push({ title: String(node.name ?? "Documentation"), items: [] })
    }
  }
  return groups.filter((group) => group.items.length)
}
