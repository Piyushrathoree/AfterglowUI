import type { CSSProperties } from "react"
import type { TargetAndTransition, Transition } from "motion/react"

// shared spring presets, every component picks from these
export const springs = {
  snappy: { stiffness: 520, damping: 34, mass: 0.6 },
  soft: { stiffness: 260, damping: 26, mass: 0.8 },
  glide: { stiffness: 120, damping: 20, mass: 1 },
} as const

export type SpringName = keyof typeof springs

export function spring(name: SpringName): Transition {
  return { type: "spring", ...springs[name] }
}

// how a glow fades once its source moves away: slow, with a long tail
export const afterglow = {
  linger: 0.9,
  ease: [0.22, 1, 0.36, 1],
} as const satisfies { linger: number; ease: Transition["ease"] }

// paints only the padding ring of an element, used for glowing borders
export const ringMask: CSSProperties = {
  WebkitMask:
    "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
  WebkitMaskComposite: "xor",
  mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
  maskComposite: "exclude",
}

// small icon gestures, played when a control is pressed or selected
export const iconGestures = {
  pop: { scale: [1, 1.2, 1] },
  ring: { rotate: [0, -18, 14, -9, 4, 0], scale: [1, 1.12, 1] },
  // a gear looks the same after half a turn, so it can rest there and snap back unseen
  turn: { rotate: [0, 180], scale: [1, 1.12, 1] },
  hop: { y: [0, -3, 0], scale: [1, 1.1, 1] },
  nudge: { x: [0, 2.5, 0], scale: [1, 1.1, 1] },
} satisfies Record<string, TargetAndTransition>

export type IconGesture = keyof typeof iconGestures

// leaving a gesture is instant: every gesture already ends at, or looks like, its resting pose
export const iconRest: TargetAndTransition = { scale: 1, rotate: 0, x: 0, y: 0, transition: { duration: 0 } }
