import Image from "next/image"

import { FanCards } from "@/components/ui/fan-cards"
import { LiquidGlass } from "@/components/ui/liquid-glass"

const team = [
  { id: "maya", name: "Maya R.", role: "Product designer" },
  { id: "devon", name: "Devon K.", role: "Frontend engineer" },
  { id: "aria", name: "Aria T.", role: "Engineering lead" },
  { id: "ravi", name: "Ravi S.", role: "Creative developer" },
  { id: "lena", name: "Lena M.", role: "Design lead" },
]

function FanCardsDemo({ eager = false }: { eager?: boolean }) {
  return (
    <div className="w-full bg-background pt-12 sm:pt-16">
      <div className="px-6 text-center">
        <h3 className="text-2xl font-medium tracking-tight sm:text-3xl">Meet the team.</h3>
        <p className="mt-3 text-sm text-muted-foreground">Hover to bring someone into focus.</p>
      </div>
      <FanCards
        aria-label="Example team profiles"
        className="@min-[760px]:pt-14 @min-[760px]:pb-24"
        items={team.map((person) => ({
          id: person.id,
          label: `${person.name}, ${person.role}`,
          content: (
            <figure className="m-0 p-2">
              <div className="relative h-[320px] overflow-hidden rounded-[18px]">
                <Image
                  src={`/images/team/${person.id}.jpg`}
                  alt=""
                  loading={eager ? "eager" : "lazy"}
                  fill
                  sizes="(min-width: 1024px) 260px, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
                <figcaption className="absolute inset-x-3 bottom-3 overflow-hidden rounded-[14px] text-white">
                  <LiquidGlass
                    className="absolute inset-0 overflow-hidden rounded-[inherit]"
                    bezel={12}
                    frost={12}
                    magnify={0}
                    tint="rgb(0 0 0 / 28%)"
                  />
                  <div className="relative px-4 py-3.5">
                    <p className="text-sm font-medium tracking-tight">{person.name}</p>
                    <p className="mt-1 text-xs text-white/80">{person.role}</p>
                  </div>
                </figcaption>
              </div>
            </figure>
          ),
        }))}
      />
    </div>
  )
}

export { FanCardsDemo }
