"use client"

import { AuthSteps } from "@/components/blocks/auth-steps"

export default function Demo() {
  return (
    <div className="w-full overflow-hidden rounded-3xl">
      <AuthSteps
        onSubmit={async () => {
          await new Promise((resolve) => setTimeout(resolve, 800))
        }}
      />
    </div>
  )
}
