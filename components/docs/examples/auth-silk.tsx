"use client"

import { AuthSilk } from "@/components/blocks/auth-silk"

export default function Demo() {
  return (
    <div className="w-full overflow-hidden rounded-3xl">
      <AuthSilk
        className="ag-auth-demo"
        onSubmit={async () => {
          await new Promise((resolve) => setTimeout(resolve, 800))
        }}
      />
    </div>
  )
}
