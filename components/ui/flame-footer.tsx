import * as React from "react"

import { FlameField } from "@/components/ui/flame-field"
import { cn } from "@/lib/utils"

type FooterLink = { label: string; href: string }

type FlameFooterProps = Omit<React.ComponentProps<"footer">, "children"> & {
  /** the big line over the flame */
  headline: React.ReactNode
  /** the name at the top left; defaults to the afterglow mark */
  brand?: React.ReactNode
  links?: FooterLink[]
  /** small print at the bottom left */
  legal?: React.ReactNode
  legalLinks?: FooterLink[]
}

// a page footer that sits on a field of flame. the top row holds the brand and links, the headline
// fills the middle, and the small print rests on the brightest part of the fire
function FlameFooter({ headline, brand, links = [], legal, legalLinks = [], className, ...props }: FlameFooterProps) {
  return (
    <footer
      data-slot="flame-footer"
      className={cn("relative isolate flex min-h-[640px] flex-col overflow-hidden bg-white text-black dark:bg-black dark:text-white", className)}
      {...props}
    >
      <FlameField className="absolute inset-0 -z-10" />
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6">
        <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-5 border-t border-border py-6">
          <div className="flex items-center gap-2.5 font-medium tracking-tight [&_svg]:size-5">
            {brand ?? (
              <>
                <svg viewBox="0 0 24 24" aria-hidden>
                  <path d="M5.5 14a6.5 6.5 0 0 1 13 0Z" fill="currentColor" />
                  <path d="M3 17h18M7.5 20h9" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
                afterglow
              </>
            )}
          </div>
          <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-7 gap-y-3 text-[15px] text-black/60 dark:text-white/75">
            {links.map((link) => (
              <a key={link.label} href={link.href} className="rounded-sm transition-colors duration-150 hover:text-black dark:hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current">
                {link.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="flex flex-1 items-center py-16">
          <p className="text-[clamp(56px,10vw,148px)] leading-[0.92] font-bold tracking-[-0.045em] text-balance">{headline}</p>
        </div>
      </div>
      <div>
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-8 gap-y-3 px-6 py-6 text-xs text-neutral-900">
          <p>{legal}</p>
          <nav aria-label="Legal" className="flex flex-wrap items-center gap-5">
            {legalLinks.map((link) => (
              <a key={link.label} href={link.href} className="rounded-sm transition-opacity duration-150 hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current">
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  )
}

export { FlameFooter, type FlameFooterProps, type FooterLink }
