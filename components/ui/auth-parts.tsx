"use client"

import * as React from "react"
import { Eye, EyeOff, Fingerprint, KeyRound, Loader2 } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

/* Shared pieces for the auth blocks: brand marks, provider buttons, fields,
   a divider and a small hook that runs a submit with loading and error states. */

function GoogleMark({ mono = false, ...props }: React.ComponentProps<"svg"> & { mono?: boolean }) {
  // mono draws the G in the current text color, for quiet monochrome buttons
  const fill = (color: string) => (mono ? "currentColor" : color)
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...props}>
      <path fill={fill("#4285F4")} d="M23.5 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.57-5.17 3.57-8.81Z" />
      <path fill={fill("#34A853")} d="M12 24c3.24 0 5.96-1.07 7.94-2.92l-3.88-3c-1.07.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.95H1.28v3.1A12 12 0 0 0 12 24Z" />
      <path fill={fill("#FBBC05")} d="M5.29 14.28a7.2 7.2 0 0 1 0-4.56v-3.1H1.28a12 12 0 0 0 0 10.76l4.01-3.1Z" />
      <path fill={fill("#EA4335")} d="M12 4.77c1.76 0 3.34.61 4.59 1.8l3.44-3.44A11.97 11.97 0 0 0 12 0 12 12 0 0 0 1.28 6.62l4.01 3.1C6.23 6.88 8.88 4.77 12 4.77Z" />
    </svg>
  )
}

// the afterglow mark: a sun setting on the horizon, centered in its 24px box
function AfterglowMark(props: React.ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...props}>
      <path d="M5.5 12a6.5 6.5 0 0 1 13 0Z" fill="currentColor" />
      <path d="M3 15h18M7.5 18h9" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function GitHubMark(props: React.ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden fill="currentColor" {...props}>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  )
}

const providers = {
  google: { label: "Google", icon: <GoogleMark /> },
  github: { label: "GitHub", icon: <GitHubMark /> },
  sso: { label: "SSO", icon: <KeyRound /> },
  passkey: { label: "passkey", icon: <Fingerprint /> },
}

type Provider = keyof typeof providers

type ProviderButtonProps = Omit<React.ComponentProps<"button">, "children"> & {
  provider: Provider
  /** "Continue with", "Log in with"… */
  verb?: string
  /** a small "Last used" badge in the corner */
  lastUsed?: boolean
}

function ProviderButton({
  provider,
  verb = "Continue with",
  lastUsed,
  className,
  type = "button",
  ...props
}: ProviderButtonProps) {
  const { label, icon } = providers[provider]
  return (
    <button
      type={type}
      className={cn(
        "relative inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2.5 rounded-lg border bg-background/60 px-4 text-sm font-medium transition-[background-color,scale] duration-150 ease-out outline-none hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring enabled:active:scale-[0.98] disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
        className
      )}
      {...props}
    >
      {icon}
      <span>{verb ? `${verb} ${label}` : label}</span>
      {lastUsed && (
        <span className="absolute -top-2 right-2 rounded-full border bg-card px-1.5 py-px text-[10px] font-medium text-muted-foreground">
          Last used
        </span>
      )}
    </button>
  )
}

function Divider({ children = "or", className }: { children?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 text-xs text-muted-foreground", className)}>
      <span className="h-px flex-1 bg-border" />
      {children}
      <span className="h-px flex-1 bg-border" />
    </div>
  )
}

type FieldProps = Omit<React.ComponentProps<"input">, "size"> & {
  label: string
  /** shown under the field and announced by screen readers */
  error?: string
  /** a link or action placed at the end of the label row, e.g. "Forgot?" */
  aside?: React.ReactNode
  /** classes for the input's box, so each theme can style it */
  boxClassName?: string
  labelClassName?: string
}

function Field({
  label,
  error,
  aside,
  type = "text",
  className,
  boxClassName,
  labelClassName,
  id,
  ...props
}: FieldProps) {
  const autoId = React.useId()
  const inputId = id ?? autoId
  const errorId = `${inputId}-error`
  const [reveal, setReveal] = React.useState(false)
  const password = type === "password"

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-center justify-between">
        <label htmlFor={inputId} className={cn("text-sm font-medium", labelClassName)}>
          {label}
        </label>
        {aside}
      </div>
      <div
        className={cn(
          "flex h-10 items-center rounded-lg border bg-background/60 px-3 transition-[border-color,box-shadow] duration-150 focus-within:border-foreground/40 focus-within:ring-3 focus-within:ring-foreground/10",
          error && "border-glow-2/70 focus-within:border-glow-2 focus-within:ring-glow-2/15",
          boxClassName
        )}
      >
        <input
          id={inputId}
          type={password && reveal ? "text" : type}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/70"
          {...props}
        />
        {password && (
          <button
            type="button"
            aria-label={reveal ? "Hide password" : "Show password"}
            aria-pressed={reveal}
            onClick={() => setReveal((v) => !v)}
            className="-mr-1 grid size-7 cursor-pointer place-items-center rounded-md text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60 [&_svg]:size-4"
          >
            {reveal ? <EyeOff /> : <Eye />}
          </button>
        )}
      </div>
      <AnimatePresence initial={false}>
        {error && (
          <motion.p
            id={errorId}
            className="text-xs text-glow-2"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

type Status = "idle" | "loading" | "done"

/**
 * Runs an async submit with loading and error states. The block calls
 * `run(values)`; your `onSubmit` does the real work and throws to show an error.
 */
function useSubmit<T>(onSubmit?: (values: T) => Promise<void> | void) {
  const [status, setStatus] = React.useState<Status>("idle")
  const [error, setError] = React.useState<string>()

  async function run(values: T) {
    setError(undefined)
    setStatus("loading")
    try {
      await onSubmit?.(values)
      setStatus("done")
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Something went wrong. Try again.")
      setStatus("idle")
    }
  }

  return { status, error, setError, run, reset: () => setStatus("idle") }
}

// a label that swaps to a spinner while the form is busy
function SubmitLabel({ loading, children }: { loading: boolean; children: React.ReactNode }) {
  const reduceMotion = useReducedMotion()
  return (
    <span className="grid place-items-center">
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={loading ? "loading" : "label"}
          className="col-start-1 row-start-1 inline-flex items-center gap-2"
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.25, filter: "blur(4px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.25, filter: "blur(4px)" }}
          transition={{ type: "spring", duration: 0.3, bounce: 0 }}
        >
          {loading ? <Loader2 className="size-4 animate-spin" aria-label="Loading" /> : children}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function checkEmail(value: string) {
  if (!value.trim()) return "Enter your email address."
  if (!EMAIL.test(value.trim())) return "That doesn't look like an email address."
  return undefined
}

export {
  AfterglowMark,
  Divider,
  Field,
  GitHubMark,
  GoogleMark,
  ProviderButton,
  SubmitLabel,
  checkEmail,
  useSubmit,
  type FieldProps,
  type Provider,
  type ProviderButtonProps,
}
