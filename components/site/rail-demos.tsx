"use client"

import * as React from "react"
import { ArrowUp } from "@/components/animate-ui/icons/arrow-up"
import { ChevronDown } from "@/components/animate-ui/icons/chevron-down"
import { motion, useReducedMotion } from "motion/react"

import { AfterglowMark } from "@/components/ui/auth-parts"
import { ScrollRail } from "@/components/ui/scroll-rail"

type Turn = {
  id: string
  ask: string
  reply: string
  fresh?: boolean
  /** a summary of the files the reply touched */
  changed?: { files: number; added: number; removed: number }
}

const seed: Turn[] = [
  {
    id: "setup",
    ask: "Set up the project",
    reply:
      "Next.js, Tailwind and motion are installed, and the registry builds with one command. Every component lives in its own file, so you can copy one and nothing else.",
  },
  {
    id: "copy",
    ask: "Make the copy button smoother",
    reply:
      "The icon now swaps with a short blur, and the label slides while the width stays put. Copy it twice in a row and the reset timer starts over instead of stacking.",
    changed: { files: 3, added: 41, removed: 18 },
  },
  {
    id: "glow",
    ask: "Remove the cursor glow",
    reply:
      "Glass looks the same at rest and under the pointer now. Only a tiny swell is left on hover, because anything brighter washed the glass out.",
  },
  {
    id: "tabs",
    ask: "Tabs with a sliding pill",
    reply:
      "The pill glides between tabs on one spring, and the panel height follows the content as it changes. Each icon plays a small gesture when you pick it, like the bell ringing.",
    changed: { files: 4, added: 96, removed: 52 },
  },
  {
    id: "accent",
    ask: "Add an accent picker",
    reply:
      "Pick a swatch and every glow turns one solid color, in light and dark. It remembers your choice, and pressing T flips the theme from anywhere on the page.",
    changed: { files: 5, added: 19, removed: 23 },
  },
  {
    id: "beat",
    ask: "Slow the beat down",
    reply:
      "The music card runs at 54 BPM now, and its bars rise and fall on slow waves instead of hitting. Pause it and every bar eases down to rest.",
    changed: { files: 1, added: 58, removed: 21 },
  },
  {
    id: "dock",
    ask: "Check the dock icons",
    reply:
      "The dock keeps its glossy tiles with white line icons, in both themes. I tried real app icons and a hand-drawn set, and neither felt right next to the rest of the page.",
  },
  {
    id: "ship",
    ask: "Commit this round",
    reply:
      "Lint and types pass, the registry is rebuilt, and everything is ready to commit. Nothing is committed yet. Say the word and I will write the message.",
  },
]

const canned = [
  "Done. That change is small, so it is already in the page. Reload and it should feel the same, only tidier.",
  "Good idea. I would keep it to one file and one spring, so it stays easy to copy into another project.",
  "Checked in dark and light. Nothing jumps, and it holds still when reduced motion is on.",
]

const excerpt = (text: string) => (text.length > 120 ? `${text.slice(0, 117).trimEnd()}…` : text)

