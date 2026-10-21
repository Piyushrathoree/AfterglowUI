"use client"

import * as React from "react"
import { Inbox } from "lucide-react"
import { BellRing } from "@/components/animate-ui/icons/bell-ring"
import { Check } from "@/components/animate-ui/icons/check"
import { Undo2 } from "@/components/animate-ui/icons/undo-2"

import { GlassSlider } from "@/components/ui/glass-slider"
import { GlassSwitch } from "@/components/ui/glass-switch"
import { GlassToaster, toast } from "@/components/ui/glass-toaster"
import { GlossButton } from "@/components/ui/gloss-button"

const settings = [
  {
    label: "Afterglow",
    hint: "Lights linger after you leave",
    defaultChecked: true,
  },
  { label: "Soft haptics", hint: "A gentle tap on every toggle" },
  {
    label: "Sync across devices",
    hint: "Keep your settings everywhere",
    defaultChecked: true,
  },
]

export function SwitchDemo() {
  return (
    <div className="w-full max-w-sm divide-y divide-border rounded-2xl bg-glass shadow-glass backdrop-blur-xl backdrop-saturate-150">
      {settings.map((row) => (
        <label
          key={row.label}
          className="flex cursor-pointer items-center justify-between gap-4 px-4 py-3.5"
        >
          <span>
            <span className="block text-sm font-medium">{row.label}</span>
            <span className="block text-xs text-muted-foreground">
              {row.hint}
            </span>
          </span>
          <GlassSwitch defaultChecked={row.defaultChecked} />
        </label>
      ))}
    </div>
  )
}

export function SliderDemo() {
  const id = React.useId()
  const [intensity, setIntensity] = React.useState(64)

  return (
    <div className="w-full max-w-sm rounded-2xl bg-glass p-5 shadow-glass backdrop-blur-xl backdrop-saturate-150">
      <div className="mb-3 flex items-baseline justify-between">
        <span id={`${id}-intensity`} className="text-sm font-medium">
          Glow intensity
        </span>
        <span className="font-mono text-xs text-muted-foreground tabular-nums">
          {intensity}%
        </span>
      </div>
      <GlassSlider
        aria-labelledby={`${id}-intensity`}
        value={intensity}
        onValueChange={setIntensity}
        formatValue={(v) => `${v}%`}
      />
      <div id={`${id}-warmth`} className="mt-5 mb-3 text-sm font-medium">
        Warmth
      </div>
      <GlassSlider
        aria-labelledby={`${id}-warmth`}
        defaultValue={3200}
        min={1800}
        max={6500}
        step={100}
        formatValue={(v) => `${v}K`}
      />
    </div>
  )
}

export function ToastDemo({ contained = false }: { contained?: boolean }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <GlossButton
        onClick={() =>
          toast("Changes saved", {
            description: "Your theme now glows a little warmer.",
            icon: <Check />,
          })
        }
      >
        <BellRing />
        Show a toast
      </GlossButton>
      <GlossButton
        variant="glass"
        onClick={() =>
          toast("Conversation archived", {
            description: "Swipe it away, or bring it back.",
            icon: <Inbox />,
            action: {
              label: "Undo",
              onClick: () => toast("Restored", { icon: <Undo2 /> }),
            },
          })
        }
      >
        With an action
      </GlossButton>
      <GlassToaster className={contained ? "absolute inset-x-4 bottom-5 w-auto max-w-[356px] mx-auto" : undefined} />
    </div>
  )
}
