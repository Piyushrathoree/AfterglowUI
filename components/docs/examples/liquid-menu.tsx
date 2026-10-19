"use client"

import { useState } from "react"
import { Copy, Share, MoreHorizontal } from "lucide-react"
import { LiquidMenu } from "@/components/ui/liquid-menu"

export default function Demo() {
  const [action, setAction] = useState("Choose an action")
  return (
    <div className="min-h-64 space-y-6 pt-8 text-center">
      <LiquidMenu
        trigger={<MoreHorizontal />}
        triggerLabel="More actions"
        items={[
          {
            label: "Copy link",
            icon: <Copy />,
            onSelect: () => setAction("Link copied"),
          },
          {
            label: "Share",
            icon: <Share />,
            onSelect: () => setAction("Ready to share"),
          },
        ]}
      />
      <p className="text-sm text-muted-foreground" role="status">
        {action}
      </p>
    </div>
  )
}
