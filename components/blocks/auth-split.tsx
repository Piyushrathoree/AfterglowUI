"use client"

import * as React from "react"
import { AnimateIcon } from "@/components/animate-ui/icons/icon"
import { ArrowLeft } from "@/components/animate-ui/icons/arrow-left"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import {
  AfterglowMark,
  Field,
  ProviderButton,
  SubmitLabel,
  checkEmail,
  useSubmit,
  type Provider,
} from "@/components/ui/auth-parts"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import { LiquidMetal } from "@/components/ui/liquid-metal"
import { cn } from "@/lib/utils"

type Story = { company: string; quote: string; person: string }

const defaultStories: Story[] = [
  {
    company: "Northwind",
    quote: "We rebuilt onboarding in a week, and sign-ups went up 38%.",
    person: "Lena Park, Head of Growth",
  },
  {
    company: "Halcyon",
    quote: "Our team ships the same polish without a single design review.",
    person: "Omar Reyes, CTO",
  },
  {
    company: "Quill",
    quote: "It feels like the product finally matches the brand.",
    person: "Iris Novak, Founder",
  },
]

const STORY_MS = 6000

type AuthSplitProps = {
  /** sends the magic link; throw to show an error under the field */
  onSubmit?: (values: { email: string }) => Promise<void> | void
  onProvider?: (provider: Provider) => void
  stories?: Story[]
  className?: string
}

const primary =
  "inline-flex h-10 w-full cursor-pointer items-center justify-center rounded-[10px] bg-foreground text-[13px] font-medium text-background shadow-[inset_0_1px_0_oklch(1_0_0/12%),0_1px_2px_oklch(0_0_0/20%)] transition-[background-color,scale] duration-150 ease-out motion-reduce:transition-none outline-none hover:bg-foreground/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground/40 motion-safe:active:scale-[0.98]"

const secondary = "h-10 rounded-[10px] bg-transparent text-[13px] hover:bg-muted/60"

