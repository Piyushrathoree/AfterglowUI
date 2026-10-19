"use client"

import { AnchorProvider, TOCItem, type TOCItemType } from "fumadocs-core/toc"
import { NextProvider } from "fumadocs-core/framework/next"

export function DocsTOC({ items }: { items: TOCItemType[] }) {
  return (
    <NextProvider>
      <AnchorProvider toc={items} single>
        <aside className="docs-toc" aria-label="On this page">
          <p>Contents</p>
          <nav>
            {items.map((item) => (
              <TOCItem key={item.url} href={item.url} autoScroll={false}
                style={{ paddingLeft: item.depth > 2 ? 24 : 12 }}>{item.title}</TOCItem>
            ))}
          </nav>
        </aside>
      </AnchorProvider>
    </NextProvider>
  )
}
