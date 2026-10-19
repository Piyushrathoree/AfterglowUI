"use client"

import { GlassToaster, toast } from "@/components/ui/glass-toaster"
import { GlossButton } from "@/components/ui/gloss-button"

export default function Demo() {
  return (
    <>
      <GlossButton
        onClick={() =>
          toast("Changes saved", {
            description: "Your project is up to date.",
          })
        }
      >
        Show notification
      </GlossButton>
      <GlassToaster position="bottom-center" />
    </>
  )
}
