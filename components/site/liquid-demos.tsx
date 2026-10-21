"use client"

import * as React from "react"
import { FolderPlus } from "lucide-react"
import { ArrowLeft } from "@/components/animate-ui/icons/arrow-left"
import { ArrowRight } from "@/components/animate-ui/icons/arrow-right"
import { Bell } from "@/components/animate-ui/icons/bell"
import { CloudSun } from "@/components/animate-ui/icons/cloud-sun"
import { Copy } from "@/components/animate-ui/icons/copy"
import { FilePlus as FilePlus2 } from "@/components/animate-ui/icons/file-plus"
import { Image as ImagePlus } from "@/components/animate-ui/icons/image"
import { Ellipsis as MoreHorizontal } from "@/components/animate-ui/icons/ellipsis"
import { PanelLeft } from "@/components/animate-ui/icons/panel-left"
import { Pause } from "@/components/animate-ui/icons/pause"
import { Play } from "@/components/animate-ui/icons/play"
import { Plus } from "@/components/animate-ui/icons/plus"
import { Share as ShareIcon } from "@/components/animate-ui/icons/share"
import { SkipBack } from "@/components/animate-ui/icons/skip-back"
import { SkipForward } from "@/components/animate-ui/icons/skip-forward"
import { Star } from "@/components/animate-ui/icons/star"
import { Sun as SunIcon } from "@/components/animate-ui/icons/sun"
import { Tag } from "@/components/animate-ui/icons/tag"
import { Trash2 } from "@/components/animate-ui/icons/trash-2"
import { Compass } from "@/components/animate-ui/icons/compass"
import { Flame } from "@/components/animate-ui/icons/flame"
import { House } from "@/components/animate-ui/icons/house"
import { LibraryBig as Library } from "@/components/animate-ui/icons/library-big"
import { Moon } from "@/components/animate-ui/icons/moon"
import { Search } from "@/components/animate-ui/icons/search"
import { Sun } from "@/components/animate-ui/icons/sun"
import { Volume2 } from "@/components/animate-ui/icons/volume-2"
import { Wifi } from "@/components/animate-ui/icons/wifi"
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react"

import { LiquidButton } from "@/components/ui/liquid-button"
import { LiquidCard } from "@/components/ui/liquid-card"
import { LiquidMenu } from "@/components/ui/liquid-menu"
import { LiquidSegmented } from "@/components/ui/liquid-segmented"
import { LiquidToolbar } from "@/components/ui/liquid-toolbar"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import { LiquidSlider } from "@/components/ui/liquid-slider"
import { LiquidSwitch } from "@/components/ui/liquid-switch"
import { LiquidTabs } from "@/components/ui/liquid-tabs"

const toggles = [
  { label: "Afterglow", icon: <Flame />, defaultChecked: true },
  { label: "Wi-Fi", icon: <Wifi />, defaultChecked: true },
  { label: "Night Shift", icon: <Moon />, defaultChecked: false },
]

export function ControlCenterDemo() {
  const id = React.useId()
  const [brightness, setBrightness] = React.useState(70)

  return (
    <LiquidGlass className="w-full max-w-[340px] rounded-[30px] px-5 pt-5 pb-3 text-foreground">
      <div className="flex flex-col gap-3.5">
        {toggles.map((row) => (
          <label
            key={row.label}
            className="flex cursor-pointer items-center gap-3"
          >
            <span className="grid size-8 place-items-center rounded-full bg-foreground/10 [&>svg]:size-4">
              {row.icon}
            </span>
            <span className="flex-1 text-sm font-medium">{row.label}</span>
            <LiquidSwitch defaultChecked={row.defaultChecked} />
          </label>
        ))}
        <div className="mt-1 flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs text-foreground/70">
            <span id={`${id}-brightness`}>Brightness</span>
            <span className="tabular-nums">{brightness}%</span>
          </div>
          <div className="flex items-center gap-3">
            <Sun className="size-4 shrink-0 text-foreground/70" />
            <LiquidSlider
              aria-labelledby={`${id}-brightness`}
              value={brightness}
              onValueChange={setBrightness}
              getValueText={(v) => `${v}%`}
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Volume2 className="size-4 shrink-0 text-foreground/70" />
          <LiquidSlider aria-label="Volume" defaultValue={40} />
        </div>
      </div>
    </LiquidGlass>
  )
}

