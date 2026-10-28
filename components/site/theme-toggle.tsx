"use client"

import * as React from "react"
import { Moon } from "@/components/animate-ui/icons/moon"
import { Sun } from "@/components/animate-ui/icons/sun"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { setTheme } = useTheme()

  function toggle() {
    const next = !document.documentElement.classList.contains("dark")
    setTheme(next ? "dark" : "light")
  }

  // t flips the theme from anywhere, except while typing
  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() !== "t" || event.metaKey || event.ctrlKey || event.altKey) return
      const target = event.target as HTMLElement | null
      if (target?.closest("input, textarea, select, [contenteditable]")) return
      if (event.repeat || event.defaultPrevented) return
      const next = !document.documentElement.classList.contains("dark")
      setTheme(next ? "dark" : "light")
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [setTheme])

  return (
    <button
      type="button"
      aria-label="Toggle color theme"
      className="grid size-9 cursor-pointer place-items-center rounded-full border border-transparent bg-linear-to-b from-card to-muted/70 text-muted-foreground shadow-gloss outline-none transition-[color,scale] duration-150 ease-out motion-reduce:transition-none hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-safe:active:scale-96"
      aria-keyshortcuts="T"
      title="Switch theme (T)"
      onClick={toggle}
    >
      <Sun className="hidden size-4 dark:block" />
      <Moon className="size-4 dark:hidden" />
    </button>
  )
}
