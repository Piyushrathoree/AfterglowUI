"use client"

import { useState } from "react"
import { ReadingRail } from "@/components/ui/reading-rail"

export default function Demo() {
  const [container, setContainer] = useState<HTMLDivElement | null>(
    null,
  )
  const items = [
    { id: "demo-material", label: "The material" },
    { id: "demo-edge", label: "The edge", depth: 1 },
    { id: "demo-motion", label: "The movement" },
    { id: "demo-response", label: "The response", depth: 1 },
  ]
  return (
    <div className="ag-rail-example">
      <ReadingRail
        title="Contents"
        container={container}
        items={items}
      />
      <div ref={setContainer} className="ag-rail-article">
        {items.map((item) => (
          <section key={item.id} id={item.id}>
            <h2>{item.label}</h2>
            <p>
              A shared material, a considered edge, and motion that
              follows your touch.
            </p>
            <p>Select a heading or scroll to follow the path.</p>
          </section>
        ))}
      </div>
    </div>
  )
}
