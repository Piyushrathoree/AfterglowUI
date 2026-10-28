"use client"

import * as React from "react"
import { Mail } from "lucide-react"
import { AnimateIcon } from "@/components/animate-ui/icons/icon"
import { ArrowLeft } from "@/components/animate-ui/icons/arrow-left"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import {
  AfterglowMark,
  GitHubMark,
  GoogleMark,
  SubmitLabel,
  checkEmail,
  useSubmit,
  type Provider,
} from "@/components/ui/auth-parts"
import { LiquidMetal, MetalRim } from "@/components/ui/liquid-metal"
import { MetalButton } from "@/components/ui/metal-button"
import { cn } from "@/lib/utils"

type AuthSilkProps = {
  /** sends the magic link; throw to show an error under the field */
  onSubmit?: (values: { email: string }) => Promise<void> | void
  onProvider?: (provider: Provider) => void
  className?: string
}

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"

const quiet =
  "inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-white/[0.08] bg-white/[0.04] text-[13px] font-medium text-white/90 shadow-[inset_0_1px_0_oklch(1_0_0/5%)] transition-[background-color,border-color,scale] duration-150 ease-out motion-reduce:transition-none outline-none hover:border-white/[0.14] hover:bg-white/[0.07] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40 motion-safe:active:scale-[0.98] [&_svg]:size-4"