const feed = [
  { title: "Golden hour", tag: "Photos", tone: "from-[oklch(0.8_0.15_60)] to-[oklch(0.62_0.21_20)]" },
  { title: "Night drive", tag: "Playlist", tone: "from-[oklch(0.45_0.18_300)] to-[oklch(0.25_0.08_280)]" },
  { title: "Low tide", tag: "Journal", tone: "from-[oklch(0.75_0.11_210)] to-[oklch(0.45_0.12_250)]" },
  { title: "Embers", tag: "Photos", tone: "from-[oklch(0.7_0.2_35)] to-[oklch(0.35_0.12_15)]" },
  { title: "Violet hour", tag: "Playlist", tone: "from-[oklch(0.65_0.2_320)] to-[oklch(0.35_0.15_290)]" },
  { title: "First light", tag: "Journal", tone: "from-[oklch(0.9_0.08_90)] to-[oklch(0.7_0.15_50)]" },
]

export function PhoneDemo() {
  return (
    <div className="relative h-[640px] w-full max-w-[340px] overflow-hidden rounded-[48px] border-[6px] border-foreground/10 bg-background shadow-2xl">
      <div className="h-full overflow-y-auto px-4 pt-14 pb-28 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <p className="text-[26px] font-bold tracking-tight">Listen now</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {feed.map((item) => (
            <div key={item.title} className="flex flex-col gap-1.5">
              {/* concentric-ignore: album art in the middle of the screen, not in the phone's corner */}
              <div
                className={`relative aspect-square overflow-hidden rounded-2xl bg-linear-to-br ${item.tone}`}
              >
                <div className="absolute -right-6 -bottom-6 size-24 rounded-full border-[10px] border-white/25" />
                <div className="absolute top-3 left-3 h-1.5 w-10 rounded-full bg-white/50" />
              </div>
              <p className="text-[13px] leading-tight font-semibold">
                {item.title}
              </p>
              <p className="text-[11px] text-muted-foreground">{item.tag}</p>
            </div>
          ))}
        </div>
      </div>
      <LiquidButton
        size="icon"
        aria-label="Search"
        className="absolute top-3 right-3"
      >
        <Search />
      </LiquidButton>
      <div className="absolute inset-x-0 bottom-4 flex justify-center">
        <LiquidTabs
          defaultValue="home"
          tabs={[
            { value: "home", label: "Home", icon: <House /> },
            { value: "explore", label: "Explore", icon: <Compass /> },
            { value: "library", label: "Library", icon: <Library /> },
            { value: "alerts", label: "Alerts", icon: <Bell /> },
          ]}
        />
      </div>
    </div>
  )
}

export function LensDemo() {
  const bounds = React.useRef<HTMLDivElement>(null)

  return (
    <div ref={bounds} className="absolute inset-0">
      <motion.div
        drag
        dragConstraints={bounds}
        dragElastic={0.15}
        dragTransition={{ bounceStiffness: 300, bounceDamping: 22 }}
        whileDrag={{ scale: 1.06 }}
        className="absolute top-[calc(50%-70px)] left-[calc(50%-120px)] cursor-grab touch-none active:cursor-grabbing"
      >
        <LiquidGlass
          className="h-[140px] w-[240px] rounded-[40px]"
          bezel={28}
          frost={0.5}
        >
          <p className="grid h-full place-items-center text-sm font-medium text-foreground/80">
            Drag me
          </p>
        </LiquidGlass>
      </motion.div>
    </div>
  )
}

const TRACK_SECONDS = 205
const transport =
  "grid size-9 cursor-pointer place-items-center rounded-full text-foreground/85 transition-[background-color,color] duration-150 outline-none hover:bg-foreground/10 hover:text-foreground focus-visible:ring-2 focus-visible:ring-foreground/50"

