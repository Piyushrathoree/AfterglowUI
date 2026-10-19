"use client"

import { useState } from "react"
import { BorderBeam } from "@/components/ui/border-beam"

export default function Demo() {
  const [active, setActive] = useState(true)
  return (
    <button
      className="relative rounded-3xl border p-12"
      onClick={() => setActive(!active)}
    >
      <BorderBeam active={active} />
      <span className="relative">
        {active ? "Working · Click to stop" : "Paused · Click to start"}
      </span>
    </button>
  )
}
