"use client"

import { AuthSplit } from "@/components/blocks/auth-split"

export default function Demo() {
  return (
    <div className="w-full overflow-hidden rounded-3xl">
      <AuthSplit
        onSubmit={async () => {
          await new Promise((resolve) => setTimeout(resolve, 800))
        }}
      />
    </div>
  )
}
