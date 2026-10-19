"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { CSSProperties } from "react"
import { useState } from "react"
import type { DocsGroup } from "@/lib/docs/navigation"

export function DocsNavigation({ groups, onNavigate }: { groups: DocsGroup[]; onNavigate?: () => void }) {
  const pathname = usePathname()
  const [hovered, setHovered] = useState<string | null>(null)
  return (
    <nav className="workspace-navigation" aria-label="Documentation">
      {groups.map((group) => {
        const active = group.items.findIndex((item) => item.url === pathname)
        const hover = group.items.findIndex((item) => item.url === hovered)
        return (
          <section key={group.title} className="workspace-nav-group">
            <h2>{group.title}</h2>
            <div className="workspace-nav-items" onPointerLeave={() => setHovered(null)}>
              {hover >= 0 && hover !== active && <span aria-hidden className="workspace-nav-rail workspace-nav-rail-hover" style={{ "--rail-row": hover } as CSSProperties} />}
              {active >= 0 && <span aria-hidden className="workspace-nav-rail" style={{ "--rail-row": active } as CSSProperties} />}
              {group.items.map((item) => (
                <Link key={item.url} href={item.url} prefetch={false} onClick={onNavigate}
                  onPointerEnter={() => setHovered(item.url)} onFocus={() => setHovered(item.url)} onBlur={() => setHovered(null)}
                  aria-current={pathname === item.url ? "page" : undefined}>
                  {item.title}
                </Link>
              ))}
            </div>
          </section>
        )
      })}
      <section className="workspace-nav-group">
        <h2>Explore</h2>
        <div className="workspace-nav-items">
          <Link href="/" prefetch={false} onClick={onNavigate}>Component gallery</Link>
          <Link href="/auth" prefetch={false} onClick={onNavigate}>Auth forms</Link>
        </div>
      </section>
    </nav>
  )
}
