"use client"

import { FlameField } from "@/components/ui/flame-field"

export default function Demo() {
  return (
    <div className="relative isolate flex h-[420px] w-full items-end overflow-hidden rounded-3xl p-8">
      <FlameField className="absolute inset-0 -z-10" />
      <h2 className="text-4xl font-medium">A little afterglow.</h2>
    </div>
  )
}
