"use client"

import * as React from "react"
import {
  Aperture,
  Compass,
  Mail,
  MessageCircle,
  Music,
  NotebookPen,
  SquareTerminal,
  Trash2,
  Settings2,
  LoaderCircle,
  Eye,
  EyeOff,
  Check,
  RotateCw,
  Bell,
  CreditCard,
  Settings,
  Users,
  KeyRound,
} from "lucide-react"
import { AnimatePresence, inView, motion, useReducedMotion } from "motion/react"


import { BorderBeam } from "@/components/ui/border-beam"
import { AccentPicker } from "@/components/ui/accent-picker"
import { CopyButton } from "@/components/ui/copy-button"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import { GlassSwitch } from "@/components/ui/glass-switch"
import { MagneticDock } from "@/components/ui/magnetic-dock"
import { TrailTabs } from "@/components/ui/trail-tabs"

// panes that hold text use Apple's "regular" glass: more frost and a light tint, so copy
// stays readable. clear glass is for controls
const readable = "color-mix(in oklch, var(--card) 50%, transparent)"

// a deploy: the beam circles while it runs, then fades out slowly once it's live
const steps = [
  { label: "Queued", at: 0 },
  { label: "Building", at: 700 },
  { label: "Deploying", at: 3600 },
  { label: "Ready", at: 5000 },
]

