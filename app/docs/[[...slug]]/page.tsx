import { Suspense } from "react"
import { notFound } from "next/navigation"
import { source } from "@/lib/docs/source"
import { isComponentName } from "@/lib/docs/catalog"
import { getMDXComponents } from "@/components/docs/mdx"
import { LibraryWorkspace } from "@/components/docs/library-workspace"
import { LibraryDemo } from "@/components/docs/library-demo"

type Props = { params: Promise<{ slug?: string[] }> }
export function generateStaticParams() { return source.generateParams() }
export async function generateMetadata({ params }: Props) {
  const page = source.getPage((await params).slug)
  if (!page) notFound()
  return { title: `${page.data.title} — Afterglow UI`, description: page.data.description }
}
export default function DocsPage({ params }: Props) {
  return <Suspense fallback={<LibraryWorkspace name="" title="Components" description="Browse the collection." guide documentation={<p role="status">Loading documentation…</p>} />}><ResolvedDocsPage params={params} /></Suspense>
}

async function ResolvedDocsPage({ params }: Props) {
  const page = source.getPage((await params).slug)
  if (!page) notFound()
  const { body: Content } = await page.data.load()
  const name = page.slugs.at(-1) ?? "introduction"
  const component = page.slugs[0] === "components" && isComponentName(name)
  return <LibraryWorkspace name={name} title={page.data.title} description={page.data.description ?? ""}
    guide={!component} preview={component ? <LibraryDemo name={name} /> : undefined}
    documentation={<Content components={getMDXComponents()} />} />
}
