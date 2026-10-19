"use client"

import * as React from "react"
import {
  Accessibility,
  BookOpen,
  ChevronsUpDown,
  Download,
  Palette,
  PanelTop,
  Search,
  MousePointerClick,
} from "lucide-react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { AfterglowMark } from "@/components/ui/auth-parts"
import { RailNav, type RailNavHeading, type RailNavItem } from "@/components/ui/rail-nav"
import { ReadingRail } from "@/components/ui/reading-rail"

type Block = { kind: "p"; text: string } | { kind: "code"; text: string } | { kind: "tip"; text: string }
type Section = { id: string; title: string; depth: 0 | 1; blocks: Block[] }
type Page = { title: string; group: string; lead: string; sections: Section[] }

const p = (text: string): Block => ({ kind: "p", text })
const code = (text: string): Block => ({ kind: "code", text })
const tip = (text: string): Block => ({ kind: "tip", text })

const pages: Record<string, Page> = {
  intro: {
    title: "Introduction",
    group: "Getting started",
    lead: "Afterglow is a set of animated React components that leave a little light behind. Copy one file, own the code.",
    sections: [
      { id: "what", title: "What it is", depth: 0, blocks: [p("Every component is a single file with its own dependencies listed. They share one glow, one set of springs and one glass material, so a page built from them feels like one thing."), tip("Nothing is hidden behind a package. What you copy is what runs.")] },
      { id: "why", title: "Why light", depth: 0, blocks: [p("Most motion in an interface is over the moment it starts. Here, the light lingers: a switch that has just turned off still glows for a beat, a toast burns down like an ember.")] },
      { id: "principles", title: "Principles", depth: 0, blocks: [p("Three rules keep the set consistent.")] },
      { id: "calm", title: "Calm by default", depth: 1, blocks: [p("Springs never bounce on utility controls, and nothing animates that the visitor did not cause.")] },
      { id: "real", title: "Real material", depth: 1, blocks: [p("Glass, gloss and metal are drawn with light and shade, not flat color, so they hold up in both themes.")] },
      { id: "yours", title: "Yours to change", depth: 0, blocks: [p("Because it is your copy, restyle it freely. Change the tokens once and every component follows.")] },
    ],
  },
  install: {
    title: "Installation",
    group: "Getting started",
    lead: "Add any component with the shadcn CLI. It writes one file and leaves the rest of your project alone.",
    sections: [
      { id: "cli", title: "With the CLI", depth: 0, blocks: [p("Run the command for the component you want. The CLI reads the registry, writes the file under components/ui and installs its dependencies."), code("npx shadcn add @afterglow/copy-button")] },
      { id: "deps", title: "Dependencies", depth: 1, blocks: [p("Most components need only motion. A few add lucide-react for icons, and the liquid ones pull in liquid-glass.")] },
      { id: "manual", title: "By hand", depth: 0, blocks: [p("Prefer to copy it yourself? Each file is self-contained: paste it in, add the dependency, and import it."), code("pnpm add motion lucide-react")] },
      { id: "tokens", title: "Add the tokens", depth: 0, blocks: [p("Components read a handful of CSS variables for the glow and the glass. Paste the block from the theming page once."), tip("Skip this and everything still renders, only without the signature colors.")] },
      { id: "check", title: "Check it works", depth: 0, blocks: [p("Render the component on any page. If it moves, you are done.")] },
    ],
  },
  theming: {
    title: "Theming",
    group: "Getting started",
    lead: "One glow, one set of springs and one material. Change the glow and every component follows, in light and dark.",
    sections: [
      { id: "glow", title: "The glow", depth: 0, blocks: [p("--glow is the main light. --glow-2 and --glow-3 are the colors it fades into, so gradients always stay in tune.")] },
      { id: "accent", title: "Picking an accent", depth: 1, blocks: [p("Set the three to one hue for a single steady color, or give each its own for a dusk blend."), code("--glow: oklch(0.8 0.16 240);")] },
      { id: "glass", title: "The glass", depth: 0, blocks: [p("--glass tints the frosted panes, and the --gloss variables draw their lit top edge and shaded base.")] },
      { id: "dark", title: "Dark and light", depth: 0, blocks: [p("Both themes are defined side by side, with the same hue and a different lightness, so an accent reads the same in each.")] },
      { id: "motion", title: "Motion", depth: 0, blocks: [p("A shared set of springs gives every movement the same voice: snappy for controls, glide for anything that trails.")] },
      { id: "tune", title: "Tuning the springs", depth: 1, blocks: [p("Raise the damping for something calmer, lower it for something livelier. One edit changes the whole set.")] },
    ],
  },
  buttons: {
    title: "Buttons",
    group: "Components",
    lead: "Glossy, liquid and metal buttons that press down with a spring, and keep their width while their label changes.",
    sections: [
      { id: "gloss", title: "Gloss", depth: 0, blocks: [p("A specular rim, a shaded edge and a press that squishes. The default for anything primary.")] },
      { id: "liquid", title: "Liquid", depth: 0, blocks: [p("Clear glass that swells when pressed and settles back with a little overshoot.")] },
      { id: "metal", title: "Metal", depth: 0, blocks: [p("Brushed silver or a dark button ringed in flowing chrome, drawn live on the GPU.")] },
      { id: "states", title: "States", depth: 0, blocks: [p("Every button has hover, press, focus and disabled states, and a loading state that swaps the label for a spinner at a fixed width.")] },
      { id: "press", title: "Pressing", depth: 1, blocks: [p("Scale to 0.97 on press, instantly. It is the single most useful detail on a button.")] },
    ],
  },
  tabs: {
    title: "Tabs",
    group: "Components",
    lead: "A pill slides between tabs on one spring, and the panel height follows the content as it changes.",
    sections: [
      { id: "pill", title: "The pill", depth: 0, blocks: [p("The selected tab owns a shared pill that glides to the next one, so the change reads as one motion.")] },
      { id: "icons", title: "Icon gestures", depth: 0, blocks: [p("Each icon plays a small gesture when picked: the bell rings, the gear turns, the arrow nudges.")] },
      { id: "panels", title: "Panels", depth: 0, blocks: [p("Panels slide in from the side you came from and the height eases to fit.")] },
      { id: "keys", title: "Keyboard", depth: 0, blocks: [p("Arrow keys move between tabs, Home and End jump to the ends, and the selection follows focus.")] },
    ],
  },
  a11y: {
    title: "Accessibility",
    group: "Guides",
    lead: "Real buttons and links, a visible focus ring, labels for every icon, and stillness when the visitor asks for it.",
    sections: [
      { id: "semantics", title: "Semantics", depth: 0, blocks: [p("Controls are native elements with the right roles, so assistive tech understands them without extra work.")] },
      { id: "focus", title: "Focus", depth: 0, blocks: [p("A two pixel ring with an offset, drawn in the accent color, follows each control's own radius.")] },
      { id: "reduced", title: "Reduced motion", depth: 0, blocks: [p("Springs become instant and loops stop. Opacity fades stay, so state changes are still visible."), tip("Test it by turning on Reduce motion in your system settings.")] },
      { id: "contrast", title: "Contrast", depth: 0, blocks: [p("Text sits at AA or better on every material, including over glass.")] },
    ],
  },
}

