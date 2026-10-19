"use client"

import { LiquidGlass } from "@/components/ui/liquid-glass"

export default function Demo() {
  return (
    <div className="relative grid min-h-88 w-full place-items-center overflow-hidden p-8">
      <div className="absolute left-[18%] top-10 size-40 rounded-full bg-glow" />
      <div className="absolute bottom-8 right-[16%] size-32 rounded-full bg-glow-3" />
      <div className="relative max-w-xs rounded-3xl">
        <LiquidGlass
          className="absolute inset-0 rounded-[inherit]"
          frost={6}
        />
        <div className="relative p-8">
          <h2 className="text-xl font-medium">
            A different perspective.
          </h2>
          <p className="mt-4 text-sm leading-6">
            The color behind the glass becomes part of the material.
          </p>
        </div>
      </div>
    </div>
  )
}
