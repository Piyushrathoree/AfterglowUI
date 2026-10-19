"use client"

import { useState } from "react"
import { GlassSwitch } from "@/components/ui/glass-switch"

export default function Demo() {
  const [enabled, setEnabled] = useState(true)
  return (
    <div className="flex items-center gap-5">
      <GlassSwitch
        checked={enabled}
        onCheckedChange={setEnabled}
        aria-label="Enable notifications"
      />
      <span>{enabled ? "Notifications on" : "Notifications off"}</span>
    </div>
  )
}
