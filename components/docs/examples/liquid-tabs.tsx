"use client"

import { useState } from "react"
import { Home, Settings, Bell } from "lucide-react"
import { LiquidTabs } from "@/components/ui/liquid-tabs"

export default function Demo() {
  const [value, setValue] = useState("home")
  return (
    <div className="space-y-8 text-center">
      <LiquidTabs
        aria-label="Workspace section"
        value={value}
        onValueChange={setValue}
        tabs={[
          { value: "home", label: "Home", icon: <Home /> },
          { value: "updates", label: "Updates", icon: <Bell /> },
          { value: "settings", label: "Settings", icon: <Settings /> },
        ]}
      />
      <p className="text-sm text-muted-foreground">Selected: {value}</p>
    </div>
  )
}
