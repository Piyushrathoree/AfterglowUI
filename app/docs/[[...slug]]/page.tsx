import { Suspense } from "react"
import { notFound } from "next/navigation"
import { source } from "@/lib/docs/source"
import { isComponentName } from "@/lib/docs/catalog"
import { getShowcase, hasDemo } from "@/lib/docs/showcases"
import { getMDXComponents } from "@/components/docs/mdx"
import { LibraryWorkspace } from "@/components/docs/library-workspace"
import { LibraryDemo } from "@/components/docs/library-demo"

type Props = { params: Promise<{ slug?: string[] }> }
export function generateStaticParams() { return source.generateParams() }
export async function generateMetadata({ params }: Props) {
  const page = source.getPage((await params).slug)
  if (!page) notFound()
  const name = page.slugs.at(-1) ?? "introduction"
  const showcase = page.slugs[0] === "components" ? getShowcase(name) : undefined
  const title = `${showcase?.title ?? page.data.title} — Afterglow UI`
  const description = page.data.description
  return {
    title,
    description,
    keywords: [...new Set([
      ...(showcase ? [showcase.title, ...showcase.keywords, ...showcase.components] : [page.data.title]),
      "React component",
      "Tailwind CSS",
      "shadcn",
      "animated UI",
    ].map((word) => word.toLowerCase()))],
    openGraph: { title, description, type: "article", siteName: "Afterglow UI" },
    twitter: { card: "summary", title, description },
  }
}
export default function DocsPage({ params }: Props) {
  return <Suspense fallback={<LibraryWorkspace name="" title="Components" description="Browse the collection." guide documentation={<p role="status">Loading documentation…</p>} />}><ResolvedDocsPage params={params} /></Suspense>
}

async function ResolvedDocsPage({ params }: Props) {
  const page = source.getPage((await params).slug)
  if (!page) notFound()
  const { body: Content } = await page.data.load()
  const name = page.slugs.at(-1) ?? "introduction"
  const component = page.slugs[0] === "components" && isComponentName(name) && hasDemo(name)
  const related = component ? getShowcase(name)?.components ?? [] : []
  // Related references share one preview; load their docs together so the demo stays mounted.
  const referenceDocs = related.length > 1 ? await Promise.all(related.map(async (referenceName) => {
    const referencePage = source.getPage(["components", referenceName])
    if (!referencePage) throw new Error(`Missing documentation for ${referenceName}`)
    const ReferenceContent = referenceName === name ? Content : (await referencePage.data.load()).body
    return {
      name: referenceName,
      title: referencePage.data.title,
      description: referencePage.data.description ?? "",
      documentation: <ReferenceContent components={getMDXComponents()} />,
    }
  })) : []
  return <LibraryWorkspace name={name} title={page.data.title} description={page.data.description ?? ""}
    guide={!component} preview={component ? <LibraryDemo name={name} /> : undefined}
    referenceDocs={referenceDocs}
    documentation={<Content components={getMDXComponents()} />} />
}
