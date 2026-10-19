"use client"

import { FlameFooter } from "@/components/ui/flame-footer"

export default function Demo() {
  return (
    <FlameFooter
      className="w-full"
      headline="A little afterglow."
      links={[
        { label: "Components", href: "/docs/components/fan-cards" },
        { label: "Getting started", href: "/docs/installation" },
      ]}
      legal="Afterglow UI"
    />
  )
}
