import { GlossButtonsShowcase } from "@/components/site/gloss-showcase"
import { ControlCenterShowcase } from "@/components/site/controls-showcase"
import Link from "next/link"
import { ArrowRight } from "@/components/animate-ui/icons/arrow-right"

import { AfterglowMark } from "@/components/ui/auth-parts"
import { FanCardsDemo } from "@/components/site/fan-cards-demo"
import { SilkDemo } from "@/components/site/auth-demos"
import { SliderDemo, SwitchDemo, ToastDemo } from "@/components/site/demos"
import {
  DeployDemo,
  CopyDemo,
  AccentDemo,
  DockDemo,
  TabsDemo,
} from "@/components/site/light-demos"
import {
  DesktopDemo,
  LensDemo,
  PhoneDemo,
} from "@/components/site/liquid-demos"
import {
  MetalCardDemo,
  MetalHeroDemo,
  MetalPassDemo,
} from "@/components/site/metal-demos"
import { FlameField } from "@/components/ui/flame-field"
import { FlameFooter } from "@/components/ui/flame-footer"
import { AccentPicker } from "@/components/ui/accent-picker"
import { DocsDemo, GlassSidebarDemo } from "@/components/site/nav-demos"
import { PageRail } from "@/components/site/page-rail"
import { RailDemo } from "@/components/site/rail-demos"
import {
  FontPairingLab,
  type FontPairOption,
} from "@/components/site/font-pairing-lab"
import { ThemeToggle } from "@/components/site/theme-toggle"
import { cn } from "@/lib/utils"
import { IBM_Plex_Mono, Inter, Manrope } from "next/font/google"

const fontManrope = Manrope({
  variable: "--font-lab-manrope",
  subsets: ["latin"],
  preload: false,
})
const fontInter = Inter({
  variable: "--font-lab-inter",
  subsets: ["latin"],
  preload: false,
})
const fontIbmPlexMono = IBM_Plex_Mono({
  weight: "400",
  variable: "--font-lab-ibm-plex-mono",
  subsets: ["latin"],
  preload: false,
})
const fontPairs: FontPairOption[] = [
  {
    id: "dm-jetbrains",
    name: "DM Sans + JetBrains Mono",
    kind: "Sans + Mono",
    display: "var(--font-afterglow-sans)",
    body: "var(--font-afterglow-sans)",
    mono: "var(--font-afterglow-mono)",
    displayName: "DM Sans",
    bodyName: "DM Sans",
    monoName: "JetBrains Mono",
  },
  {
    id: "manrope-inter",
    name: "Manrope + Inter",
    kind: "Sans + Sans",
    display: "var(--font-lab-manrope)",
    body: "var(--font-lab-inter)",
    mono: "var(--font-afterglow-mono)",
    displayName: "Manrope",
    bodyName: "Inter",
    monoName: "JetBrains Mono",
  },
  {
    id: "inter-plex",
    name: "Inter + IBM Plex Mono",
    kind: "Sans + Mono",
    display: "var(--font-lab-inter)",
    body: "var(--font-lab-inter)",
    mono: "var(--font-lab-ibm-plex-mono)",
    displayName: "Inter",
    bodyName: "Inter",
    monoName: "IBM Plex Mono",
  },
]

