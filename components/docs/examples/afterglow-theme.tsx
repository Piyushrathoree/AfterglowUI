"use client"

import { AccentPicker } from "@/components/ui/accent-picker"

export default function Demo() {
  return (
    <div className="space-y-6 text-center">
      <h2 className="text-3xl font-medium text-glow">
        One shared accent.
      </h2>
      <p className="text-muted-foreground">
        Change the accent to update every material.
      </p>
      <AccentPicker />
    </div>
  )
}
