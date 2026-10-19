"use client"

import { GlossButton } from "@/components/ui/gloss-button"

export default function Demo() {
  return (
    <div className="flex flex-wrap justify-center gap-4">
      <GlossButton>Save changes</GlossButton>
      <GlossButton variant="glass">Cancel</GlossButton>
      <GlossButton disabled>Unavailable</GlossButton>
    </div>
  )
}
