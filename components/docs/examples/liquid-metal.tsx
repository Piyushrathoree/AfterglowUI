"use client"

import { LiquidMetal } from "@/components/ui/liquid-metal"

export default function Demo() {
  return (
    <div className="relative h-80 w-full max-w-md overflow-hidden rounded-3xl">
      <LiquidMetal className="absolute inset-0" />
      <div className="relative flex h-full items-center justify-center">
        <span className="rounded-full bg-black/50 px-6 py-3 text-white">
          Moving chrome
        </span>
      </div>
    </div>
  )
}
