"use client"

import { MetalCard } from "@/components/ui/metal-card"

export default function Demo() {
  return (
    <MetalCard className="w-full max-w-sm rounded-3xl p-10">
      <p className="text-sm text-muted-foreground">Afterglow studio</p>
      <h2 className="mt-4 text-3xl font-medium">
        Consider every edge.
      </h2>
      <p className="mt-6 text-sm leading-6 text-muted-foreground">
        A quiet surface, framed in moving chrome.
      </p>
    </MetalCard>
  )
}
