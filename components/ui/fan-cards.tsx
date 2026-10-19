import * as React from "react"

import { LiquidGlass } from "@/components/ui/liquid-glass"
import { cn } from "@/lib/utils"

type FanCardItem = {
  id: string
  label: string
  content: React.ReactNode
}

type FanCardsProps = Omit<React.ComponentProps<"div">, "children"> & {
  items: FanCardItem[]
  cardClassName?: string
}

// The outer slot stays still, so lifting a card never moves its hover target.
// Only the inner card transforms; neighboring cards keep their place in the fan.
function FanCards({ items, cardClassName, className, ...props }: FanCardsProps) {
  const center = (items.length - 1) / 2

  return (
    <div className="@container w-full min-w-0">
    <div
      data-slot="fan-cards"
      role="group"
      aria-label="Card collection"
      className={cn(
        "isolate grid w-full gap-4 px-6 py-10 @min-[440px]:grid-cols-2 @min-[760px]:flex @min-[760px]:items-start @min-[760px]:justify-center @min-[760px]:gap-0 @min-[760px]:px-12 @min-[760px]:py-20",
        className
      )}
      {...props}
    >
      {items.map((item, index) => {
        const distance = index - center
        const normalized = center ? distance / center : 0

        return (
          <div
            key={item.id}
            data-slot="fan-card"
            role="group"
            aria-label={item.label}
            tabIndex={0}
            className={cn(
              "group/fan-card relative min-w-0 outline-none @min-[760px]:z-[var(--fan-layer)] @min-[760px]:w-64 @min-[760px]:max-w-[280px] @min-[760px]:flex-1 hover:z-50 focus-visible:z-50",
              index > 0 && "@min-[760px]:-ml-12"
            )}
            style={{
              "--fan-angle": `${normalized * 13}deg`,
              "--fan-offset": `${Math.pow(Math.abs(normalized), 1.5) * 40}px`,
              "--fan-layer": Math.round(30 - Math.abs(normalized) * 10),
            } as React.CSSProperties}
          >
            <div
              data-slot="fan-card-surface"
              className={cn(
                "relative h-full overflow-hidden rounded-[24px] text-card-foreground shadow-[0_12px_32px_-12px_rgb(0_0_0/20%)]",
                "transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                "@min-[760px]:transform-[translateY(var(--fan-offset))_rotate(var(--fan-angle))]",
                "@min-[760px]:group-hover/fan-card:transform-[translateY(-18px)_rotate(0deg)_scale(1.035)]",
                "@min-[760px]:group-focus-visible/fan-card:transform-[translateY(-18px)_rotate(0deg)_scale(1.035)]",
                "group-hover/fan-card:shadow-[0_24px_48px_-16px_rgb(0_0_0/22%)]",
                "group-focus-visible/fan-card:outline-2 group-focus-visible/fan-card:outline-offset-4 group-focus-visible/fan-card:outline-ring",
                "motion-reduce:transform-none! motion-reduce:transition-none",
                cardClassName
              )}
            >
              <LiquidGlass
                className="absolute inset-0 overflow-hidden rounded-[inherit]"
                bezel={20}
                refraction={0}
                frost={6}
                magnify={0}
                tint="color-mix(in oklch, var(--card) 58%, transparent)"
              />
              <div className="relative h-full overflow-hidden rounded-[inherit]">{item.content}</div>
            </div>
          </div>
        )
      })}
    </div>
    </div>
  )
}

export { FanCards, type FanCardsProps, type FanCardItem }