// black, with satin drapes of liquid metal in two corners and one quiet column
export function AuthSilk({ onSubmit, onProvider, className }: AuthSilkProps) {
  const reduceMotion = useReducedMotion()
  const id = React.useId()
  const [email, setEmail] = React.useState("")
  const [emailError, setEmailError] = React.useState<string>()
  const [returning, setReturning] = React.useState(false)
  const { status, error, run, reset } = useSubmit(onSubmit)
  const problem = emailError ?? error

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const next = checkEmail(email)
    setEmailError(next)
    if (!next) run({ email: email.trim() })
  }

  // the resting state is the same either way, so server and client agree
  const swap = {
    initial: reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, filter: "blur(4px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    exit: reduceMotion
      ? { opacity: 0, transition: { duration: 0.12 } }
      : { opacity: 0, y: -6, filter: "blur(4px)", transition: { duration: 0.12 } },
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const },
  }

  return (
    <div
      className={cn(
        "dark relative isolate flex min-h-[44rem] w-full items-center justify-center overflow-hidden bg-[oklch(0.08_0.002_285)] px-6 py-20 text-white",
        className
      )}
    >
      <Drapes />

      <div className="w-full max-w-[21rem]">
        <AnimatePresence mode="wait" initial={false}>
          {status === "done" ? (
            <motion.div key="sent" className="flex flex-col items-center text-center" {...swap}>
              <Tile>
                <Mail />
              </Tile>
              <h1 className="mt-6 text-[22px] font-medium tracking-[-0.02em]">Check your email</h1>
              <p className="mt-2 text-[13px] leading-relaxed text-white/50">
                We sent a sign-in link to
                <br />
                <span className="text-white/90">{email.trim()}</span>
              </p>
              <div className="mt-8 grid w-full grid-cols-2 gap-2.5">
                <a href="https://mail.google.com" target="_blank" rel="noreferrer" className={quiet}>
                  Open Gmail
                </a>
                <a href="https://outlook.live.com" target="_blank" rel="noreferrer" className={quiet}>
                  Open Outlook
                </a>
              </div>
              <AnimateIcon animateOnHover asChild>
                <button
                  type="button"
                  onClick={() => {
                    setReturning(true)
                    reset()
                  }}
                  className="mt-6 inline-flex cursor-pointer items-center gap-1.5 rounded text-[13px] text-white/50 transition-colors duration-150 outline-none hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40"
                >
                  <ArrowLeft aria-hidden className="size-3.5" />
                  Use a different email
                </button>
              </AnimateIcon>
            </motion.div>
          ) : (
            <motion.div key="form" className="flex flex-col" {...swap}>
              <div className="flex flex-col items-center text-center">
                <Tile>
                  <AfterglowMark />
                </Tile>
                <h1 className="mt-6 text-[22px] font-medium tracking-[-0.02em]">Log in to Afterglow</h1>
                <p className="mt-2 text-[13px] text-white/50">
                  Don&rsquo;t have an account?{" "}
                  <a href="#" className="text-white/90 transition-colors duration-150 hover:text-white">
                    Sign up
                  </a>
                </p>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-2.5">
                <button type="button" className={quiet} onClick={() => onProvider?.("google")}>
                  <GoogleMark mono />
                  Google
                </button>
                <button type="button" className={quiet} onClick={() => onProvider?.("github")}>
                  <GitHubMark />
                  GitHub
                </button>
              </div>

              <div className="my-6 flex items-center gap-3 text-xs text-white/35">
                <span className="h-px flex-1 bg-linear-to-r from-transparent to-white/12" />
                or
                <span className="h-px flex-1 bg-linear-to-l from-transparent to-white/12" />
              </div>

              <form noValidate onSubmit={handleSubmit} className="flex flex-col">
                <label htmlFor={`${id}-email`} className="text-[13px] text-white/60">
                  Email
                </label>
                <input
                  id={`${id}-email`}
                  type="email"
                  autoComplete="email"
                  spellCheck={false}
                  autoFocus={returning}
                  placeholder="you@company.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  aria-invalid={problem ? true : undefined}
                  aria-describedby={problem ? `${id}-error` : undefined}
                  className="mt-2 h-10 rounded-[10px] border border-white/10 bg-black/50 px-3 text-sm text-white shadow-[inset_0_1px_2px_oklch(0_0_0/60%)] transition-[border-color,box-shadow] duration-150 outline-none placeholder:text-white/25 focus:border-white/25 focus:ring-4 focus:ring-white/[0.06] aria-invalid:border-[oklch(0.7_0.15_25/55%)]"
                />
                <AnimatePresence initial={false}>
                  {problem && (
                    <motion.p
                      id={`${id}-error`}
                      className="text-xs text-[oklch(0.76_0.13_25)]"
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: "auto", marginTop: 8 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      {problem}
                    </motion.p>
                  )}
                </AnimatePresence>
                <MetalButton
                  type="submit"
                  className="mt-4 w-full rounded-[10px] disabled:opacity-100"
                  disabled={status === "loading"}
                >
                  <SubmitLabel loading={status === "loading"}>Continue with email</SubmitLabel>
                </MetalButton>
              </form>

              <p className="mt-8 text-center text-xs leading-relaxed text-white/35">
                By continuing, you agree to our{" "}
                <a href="#" className="underline decoration-white/20 underline-offset-2 hover:text-white/60">
                  Terms
                </a>{" "}
                and{" "}
                <a href="#" className="underline decoration-white/20 underline-offset-2 hover:text-white/60">
                  Privacy Policy
                </a>
                .
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// a dark tile edged in moving chrome, for the logo and the inbox icon
function Tile({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative isolate grid size-12 place-items-center rounded-[14px] bg-[linear-gradient(oklch(0.22_0.004_285),oklch(0.11_0.004_285))] text-white/90 shadow-[0_10px_24px_-8px_oklch(0_0_0/90%),inset_0_1px_0_oklch(1_0_0/10%)] [&_svg]:size-6">
      <MetalRim className="-z-10" />
      {children}
    </span>
  )
}

function Drapes() {
  return (
    <div aria-hidden className="absolute inset-0 -z-10">
      {/* one sheet of satin metal, folded into long diagonals, showing only at two corners */}
      <div className="absolute inset-0 mask-[linear-gradient(62deg,#000_2%,transparent_36%,transparent_64%,#000_98%)]">
        <LiquidMetal pattern="silk" softness={0.6} brightness={-0.24} scale={0.8} tint={[1, 1, 1]} speed={0.5} quality={0.6} />
      </div>
      {/* a pool of black behind the column, so text always sits on dark */}
      <div className="absolute inset-0 bg-[radial-gradient(30%_46%_at_50%_50%,oklch(0.08_0.002_285)_40%,transparent)]" />
      <div className="absolute inset-0 opacity-[0.07] mix-blend-overlay" style={{ backgroundImage: GRAIN }} />
    </div>
  )
}
