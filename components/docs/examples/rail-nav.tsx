"use client"

import { useState } from "react"
import { RailNav } from "@/components/ui/rail-nav"

export default function Demo() {
  const [value, setValue] = useState("overview")
  return (
    <div className="w-full max-w-xs">
      <RailNav
        value={value}
        onValueChange={setValue}
        items={[
          { heading: "Workspace" },
          { id: "overview", label: "Overview" },
          { id: "projects", label: "Projects", badge: "4" },
          { id: "settings", label: "Settings" },
        ]}
      />
      <p className="mt-6 text-sm text-muted-foreground">
        Selected: {value}
      </p>
    </div>
  )
}
