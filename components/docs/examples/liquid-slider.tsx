"use client"

import { useState } from "react"
import { LiquidSlider } from "@/components/ui/liquid-slider"

export default function Demo() {
  const [value, setValue] = useState(60)
  return (
    <div className="w-full max-w-sm space-y-6 px-5">
      <p>Volume: {value}%</p>
      <LiquidSlider
        value={value}
        onValueChange={setValue}
        aria-label="Volume"
      />
    </div>
  )
}
