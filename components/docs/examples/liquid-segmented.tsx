"use client"

import { useState } from "react"
import { Home, Settings, Bell } from "lucide-react"
import { LiquidSegmented } from "@/components/ui/liquid-segmented"

export default function Demo() {
  const [value, setValue] = useState("home")
  return (
    <div className="space-y-8 text-center">
      <LiquidSegmented
        aria-label="Workspace section"
        value={value}
        onValueChange={setValue}
        options={[
          { value: "home", label: "Home", icon: <Home /> },
          { value: "updates", label: "Updates", icon: <Bell /> },
          { value: "settings", label: "Settings", icon: <Settings /> },
        ]}
      />
      <p className="text-sm text-muted-foreground">Selected: {value}</p>
    </div>
  )
}