// a chat window with a rail on its edge: every message you send adds a tick, and any tick jumps
// back to that point in the conversation
export function RailDemo() {
  const reduceMotion = useReducedMotion()
  const [scroller, setScroller] = React.useState<HTMLDivElement | null>(null)
  const [turns, setTurns] = React.useState<Turn[]>(seed)
  const [draft, setDraft] = React.useState("")
  // the reply that is still being typed out, kept apart so the rail does not rebuild per letter
  const [live, setLive] = React.useState<{ id: string; text: string } | null>(null)
  const timers = React.useRef<number[]>([])
  const sent = React.useRef(0)

  // a chat opens at its latest message
  React.useEffect(() => {
    scroller?.scrollTo({ top: scroller.scrollHeight })
  }, [scroller])

  React.useEffect(() => () => timers.current.forEach((id) => window.clearTimeout(id)), [])

  const items = React.useMemo(
    () => turns.map((turn) => ({ id: turn.id, title: turn.ask, excerpt: excerpt(turn.reply) })),
    [turns]
  )

  function follow(smooth: boolean) {
    if (!scroller) return
    const gap = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight
    if (smooth || gap < 160) scroller.scrollTo({ top: scroller.scrollHeight, behavior: smooth && !reduceMotion ? "smooth" : "auto" })
  }

  function send(event: React.FormEvent) {
    event.preventDefault()
    const ask = draft.trim()
    if (!ask || live) return
    const id = `turn-${sent.current}`
    const reply = canned[sent.current % canned.length]
    sent.current += 1
    setDraft("")
    setTurns((all) => [...all, { id, ask, reply: "", fresh: true }])
    setLive({ id, text: "" })
    timers.current.push(window.setTimeout(() => follow(true), 60))

    if (reduceMotion) {
      timers.current.push(
        window.setTimeout(() => {
          setTurns((all) => all.map((turn) => (turn.id === id ? { ...turn, reply } : turn)))
          setLive(null)
        }, 300)
      )
      return
    }
    // the assistant thinks for a moment, then types the reply out
    let shown = 0
    const type = () => {
      shown += 2
      setLive({ id, text: reply.slice(0, shown) })
      requestAnimationFrame(() => follow(false))
      if (shown < reply.length) timers.current.push(window.setTimeout(type, 22))
      else {
        setTurns((all) => all.map((turn) => (turn.id === id ? { ...turn, reply } : turn)))
        setLive(null)
      }
    }
    timers.current.push(window.setTimeout(type, 900))
  }

  return (
    <div className="@container relative flex h-[min(720px,84vh)] min-h-[480px] w-full min-w-0 flex-col">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-foreground/[0.08] px-4 @min-[560px]:px-8">
        <span className="grid size-7 place-items-center rounded-[9px] bg-foreground/[0.09] [&_svg]:size-4">
          <AfterglowMark />
        </span>
        <p className="text-sm font-medium">afterglow-ui</p>
        <p className="text-[13px] text-foreground/50">{turns.length} messages</p>
      </header>

      <div className="relative min-h-0 flex-1">
        <div
          ref={setScroller}
          className="h-full overflow-y-auto px-4 @min-[560px]:px-8 py-6 pr-16 mask-[linear-gradient(transparent,#000_24px,#000_calc(100%-24px),transparent)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="mx-auto flex max-w-3xl flex-col gap-9">
            {turns.map((turn) => {
              const typing = live?.id === turn.id
              const text = typing ? live.text : turn.reply
              return (
                <motion.section
                  key={turn.id}
                  data-rail-id={turn.id}
                  className="flex scroll-mt-6 flex-col gap-4"
                  initial={turn.fresh && !reduceMotion ? { opacity: 0, y: 14 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", duration: 0.4, bounce: 0 }}
                >
                  <p className="max-w-[80%] self-end rounded-[22px] rounded-br-lg bg-foreground/[0.09] px-4 py-2.5 text-[15px] leading-relaxed">
                    {turn.ask}
                  </p>
                  <div className="flex gap-3">
                    <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-[9px] bg-foreground/[0.09] [&_svg]:size-4">
                      <AfterglowMark />
                    </span>
                    <div className="flex min-h-7 min-w-0 max-w-[90%] flex-col items-start gap-3 text-[15px] leading-relaxed text-foreground/75">
                      <p>{text || <Thinking />}</p>
                      {turn.changed && !typing && (
                        <p className="flex min-h-9 flex-wrap items-center gap-2 rounded-[14px] border border-foreground/10 bg-foreground/[0.04] px-3.5 text-[13px] text-foreground">
                          {turn.changed.files} changed {turn.changed.files === 1 ? "file" : "files"}
                          <span className="text-[oklch(0.62_0.17_150)] tabular-nums dark:text-[oklch(0.78_0.17_150)]">+{turn.changed.added}</span>
                          <span className="text-[oklch(0.58_0.2_22)] tabular-nums dark:text-[oklch(0.74_0.17_22)]">−{turn.changed.removed}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </motion.section>
              )
            })}
          </div>
        </div>
        <ScrollRail items={items} container={scroller} className="absolute top-1/2 right-5 -translate-y-1/2" />
      </div>

      <form onSubmit={send} className="shrink-0 px-4 @min-[560px]:px-8 pr-16 pb-5">
        {/* the same padding and width as the messages above, so the box lines up with the text */}
        <div className="mx-auto max-w-3xl rounded-[26px] border border-foreground/10 bg-foreground/[0.05] p-2.5 transition-[border-color,box-shadow] duration-150 focus-within:border-glow/60 focus-within:ring-2 focus-within:ring-glow/20">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Ask anything, or describe what to change…"
            aria-label="Message"
            className="h-11 w-full bg-transparent px-3 text-[15px] outline-none placeholder:text-foreground/40"
          />
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5">
              {["Sonnet 5.5", "High"].map((label) => (
                <span
                  key={label}
                  className="inline-flex h-8 items-center gap-1 rounded-full px-3 text-[13px] text-foreground/60 transition-colors duration-150 hover:bg-foreground/[0.07] hover:text-foreground"
                >
                  {label}
                  <ChevronDown className="size-3.5" />
                </span>
              ))}
            </div>
            <button
              type="submit"
              aria-label="Send"
              disabled={!draft.trim() || live !== null}
              className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-full bg-foreground text-background shadow-[inset_0_1px_0_oklch(1_0_0/0.15),0_1px_2px_oklch(0_0_0/0.12)] transition-[scale,opacity] duration-150 ease-out outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.94] disabled:cursor-default disabled:opacity-30 disabled:active:scale-100"
            >
              <ArrowUp className="size-4" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

// three dots that swell in turn while a reply is on its way
function Thinking() {
  const reduceMotion = useReducedMotion()
  return (
    <span aria-label="Thinking" className="flex h-7 items-center gap-1.5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-1.5 rounded-full bg-foreground/50"
          animate={reduceMotion ? { opacity: 0.6 } : { opacity: [0.3, 1, 0.3], scale: [0.85, 1.1, 0.85] }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut", delay: i * 0.15 }}
        />
      ))}
    </span>
  )
}