function Preview({
  name,
  description,
  stretch = false,
  flush = false,
  className,
  children,
}: {
  name: string
  description: string
  /** grow the stage to match the tallest preview in its row */
  stretch?: boolean
  /** the preview fills the whole stage, with no padding around it */
  flush?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <section
      // the page rail reads these to list every component
      data-rail-id={`c-${name.replace(/[^a-z0-9]+/gi, "-")}`}
      data-rail-title={name}
      data-rail-excerpt={description}
      className={cn("flex min-w-0 scroll-mt-10 flex-col gap-3", className)}
    >
      <div
        className={cn(
          "@container relative isolate grid min-h-80 w-full min-w-0 grid-cols-1 place-items-center overflow-hidden rounded-3xl border bg-card",
          flush ? "p-0" : "p-3 sm:p-5",
          stretch && "flex-1"
        )}
      >
        {children}
      </div>
      <div className="px-1">
        <h3 className="font-mono text-sm text-foreground">{name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </section>
  )
}

function Group({
  id,
  title,
  description,
  children,
}: {
  id: string
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div id={id} data-rail-group={title} className="scroll-mt-8 pt-16 first:pt-0">
      <div className="mb-8 flex flex-col gap-1">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="grid gap-10 lg:grid-cols-2">{children}</div>
    </div>
  )
}

export default function Home() {
  return (
    <div
      className={cn(
        "relative isolate min-h-screen",
        fontManrope.variable,
        fontInter.variable,
        fontIbmPlexMono.variable
      )}
    >
      <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-6">
        <div className="flex items-center gap-2.5">
          <AfterglowMark className="size-5" />
          <span className="font-medium tracking-tight">afterglow</span>
        </div>
        <div className="flex min-w-0 flex-wrap items-center gap-3 sm:gap-4">
          <Link href="/docs" className="text-[13px] text-muted-foreground transition-colors hover:text-foreground">
            Documentation
          </Link>
          <Link
            href="/auth"
            className="inline-flex h-8 items-center rounded-full border px-3.5 text-[13px] text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
          >
            Auth forms
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-24">
        <div className="py-16 sm:py-24">
          <p className="mb-5 font-mono text-xs tracking-wide text-muted-foreground uppercase">
            32 components · 4 auth forms · copy, paste, own the code
          </p>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
            Components that leave a little{" "}
            <span className="bg-linear-to-r from-glow via-glow-2 to-glow-3 bg-clip-text text-transparent">
              light
            </span>{" "}
            behind.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground text-pretty">
            Glossy, tactile React components with one shared glow, one set of
            springs, and one material. Copy, paste, restyle.
          </p>
        </div>

        <Group
          id="typography"
          title="Type pairings"
          description="Compare Sans/Sans and Sans/Mono combinations against the same interface copy."
        >
          <Preview
            name="font-pairing-lab"
            description="Switch pairings to compare headline shape, reading texture, numerals, and code in the Afterglow palette."
            className="lg:col-span-2"
          >
            <FontPairingLab pairs={fontPairs} />
          </Preview>
        </Group>

        <section
          id="auth"
          data-rail-id="c-auth-forms"
          data-rail-title="auth forms"
          data-rail-excerpt="Four sign-in blocks, each one file: Silk, Liquid glass, Split and One question."
          data-rail-group="Auth forms"
          className="scroll-mt-8 pb-16"
        >
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-semibold tracking-tight">Auth forms</h2>
              <p className="text-sm text-muted-foreground">
                Four sign-in blocks, each one file. Here is Silk; try submitting it.
              </p>
            </div>
            <Link
              href="/auth"
              className="group inline-flex items-center gap-1.5 text-sm font-medium transition-opacity duration-150 hover:opacity-70"
            >
              See all four
              <ArrowRight className="size-4 transition-transform duration-150 group-hover:translate-x-0.5" />
            </Link>
          </div>
          <div className="overflow-hidden rounded-3xl border shadow-[0_30px_80px_-40px_oklch(0_0_0/50%)]">
            <SilkDemo />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              ["auth-glass", "Liquid glass"],
              ["auth-split", "Split"],
              ["auth-steps", "One question"],
            ].map(([id, label]) => (
              <Link
                key={id}
                href={`/auth#${id}`}
                className="inline-flex h-8 items-center rounded-full border px-3.5 text-[13px] text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
              >
                {label}
              </Link>
            ))}
          </div>
        </section>

        <Group
          id="liquid"
          title="Liquid glass"
          description="Clear glass with a curved rim that bends what's behind it, like Apple's Liquid Glass. Refraction runs in Chromium; Safari and Firefox get frosted glass."
        >
          <Preview
            name="liquid-button · liquid-switch · liquid-slider"
            description="Glass buttons that swell when pressed. Switch knobs and slider thumbs turn into lenses while you hold them."
            className="lg:col-span-2"
          >
            <ControlCenterShowcase />
          </Preview>

          <Preview
            name="liquid-toolbar · liquid-menu · liquid-segmented · liquid-card"
            description="A whole desktop in glass: grouped toolbar buttons, a button that morphs into a menu, a segmented control you can drag, and widgets that swell a touch under your pointer."
            className="lg:col-span-2"
          >
            <DesktopDemo />
          </Preview>

          <Preview
            name="liquid-tabs"
            description="A tab bar whose selection becomes a magnifying lens as it moves. Drag across it, or scroll the feed under it."
          >
            <PhoneDemo />
          </Preview>

          <Preview
            name="liquid-glass"
            description="The material on its own: a clear pane with a curved rim that bends whatever is behind it. Drag it around."
            stretch
          >
            <LensDemo />
          </Preview>
        </Group>

        <Group
          id="metal"
          title="Liquid metal"
          description="Brushed silver and flowing chrome from one small WebGL shader. Every piece on the page shares a single GPU context, pauses offscreen, and holds still under reduced motion."
        >
          <Preview
            name="metal-text · metal-button"
            description="Polished lettering that glints now and then. Buttons in brushed silver, or dark with a hairline of moving chrome."
            className="lg:col-span-2"
          >
            <MetalHeroDemo />
          </Preview>

          <Preview
            name="metal-card"
            description="A card edged in a hairline of chrome."
          >
            <MetalCardDemo />
          </Preview>

          <Preview
            name="liquid-metal"
            description="The material on its own. Softened to satin and darkened, it becomes graphite; a lighter cut makes the chip."
            stretch
          >
            <MetalPassDemo />
          </Preview>
        </Group>

        <Group
          id="gloss"
          title="Gloss"
          description="Surfaces with a specular rim, a shaded edge and real depth. Press them."
        >
          <Preview
            name="gloss-button"
            description="A glossy button with a sheen, a hotspot that follows your pointer, and a press that squishes."
            className="lg:col-span-2"
          >
            <GlossButtonsShowcase />
          </Preview>

          <Preview
            name="fan-cards"
            description="Liquid-glass cards in a gentle fan, with frosted depth and a curved, light-catching rim. Hover or focus one and it lifts, straightens, and comes to the front. On smaller screens they become a readable stack."
            className="lg:col-span-2"
            flush
          >
            <FanCardsDemo />
          </Preview>

          <Preview
            name="glass-switch"
            description="A toggle whose bead stretches like a drop of liquid as it travels. Drag it, too."
          >
            <SwitchDemo />
          </Preview>

          <Preview
            name="glass-slider"
            description="A slider that's hottest at the thumb, leans its bubble into fast moves, and stretches at the ends."
          >
            <SliderDemo />
          </Preview>

          <Preview
            name="glass-toaster"
            description="Frosted toasts that stack, fan out on hover, swipe away, and burn down like an ember."
            className="lg:col-span-2"
          >
            <ToastDemo />
          </Preview>
        </Group>

        <Group
          id="light"
          title="Light"
          description="Light that travels, and lingers for a moment after you leave."
        >
          <Preview
            name="deploy-card"
            description="A liquid glass card that follows a deploy from Queued to Ready. The status dot turns into a check, the timer counts up, and Redeploy spins its icon and starts over."
            className="lg:col-span-2"
          >
            <DeployDemo />
          </Preview>

          <Preview
            name="copy-button"
            description="Copy the command and a streak of light runs along it while the icon turns into a check. The key stays hidden until you reveal it, then decodes in place."
          >
            <CopyDemo />
          </Preview>

          <Preview
            name="trail-tabs"
            description="Tabs that fold down to their icons. The one you pick opens up to show its name, its icon moves (the bell rings, the gear turns), and the panel slides in while the height follows."
          >
            <TabsDemo />
          </Preview>

          <Preview
            name="accent-picker"
            description="Pick a color and every glow and focus ring on the page turns that one solid color, in light and dark. It remembers your choice. Press T to flip the theme."
          >
            <AccentDemo />
          </Preview>

          <Preview
            name="flame-field"
            description="Slow waves of accent color rise, fall, and drift across the surface, fading into white or black with the theme. They run only while on screen and hold still under reduced motion."
            className="lg:col-span-2"
            flush
          >
            <div className="relative h-[420px] w-full">
              <FlameField className="absolute inset-0" />
              <p className="relative z-10 p-10 text-[clamp(40px,6vw,76px)] leading-none font-bold tracking-[-0.04em] text-black dark:text-white">Slow fire.</p>
            </div>
          </Preview>

          <Preview
            name="magnetic-dock"
            description="A frosted dock of glossy app tiles that grow toward your pointer. Apps bounce as they open, and a glow trails behind."
            className="lg:col-span-2"
          >
            <DockDemo />
          </Preview>
        </Group>

        <Group
          id="scroll"
          title="Navigation"
          description="Know where you are, and get anywhere in one move."
        >
          <Preview
            name="rail-nav · reading-rail"
            description="A sidebar and table of contents linked by one clear rail. In the contents, nested headings bend the path and the active section stays in view as you read."
            className="lg:col-span-2"
            flush
          >
            <DocsDemo />
          </Preview>

          <Preview
            name="scroll-rail"
            description="A quiet document minimap with equal short dashes. Nearby marks expand toward the pointer, and the active block brightens as you read."
            className="lg:col-span-2"
            flush
          >
            <RailDemo />
          </Preview>

          <Preview
            name="glass-sidebar"
            description="A workspace sidebar with a continuous contour that opens around hovered links and flows back to your selection."
            className="lg:col-span-2"
          >
            <GlassSidebarDemo />
          </Preview>
        </Group>
      </main>
      <FlameFooter
        className="pb-20 sm:pb-0"
        headline={<>Light that<br />lingers.</>}
        links={[
          { label: "Components", href: "#light" },
          { label: "Auth forms", href: "/auth" },
          { label: "Registry", href: "/r/registry.json" },
        ]}
        legal="Afterglow UI © 2026 · MIT with Commons Clause"
        legalLinks={[{ label: "Back to top", href: "#" }]}
      />
      <AccentPicker className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2" />
      <PageRail />
    </div>
  )
}
