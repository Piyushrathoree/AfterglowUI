import { getHighlightedSources } from "@/lib/docs/source-code"

import { componentCatalog } from "@/lib/docs/catalog"

const documentedComponents: string[] = componentCatalog.map((item) => item.name)

export function generateStaticParams() {
  return documentedComponents.map((name) => ({ name }))
}

export async function GET(_request: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  if (!documentedComponents.includes(name)) return Response.json({ error: "Component not found" }, { status: 404 })
  const files = await getHighlightedSources(name)
  if (!files) return Response.json({ error: "Source not found" }, { status: 404 })
  return Response.json({ files }, { headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=86400" } })
}
