import { FanCardsDemo } from "@/components/site/fan-cards-demo"
import { GlossButtonDemo } from "./demos/gloss-button-demo"
import { LiquidGlassDemo } from "./demos/liquid-glass-demo"

export const componentNames = ["fan-cards", "gloss-button", "liquid-glass"] as const
export type DocumentedComponent = typeof componentNames[number]

export function isDocumentedComponent(name: string): name is DocumentedComponent {
  return componentNames.some((component) => component === name)
}

export function ComponentCanvas({ name }: { name: DocumentedComponent }) {
  switch (name) {
    case "fan-cards": return <FanCardsDemo eager />
    case "gloss-button": return <GlossButtonDemo />
    case "liquid-glass": return <LiquidGlassDemo />
  }
}