// email first on the left; on the right, customer stories in glass over graphite silk
export function AuthSplit({ onSubmit, onProvider, stories = defaultStories, className }: AuthSplitProps) {
  const reduceMotion = useReducedMotion()
  const [email, setEmail] = React.useState("")
  const [emailError, setEmailError] = React.useState<string>()
  const { status, error, run, reset } = useSubmit(onSubmit)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const next = checkEmail(email)
    setEmailError(next)
    if (!next) run({ email: email.trim() })
  }

  const swap = {
    initial: reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, transition: { duration: 0.12 } },
    transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] as const },
  }

  return (
    <div className="@container w-full min-w-0"><div className={cn("grid min-h-[44rem] w-full min-w-0 bg-background text-foreground @min-[880px]:grid-cols-2", className)}>
      <div className="flex flex-col items-center justify-between gap-10 px-6 py-10">
        <span className="inline-flex items-center gap-2 text-[15px] font-medium tracking-[-0.01em] [&_svg]:size-5">
          <AfterglowMark />
          Afterglow
        </span>

        <div className="w-full max-w-[20rem]">
          <AnimatePresence mode="wait" initial={false}>
            {status === "done" ? (
              <motion.div key="sent" className="flex flex-col items-center text-center" {...swap}>
                <h1 className="text-[22px] font-medium tracking-[-0.02em]">Check your email</h1>
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                  We sent a sign-in link to <span className="text-foreground">{email.trim()}</span>.
                </p>
                <div className="mt-7 grid w-full grid-cols-2 gap-2">
                  <a href="https://mail.google.com" target="_blank" rel="noreferrer" className={cn(primary, "bg-muted text-foreground shadow-none hover:bg-muted/70")}>
                    Open Gmail
                  </a>
                  <a href="https://outlook.live.com" target="_blank" rel="noreferrer" className={cn(primary, "bg-muted text-foreground shadow-none hover:bg-muted/70")}>
                    Open Outlook
                  </a>
                </div>
                <AnimateIcon animateOnHover asChild>
                  <button
                    type="button"
                    onClick={reset}
                    className="mt-6 inline-flex cursor-pointer items-center gap-1.5 rounded text-[13px] text-muted-foreground transition-colors duration-150 outline-none hover:text-foreground focus-visible:outline-2 focus-visible:outline-foreground/40"
                  >
                    <ArrowLeft aria-hidden className="size-3.5" />
                    Use a different email
                  </button>
                </AnimateIcon>
              </motion.div>
            ) : (
              <motion.div key="form" className="flex flex-col" {...swap}>
                <h1 className="text-center text-[22px] font-medium tracking-[-0.02em]">Log in to Afterglow</h1>
                <form noValidate onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3">
                  <Field
                    label="Work email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    error={emailError ?? error}
                    boxClassName="rounded-[10px] bg-background focus-within:border-foreground/30 focus-within:ring-4 focus-within:ring-foreground/[0.06]"
                    labelClassName="text-[13px]"
                  />
                  <button type="submit" disabled={status === "loading"} className={primary}>
                    <SubmitLabel loading={status === "loading"}>Continue with email</SubmitLabel>
                  </button>
                </form>
                <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="h-px flex-1 bg-border" />
                  or
                  <span className="h-px flex-1 bg-border" />
                </div>
                <div className="flex flex-col gap-2">
                  <ProviderButton provider="google" className={secondary} onClick={() => onProvider?.("google")} />
                  <ProviderButton provider="github" className={secondary} onClick={() => onProvider?.("github")} />
                  <ProviderButton provider="sso" verb="Continue with SAML" className={secondary} onClick={() => onProvider?.("sso")} />
                </div>
                <p className="mt-7 text-center text-[13px] text-muted-foreground">
                  Don&rsquo;t have an account?{" "}
                  <a href="#" className="text-foreground transition-opacity duration-150 hover:opacity-70">
                    Sign up
                  </a>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          By continuing, you agree to our{" "}
          <a href="#" className="underline decoration-border underline-offset-2 hover:text-foreground">Terms</a> and{" "}
          <a href="#" className="underline decoration-border underline-offset-2 hover:text-foreground">Privacy Policy</a>.
        </p>
      </div>

      <StoryPanel stories={stories} />
    </div></div>
  )
}

function StoryPanel({ stories }: { stories: Story[] }) {
  const reduceMotion = useReducedMotion()
  const [index, setIndex] = React.useState(0)
  const [paused, setPaused] = React.useState(false)
  const story = stories[index]

  return (
    <div className="dark relative isolate m-3 hidden overflow-hidden rounded-[22px] bg-[oklch(0.1_0.002_285)] text-white @min-[880px]:block">
      <LiquidMetal pattern="silk" softness={0.7} brightness={-0.22} scale={0.7} tint={[1, 1, 1]} speed={0.4} quality={0.6} />
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,oklch(0_0_0/55%))]" />

      <div className="absolute inset-x-6 bottom-6">
        <LiquidGlass
          className="rounded-[22px] p-6"
          bezel={22}
          frost={6}
          tint="oklch(0.12 0.003 285 / 45%)"
          onPointerEnter={() => setPaused(true)}
          onPointerLeave={() => setPaused(false)}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.figure
              key={story.company}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <p className="text-xs font-medium tracking-[0.14em] text-white/55 uppercase">{story.company}</p>
              <blockquote className="mt-3 text-[17px] leading-snug font-medium tracking-[-0.01em] text-balance">
                &ldquo;{story.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-3 text-[13px] text-white/55">{story.person}</figcaption>
            </motion.figure>
          </AnimatePresence>
          <div className="mt-5 flex gap-1.5">
            {stories.map((item, i) => (
              <button
                key={item.company}
                type="button"
                aria-label={`Show ${item.company}'s story`}
                aria-current={i === index}
                onClick={() => setIndex(i)}
                className="relative h-1 flex-1 cursor-pointer overflow-hidden rounded-full bg-white/20 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60"
              >
                {i < index && <span className="absolute inset-0 bg-white/90" />}
                {i === index && (
                  <Progress
                    key={index}
                    paused={paused}
                    still={!!reduceMotion}
                    onDone={() => setIndex((index + 1) % stories.length)}
                  />
                )}
              </button>
            ))}
          </div>
        </LiquidGlass>
      </div>
    </div>
  )
}

// fills over the story's time; pausing freezes it mid-way, and finishing moves on
function Progress({ paused, still, onDone }: { paused: boolean; still: boolean; onDone: () => void }) {
  const ref = React.useRef<HTMLSpanElement>(null)
  const animation = React.useRef<Animation | null>(null)
  // the latest onDone, read when the bar finishes
  const done = React.useRef(onDone)
  React.useEffect(() => {
    done.current = onDone
  })

  React.useEffect(() => {
    const node = ref.current
    if (!node) return
    // under reduced motion the timer never runs, so show the bar full
    if (still) {
      node.style.transform = "none"
      return
    }
    const fill = node.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], {
      duration: STORY_MS,
      easing: "linear",
      fill: "forwards",
    })
    fill.onfinish = () => done.current()
    animation.current = fill
    return () => fill.cancel()
  }, [still])

  React.useEffect(() => {
    if (paused) animation.current?.pause()
    else animation.current?.play()
  }, [paused])

  return <span ref={ref} className="absolute inset-0 origin-left bg-white/90" style={{ transform: "scaleX(0)" }} />
}
