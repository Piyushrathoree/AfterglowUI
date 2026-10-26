"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

export type FontPairOption = {
  id: string
  name: string
  kind: "Sans + Sans" | "Sans + Mono"
  display: string
  body: string
  mono: string
  displayName: string
  bodyName: string
  monoName: string
}

export function FontPairingLab({ pairs }: { pairs: FontPairOption[] }) {
  const [activeId, setActiveId] = useState(pairs[0]?.id ?? "")
  const active = pairs.find((pair) => pair.id === activeId) ?? pairs[0]

  if (!active) return null

  const samples: [string, string, string][] = [
    ["Display", active.displayName, active.display],
    ["Reading", active.bodyName, active.body],
    ["Code", active.monoName, active.mono],
  ]

  return (
    <div className="w-full max-w-4xl min-w-0">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Font pairings">
        {pairs.map((pair) => (
          <button
            key={pair.id}
            type="button"
            aria-pressed={pair.id === active.id}
            onClick={() => setActiveId(pair.id)}
            className={cn(
              "inline-flex min-h-9 items-center gap-2 rounded-full border px-3 text-xs transition-[background-color,border-color,color] duration-200 motion-reduce:transition-none",
              pair.id === active.id
                ? "border-foreground/20 bg-muted text-foreground"
                : "border-border bg-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            )}
          >
            <span>{pair.name}</span>
            <span className="text-[10px] opacity-60">{pair.kind}</span>
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-6 border-t pt-6 sm:grid-cols-[minmax(0,1fr)_220px] sm:gap-8">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">
            {active.kind} · {active.name}
          </p>
          <h3
            className="mt-4 text-3xl leading-[1.08] font-semibold tracking-[-0.045em] text-balance sm:text-4xl"
            style={{ fontFamily: active.display }}
          >
            Liquid glass, with a little light.
          </h3>
          <p
            className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base"
            style={{ fontFamily: active.body }}
          >
            Tactile surfaces, careful motion, and one warm accent make each
            component feel considered.
          </p>
        </div>

        <dl className="grid content-start gap-4 border-t pt-4 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-6">
          {samples.map(([role, name, font]) => (
            <div key={role}>
              <dt className="text-xs text-muted-foreground">
                {role}
              </dt>
              <dd className="mt-1 truncate text-sm" style={{ fontFamily: font }}>
                {name} <span className="text-muted-foreground">Aa 0123</span>
              </dd>
            </div>
          ))}
          <code
            className="mt-1 overflow-hidden text-ellipsis whitespace-nowrap border-t pt-3 text-xs text-muted-foreground"
            style={{ fontFamily: active.mono }}
          >
            --accent: oklch(0.8 0.16 55);
          </code>
        </dl>
      </div>
    </div>
  )
}
