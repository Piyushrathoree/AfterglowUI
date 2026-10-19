"use client"

import * as React from "react"

import { AuthGlass } from "@/components/blocks/auth-glass"
import { AuthSilk } from "@/components/blocks/auth-silk"
import { AuthSplit } from "@/components/blocks/auth-split"
import { AuthSteps } from "@/components/blocks/auth-steps"

// demo only: pretend to talk to a server; an email with "error" in it fails
async function fakeSubmit(values: { email: string }) {
  await new Promise((resolve) => setTimeout(resolve, 1200))
  if (values.email.includes("error")) {
    throw new Error("We couldn't sign you in with those details.")
  }
}

export const authBlocks = [
  {
    name: "auth-silk",
    title: "Silk",
    description: "Black, with satin drapes of liquid metal folding through two corners. A magic-link form whose button is ringed in moving chrome.",
    render: () => <AuthSilk onSubmit={fakeSubmit} />,
  },
  {
    name: "auth-glass",
    title: "Liquid glass",
    description: "A clear pane over dusk waves. The sun sets right behind its edge, so you can watch the rim bend it.",
    render: () => <AuthGlass onSubmit={fakeSubmit} />,
  },
  {
    name: "auth-split",
    title: "Split",
    description: "Email first on the left. On the right, customer stories in a glass card over graphite silk; hover to pause them.",
    render: () => <AuthSplit onSubmit={fakeSubmit} />,
  },
  {
    name: "auth-steps",
    title: "One question",
    description: "No card, no noise. One question per screen, keyboard hints, and Escape to step back.",
    render: () => <AuthSteps onSubmit={fakeSubmit} />,
  },
]

export function AuthShowcase() {
  return (
    <div className="flex flex-col gap-16">
      {authBlocks.map((block) => (
        <section key={block.name} id={block.name} className="flex scroll-mt-8 flex-col gap-4">
          <div className="flex flex-col gap-1 px-1">
            <h2 className="font-mono text-sm">{block.name}</h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{block.title}.</span>{" "}
              {block.description}
            </p>
          </div>
          <div className="overflow-hidden rounded-3xl border shadow-[0_30px_80px_-40px_oklch(0_0_0/50%)]">
            {block.render()}
          </div>
        </section>
      ))}
    </div>
  )
}

// the home page preview, with the same pretend server
export function SilkDemo() {
  return <AuthSilk onSubmit={fakeSubmit} />
}
