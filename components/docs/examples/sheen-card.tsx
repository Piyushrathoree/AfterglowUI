"use client"

import { SheenCard } from "@/components/ui/sheen-card"

export default function Demo() {
  return (
    <SheenCard className="w-full max-w-sm rounded-3xl border p-10">
      <p className="text-sm text-muted-foreground">Afterglow studio</p>
      <h2 className="mt-3 text-3xl font-medium">
        A different perspective.
      </h2>
      <p className="mt-6 text-muted-foreground">
        Move your pointer across the surface.
      </p>
    </SheenCard>
  )
}
