import { ArrowRight, Check } from "lucide-react"

import { LiquidMetal } from "@/components/ui/liquid-metal"
import { MetalButton } from "@/components/ui/metal-button"
import { MetalCard } from "@/components/ui/metal-card"
import { MetalText } from "@/components/ui/metal-text"

export function MetalHeroDemo() {
  return (
    <div className="flex flex-col items-center gap-5 py-10 text-center">
      <h3 className="text-[clamp(32px,8cqw,72px)] font-semibold tracking-[-0.045em]">
        <MetalText>Liquid metal</MetalText>
      </h3>
      <p className="max-w-sm text-[15px] text-balance text-muted-foreground">
        Brushed silver and flowing chrome, drawn live on the GPU.
      </p>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
        <MetalButton size="lg" variant="silver">
          Get started
          <ArrowRight />
        </MetalButton>
        <MetalButton size="lg">View the source</MetalButton>
      </div>
    </div>
  )
}

const features = ["Unlimited projects", "Custom domains", "Priority support"]

export function MetalCardDemo() {
  return (
    <MetalCard className="flex w-full max-w-[19rem] flex-col p-6">
      <p className="text-[13px] text-muted-foreground">Pro</p>
      <p className="mt-3 text-4xl font-semibold tracking-tight">
        $29
        <span className="ml-1 text-sm font-normal tracking-normal text-muted-foreground">per month</span>
      </p>
      <ul className="mt-6 flex flex-col gap-3 border-t border-border/60 pt-6 text-[13px]">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-2.5 text-foreground/85">
            <Check className="size-3.5 text-muted-foreground" />
            {feature}
          </li>
        ))}
      </ul>
      <MetalButton className="mt-7 w-full">Upgrade to Pro</MetalButton>
    </MetalCard>
  )
}

export function MetalPassDemo() {
  return (
    <div className="dark relative isolate aspect-[1.586] w-full max-w-[22rem] overflow-hidden rounded-[18px] text-white shadow-[0_30px_60px_-24px_oklch(0_0_0/80%),0_2px_4px_oklch(0_0_0/30%)]">
      {/* graphite: the same shader, softened to satin and pushed toward the dark floor */}
      <LiquidMetal className="-z-10" softness={1} brightness={-0.5} scale={0.45} tint={[1, 1, 1]} speed={0.6} />
      <div aria-hidden className="absolute inset-0 rounded-[inherit] shadow-[inset_0_1px_0_oklch(1_0_0/22%),inset_0_0_0_1px_oklch(1_0_0/8%)]" />
      <div className="relative flex h-full flex-col justify-between p-6">
        <div className="flex items-start justify-between">
          <span className="text-[15px] font-semibold tracking-tight">
            <MetalText every={7}>afterglow</MetalText>
          </span>
          <span className="text-[11px] font-medium tracking-[0.18em] text-white/50">TITANIUM</span>
        </div>
        <Chip />
        <div className="flex items-end justify-between text-white/80 [text-shadow:0_-1px_0_oklch(0_0_0/60%)]">
          <div>
            <p className="font-mono text-[13px] tracking-[0.22em]">•••• 2026</p>
            <p className="mt-1.5 text-xs tracking-wide text-white/55">Night Owl</p>
          </div>
          <span className="text-xs text-white/55">10/30</span>
        </div>
      </div>
    </div>
  )
}

// a small silver contact chip
function Chip() {
  return (
    <span className="relative isolate h-8 w-11 overflow-hidden rounded-md shadow-[inset_0_0_0_1px_oklch(0_0_0/30%),0_1px_1px_oklch(0_0_0/40%)]">
      <LiquidMetal className="-z-10" softness={1} brightness={0.7} scale={0.35} quality={0.5} speed={0.6} />
      <svg aria-hidden viewBox="0 0 44 32" className="absolute inset-0 size-full text-black/30">
        <path d="M0 11h14M0 21h14M30 11h14M30 21h14M14 0v32M30 0v32M14 16h16" fill="none" stroke="currentColor" />
      </svg>
    </span>
  )
}
