"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react"
import { PanelLeft } from "@/components/animate-ui/icons/panel-left"
import { foundationDemos, getShowcase, showcases } from "@/lib/docs/showcases"
import { componentCatalog } from "@/lib/docs/catalog"
import { GlassSidebar, type GlassSidebarHeading, type GlassSidebarItem } from "@/components/ui/glass-sidebar"
import { AccentPicker } from "@/components/ui/accent-picker"
import { AfterglowMark } from "@/components/ui/auth-parts"

type Rows = (GlassSidebarHeading | GlassSidebarItem)[]

// Lives in the docs layout, so the sidebar and its scroll position survive every page change.
export function LibraryShell({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [menu, setMenu] = useState(false)
  const sidebar = useRef<HTMLElement>(null)
  const items = useMemo(() => {
    const rows: Rows = [
      { heading: "Getting started" },
      { id: "introduction", label: "Introduction", href: "/docs" },
      { id: "installation", label: "Installation", href: "/docs/installation" },
      { id: "theming", label: "Theming", href: "/docs/theming" },
    ]
    const groups = new Map<string, typeof showcases[number][]>()
    for (const scene of showcases) {
      const group = groups.get(scene.group) ?? []
      group.push(scene)
      groups.set(scene.group, group)
    }
    for (const [group, scenes] of groups) {
      rows.push({ heading: group })
      rows.push(...scenes.map(scene => ({
        id: scene.id,
        label: scene.title,
        href: `/docs/components/${scene.components[0]}`,
        keywords: `${scene.group} ${scene.description} ${scene.components.join(" ")} ${scene.keywords.join(" ")}`,
      })))
    }
    const foundations = componentCatalog.filter(item => foundationDemos.includes(item.name))
    if (foundations.length) rows.push({ heading: "Foundations" })
    rows.push(...foundations.map(item => ({
      id: item.name,
      label: item.title,
      href: `/docs/components/${item.name}`,
      keywords: `${item.name} ${item.description}`,
    })))
    return rows
  }, [])
  useLayoutEffect(() => {
    document.body.dataset.docsLock = ""
    return () => {
      delete document.body.dataset.docsLock
    }
  }, [])
  useEffect(() => {
    function key(event: KeyboardEvent) {
      if (!event.defaultPrevented && event.key === "Escape") setMenu(false)
    }
    window.addEventListener("keydown", key)
    return () => window.removeEventListener("keydown", key)
  }, [])
  function navigate(event: React.MouseEvent) {
    const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="/docs"]')
    if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return
    event.preventDefault()
    setMenu(false)
    router.push(link.getAttribute("href")!, { scroll: window.matchMedia("(max-width: 1023px)").matches })
  }
  const props = { sidebar, items, menu, navigate }
  return (
    <div className="ag-concept ag-library">
      <a className="ag-skip-link" href="#docs-content">
        Skip to content
      </a>
      <button
        className="ag-mobile-menu"
        aria-label="Toggle component sidebar"
        aria-expanded={menu}
        aria-controls="docs-navigation"
        onClick={() => setMenu((value) => !value)}
      >
        <PanelLeft size={18} />
      </button>
      {menu && <button className="ag-nav-backdrop" aria-label="Close component sidebar" onClick={() => setMenu(false)} />}
      {/* the pathname is unknown while an unlisted route prerenders, so that shell gets a sidebar with nothing marked */}
      <Suspense fallback={<Sidebar {...props} />}>
        <CurrentSidebar {...props} />
      </Suspense>
      {children}
    </div>
  )
}

type SidebarProps = {
  sidebar: RefObject<HTMLElement | null>
  items: Rows
  menu: boolean
  navigate: (event: React.MouseEvent) => void
  value?: string
}

function CurrentSidebar(props: SidebarProps) {
  const name = usePathname().split("/").filter(Boolean).at(-1) ?? "docs"
  const page = name === "docs" ? "introduction" : name
  const value = getShowcase(page)?.id ?? page
  const { sidebar } = props
  useEffect(() => {
    sidebar.current?.querySelector('[aria-current="page"]')?.scrollIntoView({ block: "nearest" })
  }, [sidebar, value])
  return <Sidebar {...props} value={value} />
}

function Sidebar({ sidebar, items, menu, navigate, value }: SidebarProps) {
  return (
    <GlassSidebar
      ref={sidebar}
      id="docs-navigation"
      className="ag-sidebar"
      data-open={menu}
      aria-label="Library navigation"
      items={items}
      value={value}
      searchPlaceholder="Find a component"
      onClick={navigate}
      header={<Link href="/" prefetch={false} className="ag-docs-brand"><AfterglowMark className="size-6" /><span>afterglow</span></Link>}
      footer={<div className="ag-docs-accent"><p>Accent color</p><AccentPicker /></div>}
    />
  )
}
