"use client"

import { useState } from "react"
import { GlassSlider } from "@/components/ui/glass-slider"

export default function Demo() {
  const [value, setValue] = useState(60)
  return (
    <div className="w-full max-w-sm space-y-6 px-5">
      <p>Volume: {value}%</p>
      <GlassSlider
        value={value}
        onValueChange={setValue}
        aria-label="Volume"
      />
    </div>
  )
}
