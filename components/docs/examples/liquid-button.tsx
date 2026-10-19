"use client"

import { useState } from "react"
import { LiquidButton } from "@/components/ui/liquid-button"

export default function Demo() {
  const [count, setCount] = useState(0)
  return (
    <LiquidButton size="lg" onClick={() => setCount(count + 1)}>
      {count ? `Pressed ${count} times` : "Press the glass"}
    </LiquidButton>
  )
}
