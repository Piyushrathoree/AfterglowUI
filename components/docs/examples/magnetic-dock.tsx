"use client"

import { useState } from "react"
import { Home, Mail, Music, Settings } from "lucide-react"
import { MagneticDock } from "@/components/ui/magnetic-dock"

export default function Demo() {
  const [app, setApp] = useState("Choose an app")
  return (
    <div className="space-y-8 text-center">
      <MagneticDock
        size={42}
        magnification={64}
        items={[
          {
            label: "Home",
            icon: <Home />,
            onClick: () => setApp("Home"),
          },
          {
            label: "Mail",
            icon: <Mail />,
            onClick: () => setApp("Mail"),
          },
          {
            label: "Music",
            icon: <Music />,
            onClick: () => setApp("Music"),
          },
          "divider",
          {
            label: "Settings",
            icon: <Settings />,
            onClick: () => setApp("Settings"),
          },
        ]}
      />
      <p role="status" className="text-sm text-muted-foreground">
        {app}
      </p>
    </div>
  )
}
