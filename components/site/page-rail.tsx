"use client"

import * as React from "react"

import { ScrollRail, type ScrollRailItem } from "@/components/ui/scroll-rail"

// lists every component on the page, read from the `data-rail-*` attributes on each preview,
// so a new component shows up here without touching this file
export function PageRail() {
  const [items, setItems] = React.useState<ScrollRailItem[]>([])

  React.useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const nodes = document.querySelectorAll<HTMLElement>("[data-rail-id^='c-']")
      setItems(
        Array.from(nodes).map((node) => ({
          id: node.dataset.railId ?? "",
          title: node.dataset.railTitle ?? "",
          excerpt: node.dataset.railExcerpt,
          group: node.closest<HTMLElement>("[data-rail-group]")?.dataset.railGroup,
        }))
      )
    })
    return () => cancelAnimationFrame(frame)
  }, [])

  if (!items.length) return null
  return <ScrollRail items={items} className="fixed top-1/2 right-3 z-40 hidden -translate-y-1/2 min-[1180px]:block" />
}