const clock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`

export function DeployDemo() {
  const ref = React.useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()
  const [run, setRun] = React.useState(0)
  const [step, setStep] = React.useState(0)
  const [seconds, setSeconds] = React.useState(0)
  const done = step === steps.length - 1

  function start() {
    setStep(0)
    setSeconds(0)
    setRun((count) => count + 1)
  }

  // the first run starts when the card scrolls into view, so it isn't over before you see it
  React.useEffect(() => {
    if (!ref.current) return
    const stop = inView(
      ref.current,
      () => {
        start()
        stop()
      },
      { amount: 0.6 }
    )
    return stop
  }, [])

  React.useEffect(() => {
    if (!run) return
    const started = Date.now()
    const timers = steps.slice(1).map((s, i) => window.setTimeout(() => setStep(i + 1), s.at))
    const tick = window.setInterval(() => {
      setSeconds(Math.min(Math.floor((Date.now() - started) / 1000), steps.at(-1)!.at / 1000))
    }, 250)
    timers.push(window.setTimeout(() => window.clearInterval(tick), steps.at(-1)!.at))
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer))
      window.clearInterval(tick)
    }
  }, [run])

  // labels and icons trade places with a short blur, no bounce
  const swap = {
    initial: { opacity: 0, y: reduceMotion ? 0 : 6, filter: reduceMotion ? "blur(0px)" : "blur(2px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    exit: {
      opacity: 0,
      y: reduceMotion ? 0 : -6,
      filter: reduceMotion ? "blur(0px)" : "blur(2px)",
      transition: { duration: 0.12 },
    },
    transition: { type: "spring", visualDuration: 0.3, bounce: 0 },
  } as const

  return (
    <div ref={ref} className="relative w-full max-w-md rounded-[28px]">
      {/* a 28px pane of liquid glass */}
      <LiquidGlass className="rounded-[28px] p-5 text-foreground" bezel={28} frost={10} tint={readable}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[13px] font-medium" aria-live="polite">
          <span className="relative grid size-4 place-items-center">
            <AnimatePresence initial={false} mode="popLayout">
              {done ? (
                <motion.span key="done" className="grid place-items-center" {...swap}>
                  <Check className="size-4 text-glow" />
                </motion.span>
              ) : (
                <motion.span key="busy" className="size-1.5 rounded-full bg-glow" {...swap} />
              )}
            </AnimatePresence>
          </span>
          <span className="relative grid">
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span key={steps[step].label} {...swap}>
                {steps[step].label}
              </motion.span>
            </AnimatePresence>
          </span>
        </div>
        <span className="font-mono text-[13px] text-foreground/60 tabular-nums">{clock(seconds)}</span>
      </div>

      <p className="mt-5 text-[15px] font-medium">afterglow-ui</p>
      <p className="mt-1 font-mono text-xs text-foreground/60">main · 4f2a9c1</p>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-foreground/10 pt-4">
        <p className="truncate text-[13px] text-foreground/60">Tune the glow springs</p>
        <button
          type="button"
          onClick={start}
          disabled={!done}
          className="inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-foreground/10 bg-foreground/[0.06] pr-3 pl-2.5 text-[13px] font-medium transition-[background-color,opacity,scale] duration-150 ease-out outline-none hover:bg-foreground/[0.11] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40"
        >
          {/* the arrow makes one full turn each time a deploy starts */}
          <motion.span
            aria-hidden
            className="grid place-items-center"
            initial={false}
            animate={{ rotate: reduceMotion ? 0 : run * 360 }}
            transition={{ type: "spring", visualDuration: 0.6, bounce: 0 }}
          >
            <RotateCw className="size-3.5" />
          </motion.span>
          Redeploy
        </button>
      </div>
      </LiquidGlass>
      <BorderBeam active={!done} className="rounded-[28px]" />
    </div>
  )
}

const installCommand = "npx shadcn add @afterglow/copy-button"

const secret = { prefix: "ag_live_", middle: "7Hq2Lx9WmR4k", suffix: "3f9a" }
const glyphs = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789"
const masked = "•".repeat(secret.middle.length)

// the small capsule both buttons share: 32px tall, concentric in a 48px row with 8px of padding
const capsule =
  "inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-foreground/[0.07] text-foreground outline-none transition-[background-color,scale] duration-150 ease-out hover:bg-foreground/[0.12] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.97] [&_svg]:size-3.5"

export function CopyDemo() {
  const reduceMotion = useReducedMotion()
  const [sweep, setSweep] = React.useState(0)
  const [revealed, setRevealed] = React.useState(false)
  const [middle, setMiddle] = React.useState(masked)
  const frame = React.useRef(0)

  React.useEffect(() => () => cancelAnimationFrame(frame.current), [])

  // reveal decodes the key left to right out of random characters; hide scrambles it back
  function toggleReveal() {
    const next = !revealed
    setRevealed(next)
    cancelAnimationFrame(frame.current)
    const target = next ? secret.middle : masked
    if (reduceMotion) {
      setMiddle(target)
      return
    }
    const duration = next ? 520 : 300
    const started = performance.now()
    const tick = (now: number) => {
      const progress = Math.min((now - started) / duration, 1)
      const settled = Math.floor(progress * target.length)
      setMiddle(
        Array.from(target, (char, i) =>
          i < settled ? char : glyphs[Math.floor(Math.random() * glyphs.length)]
        ).join("")
      )
      if (progress < 1) frame.current = requestAnimationFrame(tick)
    }
    frame.current = requestAnimationFrame(tick)
  }

  return (
    <div className="flex w-full max-w-md min-w-0 flex-col gap-3">
      {/* install: one capsule. copying sends a streak of light along the command */}
      <div className="flex h-12 items-center gap-2 rounded-full p-2 pl-5 bg-glass shadow-glass backdrop-blur-xl backdrop-saturate-150">
        <span className="font-mono text-[13px] text-foreground/45 select-none">$</span>
        <code className="relative min-w-0 flex-1 truncate font-mono text-[13px]">
          {installCommand}
          {sweep > 0 && !reduceMotion && (
            <motion.span
              key={sweep}
              aria-hidden
              className="pointer-events-none absolute inset-0 truncate bg-clip-text bg-no-repeat text-transparent"
              style={{
                backgroundImage: "linear-gradient(90deg, transparent, var(--glow), transparent)",
                backgroundSize: "30% 100%",
              }}
              initial={{ backgroundPosition: "-40% 0", opacity: 1 }}
              animate={{ backgroundPosition: "140% 0", opacity: [1, 1, 0] }}
              transition={{ duration: 1.1, ease: "easeInOut" }}
            >
              {installCommand}
            </motion.span>
          )}
        </code>
        <CopyButton value={installCommand} tooltip showLabel onCopy={() => setSweep((count) => count + 1)} />
      </div>

      {/* a secret key: hidden until you ask, then it decodes in place */}
      <div className="flex h-12 items-center gap-3 rounded-full p-2 pl-5 bg-glass shadow-glass backdrop-blur-xl backdrop-saturate-150">
        <KeyRound className="size-4 shrink-0 text-foreground/50" />
        <p className="min-w-0 flex-1 truncate font-mono text-[13px] tabular-nums">
          <span className="text-foreground/50">{secret.prefix}</span>
          {middle}
          {secret.suffix}
        </p>
        <button
          type="button"
          aria-label={revealed ? "Hide key" : "Reveal key"}
          aria-pressed={revealed}
          onClick={toggleReveal}
          className={capsule}
        >
          <span className="grid">
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span
                key={revealed ? "hide" : "show"}
                className="grid place-items-center"
                initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.25, filter: reduceMotion ? "blur(0px)" : "blur(4px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: reduceMotion ? 1 : 0.25, filter: reduceMotion ? "blur(0px)" : "blur(4px)", transition: { duration: 0.12 } }}
                transition={{ type: "spring", duration: 0.3, bounce: 0 }}
              >
                {revealed ? <EyeOff /> : <Eye />}
              </motion.span>
            </AnimatePresence>
          </span>
        </button>
        <CopyButton value={secret.prefix + secret.middle + secret.suffix} tooltip showLabel />
      </div>
    </div>
  )
}

// saving keeps its width fixed: an invisible copy of the longest label holds the size while
// the label, a spinner and a check trade places in the middle
function SaveButton() {
  const reduceMotion = useReducedMotion()
  const [state, setState] = React.useState<"idle" | "saving" | "saved">("idle")
  const timers = React.useRef<number[]>([])

  React.useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), [])

  function save() {
    if (state !== "idle") return
    setState("saving")
    timers.current = [
      window.setTimeout(() => setState("saved"), 900),
      window.setTimeout(() => setState("idle"), 2400),
    ]
  }

  const content = (
    <span className="grid place-items-center">
      <span aria-hidden className="invisible col-start-1 row-start-1">
        Save changes
      </span>
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={state}
          className="col-start-1 row-start-1 inline-flex items-center gap-1.5"
          initial={{ opacity: 0, y: reduceMotion ? 0 : 6, filter: reduceMotion ? "blur(0px)" : "blur(3px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{
            opacity: 0,
            y: reduceMotion ? 0 : -6,
            filter: reduceMotion ? "blur(0px)" : "blur(3px)",
            transition: { duration: 0.12 },
          }}
          transition={{ type: "spring", duration: 0.3, bounce: 0 }}
        >
          {state === "saving" ? (
            <LoaderCircle aria-label="Saving" className="size-4 animate-spin" />
          ) : state === "saved" ? (
            <>
              <Check className="size-4 text-glow" />
              Saved
            </>
          ) : (
            "Save changes"
          )}
        </motion.span>
      </AnimatePresence>
    </span>
  )

  // 44px tall, the same as the tab bar in the opposite corner, so both nest in the pane's corners
  return (
    <button
      type="button"
      onClick={save}
      aria-busy={state === "saving"}
      className="inline-flex h-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-foreground/[0.08] bg-background/75 px-5 text-sm font-medium text-foreground shadow-[0_1px_2px_oklch(0_0_0/0.08)] transition-[background-color,scale] duration-150 ease-out outline-none hover:bg-background/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.97] dark:bg-foreground/[0.14] dark:hover:bg-foreground/[0.18]"
    >
      {content}
    </button>
  )
}

function Field({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  const id = React.useId()
  return (
    <div className="flex flex-col gap-2">
      {/* the label starts where the text inside the field starts */}
      <label htmlFor={id} className="pl-4 text-xs font-medium text-foreground/60">
        {label}
      </label>
      {/* 12px in from a 34px pane, so a capsule */}
      <div className="flex h-10 items-center rounded-full border border-foreground/10 bg-foreground/[0.05] px-4 text-sm transition-[border-color,box-shadow] duration-150 focus-within:border-glow/60 focus-within:ring-2 focus-within:ring-glow/20">
        <input id={id} defaultValue={value} className="min-w-0 flex-1 bg-transparent outline-none" />
        {suffix && <span className="text-foreground/50">{suffix}</span>}
      </div>
    </div>
  )
}

const members = [
  { name: "Mira Okafor", email: "mira@afterglow.dev", role: "Owner", tone: "from-glow to-glow-2" },
  { name: "Theo Laurent", email: "theo@afterglow.dev", role: "Admin", tone: "from-glow-2 to-glow-3" },
  { name: "Aiko Tan", email: "aiko@afterglow.dev", role: "Member", tone: "from-glow-3 to-glow" },
]

function Usage({ label, value, of }: { label: string; value: number; of: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between text-xs">
        <span className="font-medium">{label}</span>
        <span className="text-foreground/60 tabular-nums">
          {value}% of {of}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-foreground/10">
        <div
          className="h-full rounded-full bg-linear-to-r from-glow-2 to-glow"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}

export function TabsDemo() {
  return (
    // a 34px pane with 12px of padding, so the 44px tab capsule, the inputs and the button
    // inside (all ~22px radius) sit concentric with its corners
    <div className="@container w-full min-w-0 max-w-lg rounded-[34px] bg-glass p-3 shadow-glass backdrop-blur-xl backdrop-saturate-150">
      <TrailTabs
        tabs={[
          {
            value: "general",
            label: "General",
            icon: <Settings />,
            iconGesture: "turn",
            content: (
              <div className="flex flex-col gap-5 pt-1">
                <div className="grid gap-4 @min-[420px]:grid-cols-2">
                  <Field label="Project name" value="afterglow" />
                  <Field label="Domain" value="afterglow" suffix=".dev" />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <p className="pl-4 text-xs text-foreground/50">Changes go live on the next deploy</p>
                  <SaveButton />
                </div>
              </div>
            ),
          },
          {
            value: "members",
            label: "Members",
            icon: <Users />,
            iconGesture: "hop",
            content: (
              <ul className="flex flex-col px-4 pt-1 pb-2">
                {members.map((member) => (
                  <li key={member.email} className="flex items-center gap-3 py-2">
                    <span className={`grid size-8 place-items-center rounded-full bg-linear-to-br ${member.tone} text-xs font-semibold text-white outline-1 -outline-offset-1 outline-black/10`}>
                      {member.name[0]}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{member.name}</p>
                      <p className="truncate text-xs text-foreground/60">{member.email}</p>
                    </div>
                    <span className="rounded-full border border-foreground/15 px-2 py-0.5 text-xs text-foreground/60">
                      {member.role}
                    </span>
                  </li>
                ))}
              </ul>
            ),
          },
          {
            value: "billing",
            label: "Billing",
            icon: <CreditCard />,
            iconGesture: "nudge",
            content: (
              <div className="flex flex-col gap-4 px-4 pt-1 pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Pro plan</p>
                    <p className="text-xs text-foreground/60">Renews on Nov 18</p>
                  </div>
                  <p className="text-lg font-semibold tabular-nums">$12/mo</p>
                </div>
                <Usage label="Bandwidth" value={62} of="1 TB" />
                <Usage label="Build minutes" value={38} of="6,000" />
              </div>
            ),
          },
          {
            value: "alerts",
            label: "Alerts",
            icon: <Bell />,
            iconGesture: "ring",
            content: (
              <div className="flex flex-col gap-4 px-4 pt-1 pb-2">
                {[
                  ["Deploy failed", true],
                  ["Usage over 80%", true],
                  ["Weekly summary", false],
                ].map(([label, on]) => (
                  <label key={String(label)} className="flex cursor-pointer items-center justify-between text-sm">
                    {label}
                    <GlassSwitch defaultChecked={Boolean(on)} />
                  </label>
                ))}
              </div>
            ),
          },
        ]}
        className="[&>[role=tablist]]:self-start"
      />
    </div>
  )
}

const tile = (from: string, to: string) => `linear-gradient(180deg, ${from}, ${to})`

const apps = [
  { label: "Browser", icon: <Compass />, tone: tile("oklch(0.76 0.14 230)", "oklch(0.52 0.19 258)") },
  { label: "Messages", icon: <MessageCircle />, tone: tile("oklch(0.82 0.18 145)", "oklch(0.6 0.17 150)") },
  { label: "Mail", icon: <Mail />, tone: tile("oklch(0.74 0.14 235)", "oklch(0.5 0.2 262)") },
  { label: "Music", icon: <Music />, tone: tile("oklch(0.74 0.19 15)", "oklch(0.56 0.23 5)") },
  {
    label: "Photos",
    icon: <Aperture />,
    tone: "conic-gradient(from 20deg, oklch(0.8 0.16 70), oklch(0.68 0.21 25), oklch(0.62 0.2 330), oklch(0.66 0.15 240), oklch(0.78 0.16 150), oklch(0.8 0.16 70))",
  },
  { label: "Notes", icon: <NotebookPen />, tone: tile("oklch(0.84 0.16 80)", "oklch(0.7 0.18 55)") },
  { label: "Terminal", icon: <SquareTerminal />, tone: tile("oklch(0.34 0.01 285)", "oklch(0.18 0.01 285)") },
  { label: "Settings", icon: <Settings2 />, tone: tile("oklch(0.66 0.01 285)", "oklch(0.44 0.01 285)") },
]

export function DockDemo() {
  const bounds = React.useRef<HTMLDivElement>(null)
  const [tileSize, setTileSize] = React.useState(48)
  React.useEffect(() => {
    const node = bounds.current
    if (!node) return
    const observer = new ResizeObserver(() => setTileSize(Math.max(24, Math.min(48, Math.floor((node.clientWidth - 108) / (apps.length + 1))))))
    observer.observe(node)
    return () => observer.disconnect()
  }, [])
  const [open, setOpen] = React.useState(() => new Set(["Browser", "Mail", "Music"]))

  function toggle(label: string) {
    setOpen((prev) => {
      const next = new Set(prev)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      return next
    })
  }

  return (
    <div ref={bounds} className="flex min-h-48 w-full min-w-0 items-center overflow-x-auto py-10">
      <MagneticDock
        className="mx-auto shrink-0"
        size={tileSize}
        magnification={tileSize + 20}
        items={[
          ...apps.map((app) => ({
            ...app,
            active: open.has(app.label),
            onClick: () => toggle(app.label),
          })),
          "divider" as const,
          { label: "Trash", icon: <Trash2 /> },
        ]}
      />
    </div>
  )
}

// the picker recolors the whole page, so the demo shows a few things that carry the accent
export function AccentDemo() {
  return (
    <div className="flex flex-col items-center gap-7">
      <AccentPicker />
      <div className="flex items-center gap-5">
        <GlassSwitch defaultChecked aria-label="Example switch" />
        <div className="h-1.5 w-32 overflow-hidden rounded-full bg-foreground/10">
          <div className="h-full w-2/3 rounded-full bg-linear-to-r from-glow-2 to-glow" />
        </div>
        <span className="text-sm font-medium text-glow">Accent</span>
      </div>
    </div>
  )
}
