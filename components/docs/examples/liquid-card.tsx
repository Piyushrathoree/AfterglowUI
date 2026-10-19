"use client"

import { LiquidCard } from "@/components/ui/liquid-card"

export default function Demo() {
  return (
    <LiquidCard className="w-full max-w-xs p-8">
      <p className="text-sm text-muted-foreground">Your next project</p>
      <h2 className="mt-4 text-3xl">Make it yours.</h2>
      <p className="mt-6 text-sm leading-6">
        A clear material with a curved edge and a gentle response.
      </p>
    </LiquidCard>
  )
}
