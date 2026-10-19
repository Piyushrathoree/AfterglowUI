"use client"

import {
  Field,
  Divider,
  ProviderButton,
} from "@/components/ui/auth-parts"

export default function Demo() {
  return (
    <div className="w-full max-w-xs space-y-5">
      <ProviderButton provider="google" />
      <Divider />
      <Field
        label="Email address"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
      />
    </div>
  )
}
