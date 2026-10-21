"use client"

import { useState, useSyncExternalStore } from "react"
import { Terminal } from "@/components/animate-ui/icons/terminal"
import { CopyButton } from "./copy-button"

const subscribe = () => () => {}
const getOrigin = () => window.location.origin
const getServerOrigin = () => "https://your-docs-domain.com"
export const runners = { pnpm: "pnpm dlx", npm: "npx", yarn: "yarn dlx", bun: "bunx" }

export function useInstallCommand(name: string, manager: keyof typeof runners) {
  const origin = useSyncExternalStore(subscribe, getOrigin, getServerOrigin)
  return `${runners[manager]} shadcn@latest add ${origin}/r/${name}.json`
}

export function InstallCommand({ name }: { name: string }) {
  const [manager, setManager] = useState<keyof typeof runners>("pnpm")
  const command = useInstallCommand(name, manager)
  return (
    <div className="docs-install-command">
      <div className="docs-command-header"><Terminal size={14} /><span>Terminal</span>
        <label className="sr-only" htmlFor={`manager-${name}`}>Package manager</label>
        <select id={`manager-${name}`} value={manager} onChange={(event) => setManager(event.target.value as keyof typeof runners)}>
          {Object.keys(runners).map((item) => <option key={item}>{item}</option>)}
        </select>
        <CopyButton text={command} label="Copy install command" />
      </div>
      <div className="docs-command-body"><pre><code>{command}</code></pre></div>
    </div>
  )
}
