import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { AuthShowcase } from "@/components/site/auth-demos"
import { ThemeToggle } from "@/components/site/theme-toggle"

export const metadata: Metadata = {
  title: "Auth forms · Afterglow UI",
  description: "Sign-in blocks in four styles, from satin metal to liquid glass.",
}

export default function AuthPage() {
  return (
    <div className="relative isolate min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Components
        </Link>
        <ThemeToggle />
      </header>
      <main className="mx-auto max-w-6xl px-6 pb-24">
        <div className="py-12">
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Auth forms
          </h1>
          <p className="mt-4 max-w-xl text-lg text-pretty text-muted-foreground">
            Four sign-in styles with real labels, error states, password toggles and
            loading states. Bring your own auth; each block calls your{" "}
            <code className="font-mono text-base">onSubmit</code>.
          </p>
        </div>
        <AuthShowcase />
      </main>
    </div>
  )
}
