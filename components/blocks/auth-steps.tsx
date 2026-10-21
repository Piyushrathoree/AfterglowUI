"use client"

import * as React from "react"
import { CornerDownLeft, KeyRound, Mail } from "lucide-react"
import { AnimateIcon } from "@/components/animate-ui/icons/icon"
import { ArrowLeft } from "@/components/animate-ui/icons/arrow-left"
import { Fingerprint } from "@/components/animate-ui/icons/fingerprint"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { AfterglowMark, GoogleMark, SubmitLabel, checkEmail, useSubmit, type Provider } from "@/components/ui/auth-parts"
import { cn } from "@/lib/utils"

type Step = "choose" | "email" | "sent"

type AuthStepsProps = {
  onSubmit?: (values: { email: string }) => Promise<void> | void
  onProvider?: (provider: Provider) => void
  className?: string
}

const pill =
  "inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2.5 rounded-full text-[13px] font-medium outline-none transition-[background-color,border-color,scale] duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground/40 enabled:active:scale-[0.98] [&_svg]:size-4"

// the quiet choices: a hairline pill that fills in on hover
const outline = "border bg-transparent hover:border-foreground/20 hover:bg-muted/60"

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border bg-muted px-1 font-sans text-[11px] text-muted-foreground">
      {children}
    </kbd>
  )
}

// one question per screen: how do you sign in, what's your email, check your inbox
export function AuthSteps({ onSubmit, onProvider, className }: AuthStepsProps) {
  const reduceMotion = useReducedMotion()
  const id = React.useId()
  const [step, setStep] = React.useState<Step>("choose")
  const [direction, setDirection] = React.useState(1)
  const [email, setEmail] = React.useState("")
  const [emailError, setEmailError] = React.useState<string>()
  const { status, error, run } = useSubmit(async (values: { email: string }) => {
    await onSubmit?.(values)
    go("sent")
  })

  function go(next: Step) {
    const order: Step[] = ["choose", "email", "sent"]
    setDirection(order.indexOf(next) >= order.indexOf(step) ? 1 : -1)
    setStep(next)
  }

  // Escape steps back, like closing a sheet
  React.useEffect(() => {
    if (step === "choose") return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") go(step === "sent" ? "email" : "choose")
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  })

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const problem = checkEmail(email)
    setEmailError(problem)
    if (!problem) run({ email })
  }

  // the resting state is identical either way, so server and client agree
  const slide = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1, x: 0, filter: "blur(0px)" }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, x: 24 * direction, filter: "blur(4px)" },
        animate: { opacity: 1, x: 0, filter: "blur(0px)" },
        exit: { opacity: 0, x: -16 * direction, filter: "blur(4px)", transition: { duration: 0.12 } },
      }

  const problem = emailError ?? error

  return (
    <div
      className={cn(
        "relative flex min-h-[44rem] w-full flex-col items-center justify-center bg-background px-4 py-16 text-foreground",
        className
      )}
    >
      <div className="w-full max-w-[20rem]">
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          {step === "choose" && (
            <motion.div key="choose" className="flex flex-col items-center gap-8" transition={{ duration: 0.2, ease: "easeOut" }} {...slide}>
              <div className="flex flex-col items-center gap-5 text-center">
                <span className="grid size-11 place-items-center rounded-[13px] bg-foreground text-background shadow-[inset_0_1px_0_oklch(1_0_0/15%),0_6px_16px_-6px_oklch(0_0_0/40%)] [&_svg]:size-6">
                  <AfterglowMark />
                </span>
                <h1 className="text-[22px] font-medium tracking-[-0.02em]">Log in to Afterglow</h1>
              </div>
              <div className="flex w-full flex-col gap-2.5">
                <button type="button" className={cn(pill, "bg-foreground text-background hover:bg-foreground/90")} onClick={() => onProvider?.("google")}>
                  <GoogleMark mono />
                  Continue with Google
                  <span className="ml-0.5 rounded-full bg-background/15 px-1.5 py-px text-[10px] font-normal">Last used</span>
                </button>
                <button type="button" className={cn(pill, outline)} onClick={() => go("email")}>
                  <Mail />
                  Continue with email
                </button>
                <button type="button" className={cn(pill, outline)} onClick={() => onProvider?.("sso")}>
                  <KeyRound />
                  Continue with SAML SSO
                </button>
                <AnimateIcon animateOnHover asChild>
                  <button type="button" className={cn(pill, outline)} onClick={() => onProvider?.("passkey")}>
                    <Fingerprint aria-hidden />
                    Log in with a passkey
                  </button>
                </AnimateIcon>
              </div>
              <p className="text-[13px] text-muted-foreground">
                Don&rsquo;t have an account?{" "}
                <a href="#" className="text-foreground hover:underline">
                  Sign up
                </a>
              </p>
            </motion.div>
          )}

          {step === "email" && (
            <motion.div key="email" className="flex flex-col gap-6" transition={{ duration: 0.2, ease: "easeOut" }} {...slide}>
              <h1 className="text-center text-[22px] font-medium tracking-[-0.02em]">What&rsquo;s your email address?</h1>
              <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-3">
                <label htmlFor={`${id}-email`} className="sr-only">
                  Email
                </label>
                <div
                  className={cn(
                    "flex h-10 items-center rounded-full border bg-background px-4 transition-[border-color,box-shadow] duration-150 focus-within:border-foreground/30 focus-within:ring-4 focus-within:ring-foreground/[0.06]",
                    problem && "border-[oklch(0.65_0.18_25/60%)]"
                  )}
                >
                  <input
                    // the step mounts after the last one leaves, so focus on mount
                    autoFocus
                    id={`${id}-email`}
                    type="email"
                    autoComplete="email"
                    placeholder="Enter your email address…"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    aria-invalid={problem ? true : undefined}
                    aria-describedby={problem ? `${id}-error` : undefined}
                    className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/70"
                  />
                  <Kbd>
                    <CornerDownLeft className="size-3" />
                  </Kbd>
                </div>
                {problem && (
                  <p id={`${id}-error`} className="px-4 text-xs text-[oklch(0.65_0.18_25)]">
                    {problem}
                  </p>
                )}
                <button type="submit" disabled={status === "loading"} className={cn(pill, "bg-foreground text-background")}>
                  <SubmitLabel loading={status === "loading"}>Continue with email</SubmitLabel>
                </button>
              </form>
              <AnimateIcon animateOnHover asChild>
                <button type="button" onClick={() => go("choose")} className="inline-flex cursor-pointer items-center justify-center gap-2 rounded text-[13px] text-muted-foreground transition-colors duration-150 outline-none hover:text-foreground focus-visible:outline-2 focus-visible:outline-foreground/40">
                  <ArrowLeft aria-hidden className="size-3.5" />
                  Back to login
                  <Kbd>Esc</Kbd>
                </button>
              </AnimateIcon>
            </motion.div>
          )}

          {step === "sent" && (
            <motion.div key="sent" className="flex flex-col items-center gap-5 text-center" transition={{ duration: 0.2, ease: "easeOut" }} {...slide}>
              <h1 className="text-[22px] font-medium tracking-[-0.02em]">Check your inbox</h1>
              <p className="text-[13px] leading-relaxed text-muted-foreground">
                We sent a link to <span className="text-foreground">{email}</span>. Open it on this device to finish signing in.
              </p>
              <button type="button" onClick={() => go("email")} className={cn(pill, outline)}>
                Use a different email
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
