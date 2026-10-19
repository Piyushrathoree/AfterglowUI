import { LiquidGlass } from "@/components/ui/liquid-glass"

export function LiquidGlassDemo() {
  return (
    <div className="relative grid min-h-88 place-items-center overflow-hidden px-8 py-16">
      <div aria-hidden className="absolute top-14 left-[18%] size-44 rounded-full bg-glow" />
      <div aria-hidden className="absolute right-[14%] bottom-10 size-36 rounded-full bg-glow-3" />
      <div className="relative w-72 max-w-full rounded-3xl">
        <LiquidGlass className="absolute inset-0 rounded-[inherit]" frost={6} bezel={20} />
        <div className="relative p-8">
          <p className="text-lg font-medium tracking-tight">A different perspective.</p>
          <p className="mt-3 text-sm leading-6 text-foreground/75">A clear surface. A curved edge. The color behind it becomes part of the material.</p>
        </div>
      </div>
    </div>
  )
}
