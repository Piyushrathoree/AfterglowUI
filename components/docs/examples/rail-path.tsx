"use client"

import { useState } from "react"
import { buildTrack } from "@/components/ui/rail-path"

export default function Demo() {
  const [nested, setNested] = useState(true)
  const track = buildTrack([
    { x: 16, y: 20 },
    { x: nested ? 40 : 16, y: 100 },
    { x: 16, y: 180 },
    { x: nested ? 40 : 16, y: 260 },
  ])
  return (
    <div className="flex flex-wrap items-center justify-center gap-6">
      <svg
        width="90"
        height="300"
        viewBox="0 0 90 300"
        aria-label="Rounded rail geometry"
      >
        <path
          d={track.d}
          fill="none"
          stroke="var(--glow)"
          strokeWidth="3"
        />
      </svg>
      <button
        className="rounded-xl border px-5 py-3"
        onClick={() => setNested(!nested)}
      >
        Toggle nested rows
      </button>
    </div>
  )
}
