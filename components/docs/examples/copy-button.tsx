"use client"

import { CopyButton } from "@/components/ui/copy-button"

export default function Demo() {
  return (
    <div className="flex items-center gap-4 rounded-xl border p-5">
      <code>hello@afterglow.ui</code>
      <CopyButton value="hello@afterglow.ui" tooltip />
    </div>
  )
}