// every widget shares one frame: a label row, the body, and a row pinned to the bottom
function Widget({
  label,
  accent = false,
  aside,
  footer,
  children,
}: {
  label: string
  accent?: boolean
  aside?: React.ReactNode
  footer: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <LiquidCard className="min-w-0 min-h-[14.5rem]">
      <div className="flex h-full flex-col">
        <div className="flex h-5 items-center justify-between">
          <p className={`text-[11px] font-semibold tracking-[0.08em] uppercase ${accent ? "text-glow-2" : "text-foreground/60"}`}>
            {label}
          </p>
          {aside}
        </div>
        <div className="flex flex-1 flex-col justify-between gap-4 pt-4">
          {children}
          <div data-widget-footer>{footer}</div>
        </div>
      </div>
    </LiquidCard>
  )
}

function TrackProgress({ seconds, total }: { seconds: number; total: number }) {
  const time = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`
  return (
    <div>
      <div className="h-1 overflow-hidden rounded-full bg-foreground/15">
        <div
          className="h-full rounded-full bg-foreground/85 transition-[width] duration-1000 ease-linear"
          style={{ width: `${(seconds / total) * 100}%` }}
        />
      </div>
      <div className="mt-1.5 flex justify-between text-[11px] text-foreground/55 tabular-nums">
        <span>{time(seconds)}</span>
        <span>-{time(total - seconds)}</span>
      </div>
    </div>
  )
}

const BPM = 54

// a beat clock: `pos` counts beats and keeps climbing while the track plays, and `energy` eases
// between 0 (resting) and 1 (playing), so everything that moves to the beat stops and starts softly
function useBeat(playing: boolean, bpm: number) {
  const reduceMotion = useReducedMotion()
  const pos = useMotionValue(0)
  const energy = useSpring(playing && !reduceMotion ? 1 : 0, { stiffness: 140, damping: 22 })

  React.useEffect(() => {
    energy.set(playing && !reduceMotion ? 1 : 0)
    if (!playing || reduceMotion) return
    const controls = animate(pos, pos.get() + 100000, { duration: (100000 * 60) / bpm, ease: "linear" })
    return () => controls.stop()
  }, [bpm, energy, playing, pos, reduceMotion])

  return { pos, energy }
}

// everything moves on slow waves tied to the beat clock, so it flows instead of hitting. each bar
// blends two sine waves of different lengths (in beats), so no two bars move in step
const wave = (p: number, cycles: number, offset: number) => 0.5 + 0.5 * Math.sin(2 * Math.PI * (p * cycles + offset))
const swell = (cycles: [number, number], offset: [number, number]) => (p: number) =>
  0.22 + 0.62 * (0.65 * wave(p, cycles[0], offset[0]) + 0.35 * wave(p, cycles[1], offset[1]))
const parts = [
  swell([0.5, 0.25], [0, 0.3]),
  swell([0.25, 0.75], [0.35, 0]),
  swell([0.5, 0.35], [0.6, 0.15]),
  swell([0.75, 0.25], [0.1, 0.55]),
  swell([0.35, 0.5], [0.8, 0.4]),
]

function Bar({ pos, energy, part }: { pos: MotionValue<number>; energy: MotionValue<number>; part: (p: number) => number }) {
  const scaleY = useTransform(() => 0.16 + (part(pos.get()) - 0.16) * energy.get())
  return <motion.span className="h-full w-[4px] origin-bottom rounded-full bg-glow" style={{ scaleY }} />
}

// the beat, as five bars that each play a part
function Visualizer({ pos, energy }: { pos: MotionValue<number>; energy: MotionValue<number> }) {
  return (
    <span aria-hidden className="flex h-8 items-end gap-[3px]">
      {parts.map((part, i) => (
        <Bar key={i} pos={pos} energy={energy} part={part} />
      ))}
    </span>
  )
}

// four dots count the bar; the current one flashes and fades, the first one hardest
function BeatDots({ pos, energy }: { pos: MotionValue<number>; energy: MotionValue<number> }) {
  return (
    <span aria-hidden className="flex items-center gap-1.5">
      {[0, 1, 2, 3].map((i) => (
        <BeatDot key={i} index={i} pos={pos} energy={energy} />
      ))}
    </span>
  )
}

function BeatDot({ index, pos, energy }: { index: number; pos: MotionValue<number>; energy: MotionValue<number> }) {
  // a dot swells as its beat arrives and eases away after it, so the count flows from one to the next
  const level = useTransform(() => {
    const away = Math.abs(((pos.get() - index + 2) % 4 + 4) % 4 - 2)
    return (0.5 + 0.5 * Math.cos(Math.PI * Math.min(away, 1))) * energy.get()
  })
  const opacity = useTransform(level, (v) => 0.25 + 0.75 * v)
  const scale = useTransform(level, (v) => 1 + 0.4 * v)
  return <motion.span className="size-1.5 rounded-full bg-foreground" style={{ opacity, scale }} />
}

// the cover breathes, one slow swell every two beats
function Cover({ pos, energy }: { pos: MotionValue<number>; energy: MotionValue<number> }) {
  const scale = useTransform(() => 1 + 0.025 * wave(pos.get(), 0.5, -0.25) * energy.get())
  return (
    <motion.div
      className="relative size-14 shrink-0 overflow-hidden rounded-[14px] bg-[linear-gradient(180deg,oklch(0.4_0.14_320),oklch(0.72_0.18_35))] shadow-[inset_0_0_0_1px_oklch(1_0_0/12%),0_6px_14px_-6px_oklch(0_0_0/50%)]"
      style={{ scale }}
    >
      <div className="absolute top-[48%] left-1/2 size-7 -translate-x-1/2 rounded-full bg-[oklch(0.93_0.09_80)]" />
      <div className="absolute inset-x-0 bottom-0 h-[38%] bg-[oklch(0.24_0.07_300)]" />
    </motion.div>
  )
}

// swaps an icon with a quick scale and blur, so the change reads as one motion
function SwapIcon({ id, children }: { id: string; children: React.ReactNode }) {
  const reduceMotion = useReducedMotion()
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={id}
        className="grid place-items-center"
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.25, filter: "blur(4px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.25, filter: "blur(4px)" }}
        transition={{ type: "spring", duration: 0.3, bounce: 0 }}
      >
        {children}
      </motion.span>
    </AnimatePresence>
  )
}

export function DesktopDemo() {
  const [sidebar, setSidebar] = React.useState(true)
  const [starred, setStarred] = React.useState(false)
  const [playing, setPlaying] = React.useState(true)
  const [seconds, setSeconds] = React.useState(84)
  const { pos, energy } = useBeat(playing, BPM)

  // the track keeps time while it plays
  React.useEffect(() => {
    if (!playing) return
    const id = window.setInterval(() => setSeconds((s) => (s + 1) % TRACK_SECONDS), 1000)
    return () => window.clearInterval(id)
  }, [playing])

  return (
    <div className="@container min-w-0 w-full">
    <div className="flex min-w-0 w-full flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <LiquidToolbar
            aria-label="Window"
            items={[
              {
                label: "Toggle sidebar",
                icon: <PanelLeft />,
                pressed: sidebar,
                onClick: () => setSidebar((v) => !v),
              },
              "divider",
              { label: "Back", icon: <ArrowLeft /> },
              { label: "Forward", icon: <ArrowRight /> },
            ]}
          />
          <LiquidMenu
            align="end"
            trigger={
              <>
                <Plus />
                New
              </>
            }
            items={[
              { label: "New file", icon: <FilePlus2 />, shortcut: "⌘N" },
              { label: "New folder", icon: <FolderPlus />, shortcut: "⇧⌘N" },
              { label: "Import image", icon: <ImagePlus /> },
              "divider",
              { label: "Duplicate", icon: <Copy />, shortcut: "⌘D" },
              { label: "Move to trash", icon: <Trash2 />, destructive: true },
            ]}
          />
        </div>
        <LiquidSegmented
          aria-label="Range"
          defaultValue="week"
          options={[
            { value: "day", label: "Day" },
            { value: "week", label: "Week" },
            { value: "month", label: "Month" },
          ]}
        />
        <LiquidToolbar
          aria-label="Item"
          items={[
            {
              label: "Favorite",
              icon: <Star />,
              pressed: starred,
              onClick: () => setStarred((v) => !v),
            },
            { label: "Tag", icon: <Tag /> },
            { label: "Share", icon: <ShareIcon /> },
            { label: "More", icon: <MoreHorizontal /> },
          ]}
        />
      </div>

      <div className="ag-desktop-widgets grid min-w-0 grid-cols-1 gap-4 @min-[520px]:grid-cols-2 @min-[840px]:grid-cols-3">
        <Widget
          label="Now playing"
          aside={<span className="text-[11px] text-foreground/55 tabular-nums">{BPM} BPM</span>}
          footer={
            <div className="flex flex-col gap-3">
              <TrackProgress seconds={seconds} total={TRACK_SECONDS} />
              <div className="grid grid-cols-3 place-items-center">
                <button type="button" aria-label="Previous" onClick={() => setSeconds(0)} className={transport}>
                  <SkipBack className="size-[18px] fill-current" />
                </button>
                <button
                  type="button"
                  aria-label={playing ? "Pause" : "Play"}
                  onClick={() => setPlaying((v) => !v)}
                  className="grid size-10 cursor-pointer place-items-center rounded-full bg-foreground text-background shadow-[0_6px_16px_-6px_oklch(0_0_0/50%)] transition-[scale] duration-150 ease-out outline-none focus-visible:ring-2 focus-visible:ring-foreground/50 active:scale-96"
                >
                  <SwapIcon id={playing ? "pause" : "play"}>
                    {playing ? <Pause className="size-4 fill-current" /> : <Play className="size-4 translate-x-px fill-current" />}
                  </SwapIcon>
                </button>
                <button type="button" aria-label="Next" onClick={() => setSeconds(0)} className={transport}>
                  <SkipForward className="size-[18px] fill-current" />
                </button>
              </div>
            </div>
          }
        >
          <div className="flex items-center gap-3">
            <Cover pos={pos} energy={energy} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] leading-tight font-semibold">Golden Hour</p>
              <p className="mt-0.5 truncate text-[13px] text-foreground/60">Night Owl</p>
              <div className="mt-2">
                <BeatDots pos={pos} energy={energy} />
              </div>
            </div>
            <Visualizer pos={pos} energy={energy} />
          </div>
        </Widget>

        <Widget
          label="Lisbon"
          aside={<CloudSun className="size-[18px] text-glow" />}
          footer={
            <div className="grid grid-cols-5 text-center text-[11px]">
              {["Now", "19h", "20h", "21h", "22h"].map((hour, i) => (
                <div key={hour} className="flex flex-col items-center gap-1.5">
                  <span className="text-foreground/60">{hour}</span>
                  {i < 2 ? <SunIcon className="size-4 text-glow" /> : <CloudSun className="size-4 text-foreground/85" />}
                  <span className="font-medium tabular-nums">{21 - i}°</span>
                </div>
              ))}
            </div>
          }
        >
          <div>
            <p className="text-[44px] leading-none font-light tracking-[-0.04em]">21°</p>
            <p className="mt-2 text-[13px] font-medium">Mostly clear</p>
            <p className="text-xs text-foreground/60 tabular-nums">H:24° L:15°</p>
          </div>
        </Widget>

        <Widget
          label="Saturday"
          accent
          aside={<span className="text-xs text-foreground/60">Oct 18</span>}
          footer={<p className="text-xs text-foreground/55">Free after 18:00</p>}
        >
          <ul className="flex flex-col gap-2.5">
            {[
              { time: "10:00", title: "Design review", tone: "bg-glow" },
              { time: "13:30", title: "Lunch with Aiko", tone: "bg-glow-2" },
              { time: "17:00", title: "Golden hour walk", tone: "bg-glow-3" },
            ].map((event) => (
              <li key={event.title} className="flex items-stretch gap-3">
                <span className={`w-[3px] shrink-0 rounded-full ${event.tone}`} />
                <div className="min-w-0">
                  <p className="truncate text-[13px] leading-tight font-medium">{event.title}</p>
                  <p className="mt-0.5 text-xs text-foreground/60 tabular-nums">{event.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </Widget>
      </div>
    </div>
    </div>
  )
}
