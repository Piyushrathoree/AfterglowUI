"use client"

import * as React from "react"
import { Check } from "@/components/animate-ui/icons/check"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import {
  AfterglowMark,
  Field,
  GitHubMark,
  GoogleMark,
  SubmitLabel,
  checkEmail,
  useSubmit,
  type Provider,
} from "@/components/ui/auth-parts"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import { cn } from "@/lib/utils"

type Credentials = { email: string; password: string }

type AuthGlassProps = {
  onSubmit?: (values: Credentials) => Promise<void> | void
  onProvider?: (provider: Provider) => void
  /** what the glass sits on; defaults to layered dusk waves */
  background?: React.ReactNode
  className?: string
}

// back to front: each wave is lit along its crest and darker below
const waves = [
  "M0 330C260 270 470 280 720 330S1190 420 1440 320V900H0Z",
  "M0 450C300 380 560 400 820 460S1250 530 1440 430V900H0Z",
  "M0 560C250 500 590 590 900 545S1290 480 1440 540V900H0Z",
  "M0 670C320 630 650 700 960 655S1320 610 1440 660V900H0Z",
  "M0 790C360 745 760 800 1100 765S1390 755 1440 775V900H0Z",
]

function Waves() {
  // unique gradient ids, so two scenes on one page don't share them
  const id = React.useId().replace(/[^\w-]/g, "")
  return (
    <svg
      aria-hidden
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      className={cn(
        "absolute inset-0 -z-10 size-full",
        "[--sky-1:oklch(0.9_0.03_260)] [--sky-2:oklch(0.93_0.04_320)] [--w1:oklch(0.82_0.07_295)] [--w2:oklch(0.85_0.08_345)] [--w3:oklch(0.9_0.08_65)] [--w4:oklch(0.74_0.08_315)] [--w5:oklch(0.6_0.07_290)]",
        "dark:[--sky-1:oklch(0.13_0.035_275)] dark:[--sky-2:oklch(0.22_0.06_300)] dark:[--w1:oklch(0.36_0.11_295)] dark:[--w2:oklch(0.5_0.13_340)] dark:[--w3:oklch(0.7_0.12_50)] dark:[--w4:oklch(0.28_0.08_315)] dark:[--w5:oklch(0.15_0.035_285)]"
      )}
    >
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: "var(--sky-1)" }} />
          <stop offset="1" style={{ stopColor: "var(--sky-2)" }} />
        </linearGradient>
        <linearGradient id={`${id}-sun`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="oklch(0.97 0.05 90)" />
          <stop offset="1" stopColor="oklch(0.8 0.14 50)" />
        </linearGradient>
        <radialGradient id={`${id}-halo`}>
          <stop offset="0.45" stopColor="oklch(0.85 0.12 60)" stopOpacity={0.35} />
          <stop offset="1" stopColor="oklch(0.85 0.12 60)" stopOpacity={0} />
        </radialGradient>
        {waves.map((_, i) => (
          <linearGradient key={i} id={`${id}-wave-${i}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" style={{ stopColor: `color-mix(in oklch, var(--w${i + 1}), white 14%)` }} />
            <stop offset="0.3" style={{ stopColor: `var(--w${i + 1})` }} />
            <stop offset="1" style={{ stopColor: `color-mix(in oklch, var(--w${i + 1}), black 45%)` }} />
          </linearGradient>
        ))}
      </defs>
      <rect width="1440" height="900" fill={`url(#${id}-sky)`} />
      {/* the sun sets just behind the pane's edge, where the rim bends it */}
      <circle cx="935" cy="300" r="260" fill={`url(#${id}-halo)`} />
      <circle cx="935" cy="300" r="112" fill={`url(#${id}-sun)`} />
      {waves.map((d, i) => (
        <g key={i}>
          <path d={d} fill={`url(#${id}-wave-${i})`} />
          {/* a thin lit crest along the top of each wave */}
          <path d={d.slice(0, d.indexOf("V"))} fill="none" stroke="white" strokeOpacity={0.28} strokeWidth={1.5} />
        </g>
      ))}
    </svg>
  )
}

const well =
  "h-11 rounded-[14px] border-foreground/12 bg-foreground/[0.06] shadow-[inset_0_1px_2px_oklch(0_0_0/18%)] focus-within:border-foreground/30 focus-within:ring-foreground/10"

const quiet =
  "inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full border border-foreground/12 bg-foreground/[0.06] text-[13px] font-medium shadow-[inset_0_1px_0_oklch(1_0_0/18%)] transition-[background-color,scale] duration-150 ease-out motion-reduce:transition-none outline-none hover:bg-foreground/[0.1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground/40 motion-safe:active:scale-[0.98] [&_svg]:size-4"

// a pane of clear glass over dusk waves; its curved rim bends the crests behind it
export function AuthGlass({ onSubmit, onProvider, background, className }: AuthGlassProps) {
  const reduceMotion = useReducedMotion()
  const { status, error, run } = useSubmit(onSubmit)
  const [errors, setErrors] = React.useState<{ email?: string; password?: string }>({})

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const email = String(data.get("email") ?? "")
    const password = String(data.get("password") ?? "")
    const next = {
      email: checkEmail(email),
      password: password ? undefined : "Enter your password.",
    }
    setErrors(next)
    if (next.email || next.password) return
    run({ email: email.trim(), password })
  }

  const swap = {
    initial: reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97, filter: "blur(4px)" },
    animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
    exit: { opacity: 0, transition: { duration: 0.12 } },
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const },
  }

  return (
    <div
      className={cn(
        "relative isolate flex min-h-[44rem] w-full items-center justify-center overflow-hidden px-6 py-16 text-foreground",
        className
      )}
    >
      {background ?? <Waves />}

      <LiquidGlass
        className="w-full max-w-[22rem] rounded-[30px] p-8"
        bezel={30}
        frost={4}
        tint="color-mix(in oklch, var(--background) 55%, transparent)"
      >
        <AnimatePresence mode="wait" initial={false}>
          {status === "done" ? (
            <motion.div key="done" className="flex flex-col items-center py-16 text-center" {...swap}>
              <span className="grid size-12 place-items-center rounded-full bg-foreground text-background shadow-[0_8px_20px_-8px_oklch(0_0_0/50%)]">
                <Check animate aria-hidden className="size-5" strokeWidth={2.5} />
              </span>
              <p className="mt-5 text-[22px] font-medium tracking-[-0.02em]">You&rsquo;re in</p>
              <p className="mt-1.5 text-[13px] text-foreground/65">Opening your workspace…</p>
            </motion.div>
          ) : (
            <motion.div key="form" className="flex flex-col" {...swap}>
              <div className="flex flex-col items-center text-center">
                <span className="grid size-12 place-items-center rounded-[16px] border border-foreground/12 bg-foreground/[0.07] shadow-[inset_0_1px_0_oklch(1_0_0/25%),0_8px_20px_-10px_oklch(0_0_0/40%)] [&_svg]:size-6">
                  <AfterglowMark />
                </span>
                <h1 className="mt-5 text-[22px] font-medium tracking-[-0.02em]">Sign in to Afterglow</h1>
                <p className="mt-1.5 text-[13px] text-foreground/65">Welcome back. Pick up where you left off.</p>
              </div>

              <div className="mt-7 grid grid-cols-2 gap-2.5">
                <button type="button" className={quiet} onClick={() => onProvider?.("google")}>
                  <GoogleMark />
                  Google
                </button>
                <button type="button" className={quiet} onClick={() => onProvider?.("github")}>
                  <GitHubMark />
                  GitHub
                </button>
              </div>

              <div className="my-6 flex items-center gap-3 text-xs text-foreground/50">
                <span className="h-px flex-1 bg-foreground/12" />
                or
                <span className="h-px flex-1 bg-foreground/12" />
              </div>

              <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Field
                  label="Email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  error={errors.email}
                  boxClassName={well}
                  labelClassName="text-[13px] font-normal text-foreground/70"
                />
                <Field
                  label="Password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  error={errors.password}
                  boxClassName={well}
                  labelClassName="text-[13px] font-normal text-foreground/70"
                  aside={
                    <a href="#" className="text-xs text-foreground/60 transition-colors duration-150 hover:text-foreground">
                      Forgot?
                    </a>
                  }
                />
                {error && (
                  <p role="alert" className="text-center text-xs text-foreground/80">
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="mt-1 h-11 cursor-pointer rounded-full bg-foreground text-sm font-medium text-background shadow-[0_10px_24px_-10px_oklch(0_0_0/55%),inset_0_1px_0_oklch(1_0_0/20%)] transition-[scale] duration-150 ease-out motion-reduce:transition-none outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground/50 motion-safe:enabled:active:scale-[0.98]"
                >
                  <SubmitLabel loading={status === "loading"}>Sign in</SubmitLabel>
                </button>
              </form>

              <p className="mt-6 text-center text-[13px] text-foreground/65">
                New here?{" "}
                <a href="#" className="text-foreground transition-opacity duration-150 hover:opacity-80">
                  Create an account
                </a>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </LiquidGlass>
    </div>
  )
}
