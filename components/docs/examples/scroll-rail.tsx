"use client"

import { useState } from "react"
import { ScrollRail } from "@/components/ui/scroll-rail"

export default function Demo() {
  const [container, setContainer] = useState<HTMLDivElement | null>(
    null,
  )
  const items = ["Material", "Motion", "Color", "Details"].map(
    (title, i) => ({
      id: `scroll-demo-${i}`,
      title,
      excerpt: `Explore the ${title.toLowerCase()} of Afterglow.`,
    }),
  )
  return (
    <div className="relative w-full max-w-lg pr-16">
      <div
        ref={setContainer}
        className="h-96 overflow-auto rounded-2xl border p-6"
      >
        {items.map((item) => (
          <section
            key={item.id}
            data-rail-id={item.id}
            className="min-h-64 py-8"
          >
            <h2 className="text-xl">{item.title}</h2>
            <p className="mt-4 text-muted-foreground">{item.excerpt}</p>
          </section>
        ))}
      </div>
      <ScrollRail
        className="absolute right-3 top-8"
        items={items}
        container={container}
      />
    </div>
  )
}
