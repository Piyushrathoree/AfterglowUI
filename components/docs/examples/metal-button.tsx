"use client"

import { MetalButton } from "@/components/ui/metal-button"

export default function Demo() {
  return (
    <div className="flex flex-wrap justify-center gap-4">
      <MetalButton>Continue</MetalButton>
      <MetalButton variant="silver">Save changes</MetalButton>
    </div>
  )
}
