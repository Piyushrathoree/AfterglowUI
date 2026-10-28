import type { ComponentName } from "./catalog"

export type Showcase = {
  id: string
  title: string
  group: string
  components: readonly ComponentName[]
  description: string
  demo: string
  /** words people search for, used by the sidebar search and page metadata */
  keywords: readonly string[]
}

export const showcases: readonly Showcase[] = [
  {
    id: "glow-avatar",
    title: "Glow avatar",
    group: "AI",
    components: ["glow-avatar"],
    description: "An expressive assistant that looks around, follows the pointer, and changes shape, mood, and motion.",
    demo: "glow-avatar",
    keywords: ["AI", "assistant", "bot", "avatar", "voice", "animation", "emotion"],
  },
  {
    id: "liquid-controls",
    title: "Liquid controls",
    group: "Liquid glass",
    components: ["liquid-button", "liquid-switch", "liquid-slider"],
    description:
      "Glass buttons and a control center with switches and sliders.",
    demo: "controls",
    keywords: ["button", "switch", "toggle", "slider", "liquid glass", "glassmorphism"],
  },
  {
    id: "liquid-desktop",
    title: "Glass desktop",
    group: "Liquid glass",
    components: [
      "liquid-toolbar",
      "liquid-menu",
      "liquid-segmented",
      "liquid-card",
    ],
    description:
      "A complete glass desktop with toolbars, menus, and live widgets.",
    demo: "desktop",
    keywords: ["liquid glass", "glassmorphism", "frosted glass", "window", "desktop", "macOS", "menu bar"],
  },
  {
    id: "liquid-tabs",
    title: "Liquid tabs",
    group: "Liquid glass",
    components: ["liquid-tabs"],
    description: "A music feed with a glass tab bar.",
    demo: "phone",
    keywords: ["tabs", "tab bar", "segmented control", "liquid glass"],
  },
  {
    id: "metal-controls",
    title: "Metal buttons & text",
    group: "Liquid metal",
    components: ["metal-text", "metal-button"],
    description:
      "Polished lettering, brushed silver, and chrome-edged buttons.",
    demo: "metal-hero",
    keywords: ["button", "text effect", "metallic", "chrome", "shiny text", "WebGL"],
  },
  {
    id: "metal-card",
    title: "Metal card",
    group: "Liquid metal",
    components: ["metal-card"],
    description: "A pricing card framed in a moving chrome edge.",
    demo: "metal-card",
    keywords: ["card", "metallic card", "credit card", "membership card", "chrome"],
  },
  {
    id: "liquid-metal",
    title: "Liquid metal",
    group: "Liquid metal",
    components: ["liquid-metal"],
    description: "A titanium pass drawn with the shared metal shader.",
    demo: "metal-pass",
    keywords: ["background", "shader", "WebGL", "metallic", "chrome", "animated background"],
  },
  {
    id: "gloss-button",
    title: "Gloss buttons",
    group: "Gloss",
    components: ["gloss-button"],
    description: "Gloss and frosted buttons, in their full range of sizes.",
    demo: "gloss",
    keywords: ["button", "glossy button", "3D button", "skeuomorphic", "primary button"],
  },
  {
    id: "fan-cards",
    title: "Fan cards",
    group: "Gloss",
    components: ["fan-cards"],
    description:
      "Team profiles that lift into focus and adapt to the available space.",
    demo: "fan",
    keywords: ["cards", "card stack", "team", "profile cards", "carousel"],
  },
  {
    id: "glass-switch",
    title: "Glass switches",
    group: "Gloss",
    components: ["glass-switch"],
    description: "A settings panel with soft, draggable toggles.",
    demo: "switches",
    keywords: ["switch", "toggle", "checkbox", "settings"],
  },
  {
    id: "glass-slider",
    title: "Glass sliders",
    group: "Gloss",
    components: ["glass-slider"],
    description: "Adjust glow intensity and color temperature.",
    demo: "sliders",
    keywords: ["slider", "range input", "volume", "progress"],
  },
  {
    id: "glass-toaster",
    title: "Toast notifications",
    group: "Gloss",
    components: ["glass-toaster"],
    description: "Notifications that stack, fan out, and support actions.",
    demo: "toasts",
    keywords: ["toast", "notification", "snackbar", "alert"],
  },
  {
    id: "deploy-card",
    title: "Deploy card",
    group: "Light",
    components: ["border-beam"],
    description: "Follow a deployment from queued to ready.",
    demo: "deploy",
    keywords: ["border beam", "animated border", "glowing border", "loading", "status card"],
  },
  {
    id: "copy-button",
    title: "Copy controls",
    group: "Light",
    components: ["copy-button"],
    description: "A command and a secret key, with copy and reveal feedback.",
    demo: "copy",
    keywords: ["copy button", "clipboard", "copy to clipboard", "code block"],
  },
  {
    id: "trail-tabs",
    title: "Trail tabs",
    group: "Light",
    components: ["trail-tabs"],
    description: "A complete settings panel with animated tabs.",
    demo: "tabs",
    keywords: ["tabs", "animated tabs", "navigation"],
  },
  {
    id: "accent-picker",
    title: "Accent picker",
    group: "Light",
    components: ["accent-picker"],
    description: "See the shared accent update a set of controls.",
    demo: "accent",
    keywords: ["color picker", "theme picker", "accent color", "swatches", "theme switcher", "dark mode"],
  },
  {
    id: "flame-field",
    title: "Flame field",
    group: "Light",
    components: ["flame-field"],
    description: "Slow waves of accent color follow the current theme.",
    demo: "flame",
    keywords: ["fire", "flame", "shader", "WebGL", "animated background", "footer"],
  },
  {
    id: "magnetic-dock",
    title: "Magnetic dock",
    group: "Light",
    components: ["magnetic-dock"],
    description: "App tiles respond to your pointer and bounce when opened.",
    demo: "dock",
    keywords: ["dock", "macOS dock", "app bar", "toolbar", "magnification"],
  },
  {
    id: "rail-nav",
    title: "Side navigation",
    group: "Navigation",
    components: ["rail-nav"],
    description: "A full docs workspace with branded search, grouped navigation, and long-form component pages.",
    demo: "rail-nav",
    keywords: ["sidebar", "side navigation", "nav menu", "vertical navigation", "docs sidebar"],
  },
  {
    id: "reading-rail",
    title: "Table of contents",
    group: "Navigation",
    components: ["reading-rail"],
    description: "A roomy table of contents with a bent rail that follows the selected section.",
    demo: "reading-rail",
    keywords: ["table of contents", "toc", "on this page", "scroll spy", "reading progress"],
  },
  {
    id: "scroll-rail",
    title: "Scroll rail",
    group: "Navigation",
    components: ["scroll-rail"],
    description: "A document minimap with equal short dashes that expand near the pointer and follow the reader.",
    demo: "scroll-rail",
    keywords: ["document minimap", "scroll progress", "reading rail", "proximity", "long-form reading"],
  },
  {
    id: "auth-silk",
    title: "Silk sign-in",
    group: "Auth forms",
    components: ["auth-silk"],
    description:
      "A complete sign-in block with validation and submission states.",
    demo: "auth-silk",
    keywords: ["login", "sign in", "sign up", "authentication", "auth form"],
  },
  {
    id: "auth-glass",
    title: "Glass sign-in",
    group: "Auth forms",
    components: ["auth-glass"],
    description:
      "A complete sign-in block with validation and submission states.",
    demo: "auth-glass",
    keywords: ["login", "sign in", "sign up", "authentication", "glass form"],
  },
  {
    id: "auth-split",
    title: "Split sign-in",
    group: "Auth forms",
    components: ["auth-split"],
    description:
      "A complete sign-in block with validation and submission states.",
    demo: "auth-split",
    keywords: ["login", "sign in", "sign up", "authentication", "split screen"],
  },
  {
    id: "auth-steps",
    title: "Step-by-step sign-in",
    group: "Auth forms",
    components: ["auth-steps"],
    description:
      "A complete sign-in block with validation and submission states.",
    demo: "auth-steps",
    keywords: ["login", "sign in", "multi-step form", "one-time code", "authentication"],
  },
  { id: "glass-sidebar", title: "Contour sidebar", group: "Navigation", components: ["glass-sidebar", "liquid-search"], description: "A continuous seam opens around each page as you move through the workspace.", demo: "glass-sidebar", keywords: ["sidebar", "navigation", "menu", "search", "app sidebar", "dashboard"] },
]

export function getShowcase(name: string) {
  return showcases.find((item) =>
    item.components.some((component) => component === name),
  )
}

/** Building blocks shown on their own, outside a showcase scene. */
export const foundationDemos: readonly ComponentName[] = ["afterglow-theme"]

/** Components without a scene or a foundation demo read as plain guides. */
export function hasDemo(name: string) {
  return Boolean(getShowcase(name)) || foundationDemos.includes(name as ComponentName)
}
