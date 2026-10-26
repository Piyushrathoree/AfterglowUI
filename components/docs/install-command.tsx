"use client"

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react"
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react"
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
  const groupId = useId()
  const reducedMotion = useReducedMotion()
  const command = useInstallCommand(name, manager)
  const commandRef = useRef<HTMLPreElement>(null)
  const [commandHeight, setCommandHeight] = useState<number | null>(null)

  useEffect(() => {
    const element = commandRef.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => {
      setCommandHeight(entry.contentRect.height)
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="docs-install-command">
      <div className="docs-command-header">
        <LayoutGroup id={groupId}>
          <div className="docs-manager-switch" role="group" aria-label="Package manager">
            {(Object.keys(runners) as (keyof typeof runners)[]).map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={manager === item}
                onClick={() => setManager(item)}
              >
                {item}
                {manager === item && (
                  <motion.span
                    className="docs-manager-indicator"
                    layoutId="install-manager"
                    aria-hidden="true"
                    initial={false}
                    transition={{ duration: reducedMotion ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] }}
                  />
                )}
              </button>
            ))}
          </div>
        </LayoutGroup>
        <CopyButton text={command} label="Copy install command" />
      </div>
      <div className="docs-command-body">
        <span className="docs-command-prompt" aria-hidden="true">$</span>
        <motion.div
          className="docs-command-content"
          initial={false}
          animate={commandHeight === null ? undefined : { height: commandHeight }}
          transition={{ duration: reducedMotion ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          <pre ref={commandRef} aria-label="Installation command">
            <AnimatePresence initial={false} mode="wait">
              <motion.code
                key={manager}
                initial={{ opacity: reducedMotion ? 1 : 0, y: reducedMotion ? 0 : 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: reducedMotion ? 1 : 0, y: reducedMotion ? 0 : -4 }}
                transition={{ duration: reducedMotion ? 0 : 0.15, ease: [0.22, 1, 0.36, 1] }}
              >
                {command}
              </motion.code>
            </AnimatePresence>
          </pre>
        </motion.div>
      </div>
    </div>
  )
}
