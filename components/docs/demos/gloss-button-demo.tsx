import { ArrowUpRight, Plus } from "lucide-react"
import { GlossButton } from "@/components/ui/gloss-button"

export function GlossButtonDemo() {
  return (
    <div className="flex min-h-72 flex-wrap items-center justify-center gap-5 px-8 py-16">
      <GlossButton>Get started <ArrowUpRight /></GlossButton>
      <GlossButton variant="glass"><Plus /> Create project</GlossButton>
      <GlossButton disabled>Unavailable</GlossButton>
    </div>
  )
}
