"use client"

import { AuthGlass } from "@/components/blocks/auth-glass"

export default function Demo() {
  return (
    <div className="w-full overflow-hidden rounded-3xl">
      <AuthGlass
        onSubmit={async () => {
          await new Promise((resolve) => setTimeout(resolve, 800))
        }}
      />
    </div>
  )
}
