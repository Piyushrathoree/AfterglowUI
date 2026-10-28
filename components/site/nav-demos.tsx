"use client"

import * as React from "react"
import { Inbox, ChevronsUpDown, MousePointerClick } from "lucide-react"
import { Accessibility } from "@/components/animate-ui/icons/accessibility"
import { Activity } from "@/components/animate-ui/icons/activity"
import { FolderOpen } from "@/components/animate-ui/icons/folder-open"
import { LayoutDashboard } from "@/components/animate-ui/icons/layout-dashboard"
import { Settings } from "@/components/animate-ui/icons/settings"
import { Users } from "@/components/animate-ui/icons/users"
import { MessageCircle } from "@/components/animate-ui/icons/message-circle"
import { FilePlus } from "@/components/animate-ui/icons/file-plus"
import { CreditCard } from "@/components/animate-ui/icons/credit-card"
import { BookOpen } from "@/components/animate-ui/icons/book-open"
import { Download } from "@/components/animate-ui/icons/download"
import { Palette } from "@/components/animate-ui/icons/palette"
import { PanelTop } from "@/components/animate-ui/icons/panel-top"
import { Search } from "@/components/animate-ui/icons/search"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { AfterglowMark } from "@/components/ui/auth-parts"
import { GlassSidebar, type GlassSidebarHeading, type GlassSidebarItem } from "@/components/ui/glass-sidebar"
import { RailNav, type RailNavHeading, type RailNavItem } from "@/components/ui/rail-nav"
import { ReadingRail } from "@/components/ui/reading-rail"
import { LiquidSearch } from "@/components/ui/liquid-search"

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
    lead: "Afterglow is a source-available collection of React components for interfaces that need thoughtful motion and tactile surfaces. Add a component to your project, then adapt its source to fit your product.",
    sections: [
      { id: "what", title: "What the library includes", depth: 0, blocks: [p("Afterglow includes interactive controls, navigation patterns, feedback states, and larger interface blocks. Each registry entry lists the files and packages it needs."), p("Install only the pieces you want. They land in your project so you can inspect and adapt the implementation.") , tip("The components are source-available and intended to be customized in your app.")] },
      { id: "why", title: "Designed around interaction", depth: 0, blocks: [p("Motion and surface detail should help explain what just happened. A selected tab moves into place, a switch settles after a change, and a notification fades as its time runs out."), p("Each effect follows a user action or communicates a state. This keeps the interface responsive without asking for attention all the time.")] },
      { id: "principles", title: "Design principles", depth: 0, blocks: [p("A shared set of rules helps components from different categories feel consistent when they appear together.")] },
      { id: "calm", title: "Calm by default", depth: 1, blocks: [p("Controls respond promptly and settle without a pronounced bounce. Ambient motion stays slow, and motion preferences are respected.")] },
      { id: "real", title: "Material with purpose", depth: 1, blocks: [p("Glass, gloss, and metal use different light and edge treatments. Each material supports the component’s role instead of acting as decoration alone.")] },
      { id: "yours", title: "Your implementation", depth: 0, blocks: [p("The installed files are yours to edit. Change the markup, remove an effect, or connect a component to your own state and data model.")] },
      { id: "motion", title: "Motion with a purpose", depth: 0, blocks: [p("Motion makes state changes easier to follow. Shared spring settings keep controls, panels, and navigation related without forcing them to move at the same speed.")] },
      { id: "timing", title: "Timing and response", depth: 1, blocks: [p("Small controls respond quickly so a click feels immediate. Larger surfaces take a little longer to settle, which makes their movement feel measured rather than abrupt."), p("The examples use springs for changes in position and short fades for secondary details. Set the reduced-motion preference to see transitions become immediate.")] },
      { id: "interaction", title: "Interaction states", depth: 0, blocks: [p("A component should make its current state visible. Hover, focus, pressed, disabled, loading, and selected states use clear visual changes with enough contrast to read."), p("Keyboard users receive the same state feedback as pointer users. Focus indicators remain visible and controls use native button, link, and input behavior.")] },
      { id: "materials", title: "Materials", depth: 0, blocks: [p("Glass uses translucency and a restrained edge to suggest depth. Gloss defines a lit surface, while metal uses contrast and directional shading to suggest a harder finish."), p("These treatments are kept inside the component, so you can use them without changing the page background or adding a large decorative glow.")] },
      { id: "themes", title: "Light and dark themes", depth: 0, blocks: [p("Components read shared theme tokens for backgrounds, text, borders, and accents. Both themes keep the same visual hierarchy while adjusting contrast for the surface behind them.")] },
      { id: "customize", title: "Changing the accent", depth: 1, blocks: [p("Update the accent tokens in your global stylesheet to recolor the shared highlights. Component-specific colors remain available when a particular design needs them.")] },
      { id: "responsive", title: "Responsive layouts", depth: 0, blocks: [p("Previews adapt to the width available in their parent. On smaller screens, complex layouts stack or become scrollable rather than shrinking their controls until they are hard to use.")] },
      { id: "accessibility", title: "Accessibility", depth: 0, blocks: [p("The components use semantic controls, visible keyboard focus, and reduced-motion support. Check text and accent contrast against the colors in your own theme before shipping.")] },
      { id: "performance", title: "Performance", depth: 0, blocks: [p("Motion is driven by small animated values where possible, so pointer movement does not require a full React render for every frame. Components avoid running decorative animation when it does not communicate useful feedback.")] },
      { id: "ownership", title: "Source and license", depth: 0, blocks: [p("Afterglow is source-available under its published license. Review the license before redistributing components or using them in a product with a different distribution model.")] },
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
  switches: {
    title: "Glass switches",
    group: "Components",
    lead: "A compact switch with a clear state change, soft glass surface, and motion that respects reduced-motion settings.",
    sections: [
      { id: "states", title: "On and off", depth: 0, blocks: [p("Color, position, and label work together to make the current state easy to read.")] },
      { id: "input", title: "Keyboard input", depth: 0, blocks: [p("The switch uses a native button pattern, so Space and Enter work as expected.")] },
      { id: "motion", title: "Motion", depth: 0, blocks: [p("The thumb settles quickly and the glow fades without a bounce.")] },
    ],
  },
  search: {
    title: "Liquid search",
    group: "Components",
    lead: "A focused search field with a calm glass surface, a clear action, and a keyboard-friendly flow.",
    sections: [
      { id: "focus", title: "Focus", depth: 0, blocks: [p("The field keeps a quiet glass surface while focus brings the accent ring into view. The search icon stays in its own small well, so the typing area remains clear.")] },
      { id: "filter", title: "Filter pages as you type", depth: 0, blocks: [p("Search matches page names across the navigation. Results update immediately, and the current page stays open until you choose another destination.")] },
      { id: "groups", title: "Keep useful context", depth: 1, blocks: [p("A group label remains above matching pages. Groups with no matches disappear, which keeps the list focused without losing its structure.")] },
      { id: "clear", title: "Clear the query", depth: 0, blocks: [p("The clear action appears when the field has text. It empties the query and puts focus back in the input, ready for another search.")] },
      { id: "escape", title: "Keyboard", depth: 0, blocks: [p("Press Escape to clear the current query without moving focus away. The search remains a native input, so standard text editing works as expected.")] },
      { id: "empty", title: "No matching pages", depth: 0, blocks: [p("When nothing matches, the sidebar shows a short empty state in place of a blank list. Clear or change the query to bring the groups back.")] },
      { id: "accessible", title: "Accessible by default", depth: 0, blocks: [p("The input has a visible label for assistive technology, and its clear control receives a name only when it can be used. Focus remains visible against the dark surface.")] },
      { id: "motion", title: "Motion with restraint", depth: 0, blocks: [p("The field responds to focus with a small change in color and light. It avoids shifting the sidebar, so the navigation stays steady while you type.")] },
    ],
  },
  sidebar: {
    title: "Contour sidebar",
    group: "Components",
    lead: "A continuous contour follows the active page and opens around the row under your pointer or keyboard focus.",
    sections: [
      { id: "groups", title: "Grouped navigation", depth: 0, blocks: [p("Headings divide longer lists into sections while search keeps matching rows in context.")] },
      { id: "selection", title: "Selection", depth: 0, blocks: [p("The active page stays selected as the contour moves between hovered and focused rows.")] },
      { id: "control", title: "Controlled state", depth: 0, blocks: [p("Use value and onValueChange when the parent owns navigation state.")] },
    ],
  },
  scroll: {
    title: "Scroll rail",
    group: "Components",
    lead: "A compact rail tracks long content and gives each section a direct jump point.",
    sections: [
      { id: "tracking", title: "Scroll tracking", depth: 0, blocks: [p("The current section follows the scroll position and reaches the final item at the end of the page.")] },
      { id: "jump", title: "Jump to a section", depth: 0, blocks: [p("Select a marker to scroll directly to its matching section.")] },
      { id: "preview", title: "Preview", depth: 0, blocks: [p("Hover or focus a marker to see its title and a short description.")] },
    ],
  },
  motion: {
    title: "Motion",
    group: "Guides",
    lead: "Motion is tied to interaction, with shared springs and a reduced-motion path throughout the component set.",
    sections: [
      { id: "springs", title: "Shared springs", depth: 0, blocks: [p("Small controls settle quickly; larger surfaces glide with a little more weight.")] },
      { id: "reduce", title: "Reduced motion", depth: 0, blocks: [p("Spring transitions become immediate when the system asks for less motion.")] },
      { id: "feedback", title: "Interaction feedback", depth: 0, blocks: [p("Animation clarifies a state change or follows the pointer; it does not run just to decorate the page.")] },
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
  { id: "theming", label: "Theming", icon: <Palette /> },
  { heading: "Components" },
  { id: "buttons", label: "Buttons", icon: <MousePointerClick /> },
  { id: "tabs", label: "Tabs", icon: <PanelTop /> },
  { id: "switches", label: "Glass switches", icon: <PanelTop /> },
  { id: "search", label: "Liquid search", icon: <Search /> },
  { id: "sidebar", label: "Contour sidebar", icon: <FolderOpen /> },
  { id: "scroll", label: "Scroll rail", icon: <Activity /> },
  { heading: "Guides" },
  { id: "motion", label: "Motion", icon: <Activity /> },
  { id: "a11y", label: "Accessibility", icon: <Accessibility /> },
]

// the search box narrows the sidebar, and a group disappears when none of its rows match
function useFilteredNav(query: string) {
  return React.useMemo(() => {
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
}

// a whole docs page: the sidebar picks the page, the article scrolls, and the contents list on the
// right fills as you read it
export function DocsDemo() {
  const reduceMotion = useReducedMotion()
  const [page, setPage] = React.useState("intro")
  const [query, setQuery] = React.useState("")
  const [scroller, setScroller] = React.useState<HTMLDivElement | null>(null)
  const current = pages[page]

  const visible = useFilteredNav(query)

  const contents = React.useMemo(
    () => current.sections.map((section) => ({ id: `docs-${page}-${section.id}`, label: section.title, depth: section.depth })),
    [current, page]
  )

  // a new page starts at the top
  React.useEffect(() => {
    scroller?.scrollTo({ top: 0 })
  }, [page, scroller])

  return (
    <div className="@container w-full min-w-0">
    <div className="ag-navigation-demo grid h-[640px] w-full min-w-0 grid-cols-1 @min-[600px]:grid-cols-[minmax(0,1fr)_200px] @min-[900px]:grid-cols-[180px_minmax(0,1fr)_220px] @min-[1040px]:grid-cols-[208px_minmax(0,1fr)_240px]">
      <aside className="hidden min-h-0 flex-col @min-[900px]:flex border-r border-foreground/[0.08]">
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
          <kbd className="rounded-concentric border border-foreground/10 px-1.5 text-[11px] text-foreground/45">⌘K</kbd>
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
        className="min-h-0 min-w-0 overflow-y-auto px-5 pt-6 pb-4 @min-[640px]:px-8 @min-[1040px]:px-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <details className="mb-6 rounded-xl border border-foreground/10 p-3 @min-[900px]:hidden"><summary className="cursor-pointer text-sm">Browse demo pages</summary><div className="mt-4"><RailNav items={visible} value={page} onValueChange={setPage} aria-label="Demo pages" /></div></details>
        <details open className="mb-6 rounded-xl border border-foreground/10 p-3 @min-[600px]:hidden"><summary className="cursor-pointer text-sm">On this page</summary><div className="mt-4"><ReadingRail items={contents} container={scroller} offset={24} /></div></details>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.article
            key={page}
            className="mx-auto max-w-xl"
            initial={{ opacity: 0, y: reduceMotion ? 0 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
            transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <PageArticle page={page} />
            <div className="h-96" aria-hidden />
          </motion.article>
        </AnimatePresence>
      </div>

      <div className="min-h-0 overflow-y-auto border-l border-foreground/[0.08] p-3 pt-6 @min-[1040px]:p-6 @min-[1040px]:pt-10 [scrollbar-width:none] hidden @min-[600px]:block [&::-webkit-scrollbar]:hidden">
        <ReadingRail items={contents} container={scroller} offset={32} />
      </div>
    </div>
    </div>
  )
}

// one page of the demo docs: breadcrumb, title, lead, then its sections with ids the rail can follow
function PageArticle({ page }: { page: string }) {
  const current = pages[page]
  return (
    <>
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
    </>
  )
}

const panel = "rounded-[24px] border border-foreground/[0.09] bg-card/95 shadow-[inset_0_1px_0_var(--gloss-highlight),0_16px_40px_-24px_var(--gloss-depth)]"

// the rail nav on its own panel: pick a page and the preview beside it follows
export function RailNavDemo() {
  const reduceMotion = useReducedMotion()
  const [page, setPage] = React.useState("intro")
  const [query, setQuery] = React.useState("")
  const visible = useFilteredNav(query)
  const current = pages[page]
  return (
    <div className="ag-railnav-demo @container w-full min-w-0">
      <div className="ag-railnav-workspace grid min-w-0 grid-cols-1 items-stretch gap-0 @min-[600px]:grid-cols-[248px_minmax(0,1fr)]">
        <aside data-rail-demo className={`mx-auto flex h-full w-full min-h-0 flex-col overflow-hidden ${panel}`}>
          <div className="flex items-center gap-2.5 px-4 pt-4">
            <span className="grid size-9 place-items-center rounded-concentric border border-glow/20 bg-linear-to-br from-glow/[0.16] to-glow/[0.045] text-glow shadow-[inset_0_1px_0_oklch(1_0_0/12%),0_4px_14px_-10px_var(--glow)]">
              <AfterglowMark className="size-5" />
            </span>
            <div className="grid gap-0.5 leading-tight">
              <p className="text-[14px] font-semibold tracking-[-0.02em]">afterglow</p>
              <p className="text-[11px] text-foreground/50">Component library</p>
            </div>
          </div>
          {/* concentric-ignore: the search sits inset from the panel corners */}
          <LiquidSearch
            value={query}
            onValueChange={setQuery}
            placeholder="Find a page"
            aria-label="Search documentation"
            className="ag-railnav-search mx-4 mt-4 h-10 w-auto rounded-[14px] border border-foreground/10 bg-foreground/[0.025]"
          />
          <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-4 [scrollbar-width:thin]">
            <RailNav items={visible} value={page} onValueChange={setPage} aria-label="Docs" />
            {visible.length === 0 && <p role="status" className="pl-8 text-[13px] text-foreground/45">Nothing matches.</p>}
          </div>
        </aside>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={page}
            className="min-w-0 overflow-y-auto border-t border-foreground/[0.08] px-5 py-7 @min-[600px]:border-l @min-[600px]:border-t-0 @min-[600px]:px-7 @min-[600px]:py-8"
            initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
            transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <article className="mx-auto w-full max-w-2xl">
              <PageArticle page={page} />
              <div className="h-20" aria-hidden />
            </article>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

// a large standalone table of contents with the same bent reading path
export function ReadingRailDemo() {
  const [active, setActive] = React.useState("configuration")
  const contents = React.useMemo(
    () => [
      { id: "installation", label: "Installation" },
      { id: "prerequisites", label: "Prerequisites", depth: 1 },
      { id: "installation-steps", label: "Installation Steps", depth: 1 },
      { id: "configuration", label: "Configuration", depth: 1 },
      { id: "usage", label: "Usage" },
      { id: "customizing-content", label: "Customizing Content", depth: 1 },
      { id: "submenu-content", label: "Submenu Content", depth: 2 },
      { id: "features", label: "Features" },
    ],
    []
  )
  return (
    <div className="ag-toc-demo h-full w-full min-w-0">
      <div data-rail-demo className="flex h-full min-h-0 min-w-0 flex-col overflow-auto px-5 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="m-auto w-full max-w-[380px] shrink-0">
          <ReadingRail items={contents} activeId={active} onActiveIdChange={setActive} size="large" />
        </div>
      </div>
    </div>
  )
}

const sidebarPages: (GlassSidebarItem | GlassSidebarHeading)[] = [
  { heading: "Workspace" },
  { id: "overview", label: "Overview", icon: <LayoutDashboard /> },
  { id: "projects", label: "Projects", icon: <FolderOpen /> },
  { id: "inbox", label: "Inbox", icon: <Inbox /> },
  { id: "activity", label: "Activity", icon: <Activity /> },
  { heading: "Collaboration" },
  { id: "messages", label: "Messages", icon: <MessageCircle /> },
  { id: "files", label: "Files", icon: <FilePlus /> },
  { heading: "Components" },
  { id: "liquid-buttons", label: "Liquid buttons", icon: <MousePointerClick /> },
  { id: "glass-switches", label: "Glass switches", icon: <PanelTop /> },
  { id: "trail-tabs", label: "Trail tabs", icon: <PanelTop /> },
  { id: "liquid-search", label: "Liquid search", icon: <Search /> },
  { id: "scroll-rail", label: "Scroll rail", icon: <Activity /> },
  { heading: "Manage" },
  { id: "members", label: "Members", icon: <Users /> },
  { id: "billing", label: "Billing", icon: <CreditCard /> },
  { id: "settings", label: "Settings", icon: <Settings /> },
]

const workspaceViews: Record<string, { description: string; rows: [string, string][] }> = {
  overview: { description: "A little space to see the bigger picture.", rows: [["3 active projects", "Your team's work, in one place"], ["2 updates", "Waiting in your inbox"]] },
  projects: { description: "Good work starts with a little clarity.", rows: [["Website refresh", "Design · In progress"], ["Component library", "Development · In progress"], ["Brand exploration", "Research · Planning"]] },
  inbox: { description: "The conversations that need your attention.", rows: [["Aria left a comment", "Component library · 12 minutes ago"], ["Devon shared an update", "Website refresh · 1 hour ago"]] },
  activity: { description: "A quiet record of what is moving forward.", rows: [["Navigation updated", "Mira · Today"], ["New palette shared", "Aria · Yesterday"]] },
  messages: { description: "Decisions, feedback, and small updates from your team.", rows: [["Aria Taylor", "The new palette is ready to review · 9:42 AM"], ["Devon Kim", "Pushed the sidebar update · 9:18 AM"], ["Mira Okafor", "Added notes to the launch plan · Yesterday"]] },
  files: { description: "Recent work shared across Afterglow Studio.", rows: [["Brand guidelines", "Updated by Aria · 2.4 MB"], ["Launch checklist", "Updated by Mira · 184 KB"], ["Sidebar explorations", "Updated by Devon · 3 files"]] },
  "liquid-buttons": { description: "Quiet controls with a soft, responsive glass surface.", rows: [["Primary action", "Liquid button · Accent enabled"], ["Secondary action", "Liquid button · Neutral"], ["Icon action", "Liquid button · Compact"]] },
  "glass-switches": { description: "Small state changes with a clear, tactile response.", rows: [["Email updates", "On · Workspace activity"], ["Quiet hours", "On · 10 PM to 8 AM"], ["Product notes", "Off · Optional updates"]] },
  "trail-tabs": { description: "A moving accent follows the active view without crowding the content.", rows: [["Overview", "Default tab"], ["Activity", "Recent changes"], ["Settings", "Workspace preferences"]] },
  "liquid-search": { description: "A focused search field with a restrained liquid-glass surface.", rows: [["Search components", "Name, category, or keyword"], ["Keyboard shortcut", "⌘ K · Open search"], ["Recent query", "Navigation"]] },
  "scroll-rail": { description: "Jump between sections with a rail that follows the page.", rows: [["Introduction", "Current section"], ["Interactions", "Hover or focus a marker"], ["Accessibility", "Keyboard and reduced motion"]] },
  members: { description: "Four people sharing one workspace and moving the work forward.", rows: [["Mira Okafor", "Workspace owner · Joined in March"], ["Aria Taylor", "Product designer · Joined in April"], ["Devon Kim", "Frontend engineer · Joined in May"], ["Sam Rivera", "Content designer · Joined in June"]] },
  billing: { description: "Your plan and upcoming workspace charges.", rows: [["Studio plan", "Renews on November 12, 2026"], ["Payment method", "Visa ending in 2048"], ["Seats in use", "4 of 8 team members"]] },
  settings: { description: "Make room for the way you work.", rows: [["Afterglow Studio", "Workspace name"], ["Personal workspace", "Workspace type"]] },
}

export function GlassSidebarDemo() {
  const [value, setValue] = React.useState("projects")
  const selected = sidebarPages.find(entry => "id" in entry && entry.id === value)
  const title = selected && "label" in selected ? selected.label : "Projects"
  const page = workspaceViews[value] ?? workspaceViews.projects
  return <div className="ag-contour-demo @container w-full min-w-0">
    <div className="ag-contour-workspace grid min-w-0 grid-cols-1 items-stretch gap-0 @min-[640px]:grid-cols-[240px_minmax(0,1fr)]">
      <GlassSidebar
        searchPlaceholder="Find a page"
        className="mx-auto h-full min-h-0 w-full max-w-none"
        items={sidebarPages}
        value={value}
        onValueChange={setValue}
        header={
          <div className="ag-contour-brand flex min-h-[42px] items-center gap-2.5 px-1.5 pt-[3px] pb-[5px]">
            <AfterglowMark width={22} height={22} className="size-[22px] shrink-0 text-glow" />
            <div className="grid min-w-0 gap-0.5 text-[13px] leading-tight font-medium tracking-tight">
              <span className="truncate">Afterglow</span>
              <small className="block truncate text-[10px] font-normal tracking-normal text-muted-foreground">Workspace</small>
            </div>
          </div>
        }
      />
      <div className="min-w-0 px-5 py-7 @min-[640px]:overflow-y-auto @min-[640px]:px-7 @min-[640px]:py-8">
        <p className="flex items-center gap-2 text-[11px] text-muted-foreground"><FolderOpen size={12} /> Workspace <span className="text-foreground/20">/</span> {title}</p>
        <h4 className="mt-8 text-[28px] font-semibold tracking-tight">{title}</h4>
        <p className="mt-3 text-[13px] leading-6 text-muted-foreground">{page.description}</p>
        <div className="mt-7 divide-y divide-foreground/[0.06] border-y border-foreground/[0.06]">
          {page.rows.map(([name, detail], index) => <div key={name} className="flex items-center gap-3 py-4"><span className="grid size-8 shrink-0 place-items-center rounded-[10px] border border-foreground/[0.08] bg-foreground/[0.025] text-glow"><FolderOpen size={14} /></span><div className="min-w-0"><p className="truncate text-xs font-medium">{name}</p><p className="mt-1 text-[11px] text-muted-foreground">{detail}</p></div>{value === "projects" && <span className="ml-auto size-1.5 shrink-0 rounded-full bg-glow" style={{ opacity: index === 2 ? 0.35 : 0.8 }} />}</div>)}
        </div>
      </div>
    </div>
  </div>
}