const nav: (RailNavItem | RailNavHeading)[] = [
  { heading: "Getting started" },
  { id: "intro", label: "Introduction", icon: <BookOpen /> },
  { id: "install", label: "Installation", icon: <Download /> },
  { id: "theming", label: "Theming", icon: <Palette />, badge: "New" },
  { heading: "Components" },
  { id: "buttons", label: "Buttons", icon: <MousePointerClick /> },
  { id: "tabs", label: "Tabs", icon: <PanelTop /> },
  { heading: "Guides" },
  { id: "a11y", label: "Accessibility", icon: <Accessibility /> },
]

// a whole docs page: the sidebar picks the page, the article scrolls, and the contents list on the
// right fills as you read it
export function DocsDemo() {
  const reduceMotion = useReducedMotion()
  const [page, setPage] = React.useState("intro")
  const [query, setQuery] = React.useState("")
  const [scroller, setScroller] = React.useState<HTMLDivElement | null>(null)
  const current = pages[page]

  // the search box narrows the sidebar, and a group disappears when none of its rows match
  const visible = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return nav
    const out: (RailNavItem | RailNavHeading)[] = []
    let pending: RailNavHeading | null = null
    nav.forEach((entry) => {
      if ("heading" in entry) pending = entry
      else if (entry.label.toLowerCase().includes(q)) {
        if (pending) out.push(pending)
        pending = null
        out.push(entry)
      }
    })
    return out
  }, [query])

  const contents = React.useMemo(
    () => current.sections.map((section) => ({ id: `docs-${page}-${section.id}`, label: section.title, depth: section.depth })),
    [current, page]
  )

  // a new page starts at the top
  React.useEffect(() => {
    scroller?.scrollTo({ top: 0 })
  }, [page, scroller])

  return (
    <div className="grid h-[640px] w-full grid-cols-[16.5rem_1fr_15rem] max-lg:grid-cols-[16.5rem_1fr]">
      <aside className="flex min-h-0 flex-col border-r border-foreground/[0.08]">
        <div className="flex items-center gap-2.5 px-5 pt-5">
          <span className="grid size-8 place-items-center rounded-[10px] bg-foreground/[0.09] shadow-[inset_0_1px_0_oklch(1_0_0/10%)] [&_svg]:size-[18px]">
            <AfterglowMark />
          </span>
          <p className="text-sm font-semibold tracking-tight">Afterglow</p>
          <span className="ml-auto rounded-full border border-foreground/10 px-2 py-px text-[11px] text-foreground/55">v1.0</span>
        </div>
        <label className="mx-5 mt-5 flex h-9 items-center gap-2 rounded-full border border-foreground/10 bg-foreground/[0.04] px-3 text-foreground/50 transition-[border-color,box-shadow] duration-150 focus-within:border-glow/60 focus-within:ring-2 focus-within:ring-glow/20">
          <Search className="size-3.5 shrink-0" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search docs"
            aria-label="Search docs"
            className="min-w-0 flex-1 bg-transparent text-[13px] text-foreground outline-none placeholder:text-foreground/45"
          />
          <kbd className="rounded-md border border-foreground/10 px-1.5 text-[11px] text-foreground/45">⌘K</kbd>
        </label>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pt-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <RailNav items={visible} value={page} onValueChange={setPage} aria-label="Docs" />
          {visible.length === 0 && <p className="pl-8 text-[13px] text-foreground/45">Nothing matches.</p>}
        </div>
        <div className="m-3 flex items-center gap-3 rounded-[18px] border border-foreground/[0.08] bg-foreground/[0.04] p-2.5">
          <span className="grid size-9 place-items-center rounded-full bg-linear-to-br from-glow to-glow-2 text-sm font-semibold text-glow-foreground">M</span>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-[13px] font-medium">Mira Okafor</p>
            <p className="truncate text-xs text-foreground/50">Pro plan</p>
          </div>
          <ChevronsUpDown className="size-4 text-foreground/40" />
        </div>
      </aside>

      <div
        ref={setScroller}
        className="min-h-0 overflow-y-auto px-12 pt-10 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.article
            key={page}
            className="mx-auto max-w-xl"
            initial={{ opacity: 0, y: reduceMotion ? 0 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
            transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <p className="text-[13px] text-foreground/45">Docs <span className="mx-1 text-foreground/25">/</span> {current.group}</p>
            <h4 className="mt-2 text-[34px] leading-[1.1] font-semibold tracking-[-0.03em] text-balance">{current.title}</h4>
            <p className="mt-4 text-[17px] leading-relaxed text-foreground/60 text-pretty">{current.lead}</p>
            <div className="mt-10 flex flex-col gap-10">
              {current.sections.map((section) => {
                const id = `docs-${page}-${section.id}`
                const Heading = section.depth === 0 ? "h5" : "h6"
                return (
                  <section key={id}>
                    <Heading id={id} className={section.depth === 0 ? "text-xl font-semibold tracking-tight" : "text-base font-semibold tracking-tight text-foreground/90"}>
                      {section.title}
                    </Heading>
                    <div className="mt-3 flex flex-col gap-4">
                      {section.blocks.map((block, index) =>
                        block.kind === "p" ? (
                          <p key={index} className="text-[15px] leading-relaxed text-foreground/65 text-pretty">{block.text}</p>
                        ) : block.kind === "code" ? (
                          <pre key={index} className="overflow-x-auto rounded-[14px] border border-foreground/[0.08] bg-foreground/[0.04] px-4 py-3 font-mono text-[13px] text-foreground/85">{block.text}</pre>
                        ) : (
                          <p key={index} className="rounded-[14px] border border-glow/25 bg-glow/[0.06] px-4 py-3 text-[14px] leading-relaxed text-foreground/75">
                            <span className="mr-2 font-medium text-glow">Tip</span>
                            {block.text}
                          </p>
                        )
                      )}
                    </div>
                  </section>
                )
              })}
            </div>
            <div className="h-96" aria-hidden />
          </motion.article>
        </AnimatePresence>
      </div>

      <div className="min-h-0 overflow-y-auto border-l border-foreground/[0.08] p-6 pt-10 [scrollbar-width:none] max-lg:hidden [&::-webkit-scrollbar]:hidden">
        <ReadingRail items={contents} container={scroller} offset={32} />
      </div>
    </div>
  )
}
