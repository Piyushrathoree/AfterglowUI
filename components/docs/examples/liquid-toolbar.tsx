"use client"

import { useState } from "react"
import { Bold, Italic, Underline } from "lucide-react"
import { LiquidToolbar } from "@/components/ui/liquid-toolbar"

export default function Demo() {
  const [bold, setBold] = useState(false)
  const [italic, setItalic] = useState(false)
  const [underline, setUnderline] = useState(false)
  return (
    <div className="space-y-8 text-center">
      <LiquidToolbar
        aria-label="Text formatting"
        items={[
          {
            label: "Bold",
            icon: <Bold />,
            pressed: bold,
            onClick: () => setBold(!bold),
          },
          {
            label: "Italic",
            icon: <Italic />,
            pressed: italic,
            onClick: () => setItalic(!italic),
          },
          "divider",
          {
            label: "Underline",
            icon: <Underline />,
            pressed: underline,
            onClick: () => setUnderline(!underline),
          },
        ]}
      />
      <p
        style={{
          fontWeight: bold ? 700 : 400,
          fontStyle: italic ? "italic" : "normal",
          textDecoration: underline ? "underline" : "none",
        }}
      >
        Make it yours.
      </p>
    </div>
  )
}
