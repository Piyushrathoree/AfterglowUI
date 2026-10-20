import type { ComponentName } from "./catalog"

export type Showcase = {
  id: string
  title: string
  group: string
  components: readonly ComponentName[]
  description: string
  demo: string
}

export const showcases: readonly Showcase[] = [
  {
    id: "liquid-controls",
    title: "Liquid controls",
    group: "Liquid glass",
    components: ["liquid-button", "liquid-switch", "liquid-slider"],
    description:
      "Glass buttons and a control center with switches and sliders.",
    demo: "controls",
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
  },
  {
    id: "liquid-tabs",
    title: "Liquid tabs",
    group: "Liquid glass",
    components: ["liquid-tabs"],
    description: "A music feed with a glass tab bar.",
    demo: "phone",
  },
  {
    id: "liquid-glass",
    title: "Glass lens",
    group: "Liquid glass",
    components: ["liquid-glass"],
    description: "Drag the lens across its backdrop to explore the material.",
    demo: "lens",
  },
  {
    id: "metal-controls",
    title: "Metal buttons & text",
    group: "Liquid metal",
    components: ["metal-text", "metal-button"],
    description:
      "Polished lettering, brushed silver, and chrome-edged buttons.",
    demo: "metal-hero",
  },
  {
    id: "metal-card",
    title: "Metal card",
    group: "Liquid metal",
    components: ["metal-card"],
    description: "A pricing card framed in a moving chrome edge.",
    demo: "metal-card",
  },
  {
    id: "liquid-metal",
    title: "Liquid metal",
    group: "Liquid metal",
    components: ["liquid-metal"],
    description: "A titanium pass drawn with the shared metal shader.",
    demo: "metal-pass",
  },
  {
    id: "gloss-button",
    title: "Gloss buttons",
    group: "Gloss",
    components: ["gloss-button"],
    description: "Gloss and frosted buttons, in their full range of sizes.",
    demo: "gloss",
  },
  {
    id: "sheen-card",
    title: "Sheen card",
    group: "Gloss",
    components: ["sheen-card"],
    description: "A membership pass that responds to light and movement.",
    demo: "sheen",
  },
  {
    id: "fan-cards",
    title: "Fan cards",
    group: "Gloss",
    components: ["fan-cards"],
    description:
      "Team profiles that lift into focus and adapt to the available space.",
    demo: "fan",
  },
  {
    id: "glass-switch",
    title: "Glass switches",
    group: "Gloss",
    components: ["glass-switch"],
    description: "A settings panel with soft, draggable toggles.",
    demo: "switches",
  },
  {
    id: "glass-slider",
    title: "Glass sliders",
    group: "Gloss",
    components: ["glass-slider"],
    description: "Adjust glow intensity and color temperature.",
    demo: "sliders",
  },
  {
    id: "glass-toaster",
    title: "Toast notifications",
    group: "Gloss",
    components: ["glass-toaster"],
    description: "Notifications that stack, fan out, and support actions.",
    demo: "toasts",
  },
  {
    id: "deploy-card",
    title: "Deploy card",
    group: "Light",
    components: ["border-beam"],
    description: "Follow a deployment from queued to ready.",
    demo: "deploy",
  },
  {
    id: "copy-button",
    title: "Copy controls",
    group: "Light",
    components: ["copy-button"],
    description: "A command and a secret key, with copy and reveal feedback.",
    demo: "copy",
  },
  {
    id: "trail-tabs",
    title: "Trail tabs",
    group: "Light",
    components: ["trail-tabs"],
    description: "A complete settings panel with animated tabs.",
    demo: "tabs",
  },
  {
    id: "accent-picker",
    title: "Accent picker",
    group: "Light",
    components: ["accent-picker"],
    description: "See the shared accent update a set of controls.",
    demo: "accent",
  },
  {
    id: "flame-field",
    title: "Flame field",
    group: "Light",
    components: ["flame-field"],
    description: "Slow waves of accent color follow the current theme.",
    demo: "flame",
  },
  {
    id: "magnetic-dock",
    title: "Magnetic dock",
    group: "Light",
    components: ["magnetic-dock"],
    description: "App tiles respond to your pointer and bounce when opened.",
    demo: "dock",
  },
  {
    id: "navigation-rails",
    title: "Navigation rails",
    group: "Navigation",
    components: ["rail-nav", "reading-rail"],
    description:
      "A working documentation view with navigation and a reading rail.",
    demo: "navigation",
  },
  {
    id: "scroll-rail",
    title: "Scroll rail",
    group: "Navigation",
    components: ["scroll-rail"],
    description: "A working conversation with a rail for every message.",
    demo: "chat",
  },
  {
    id: "flame-footer",
    title: "Flame footer",
    group: "Page sections",
    components: ["flame-footer"],
    description:
      "The complete footer with navigation, headline, and slow fire.",
    demo: "footer",
  },
  {
    id: "auth-silk",
    title: "Silk sign-in",
    group: "Auth forms",
    components: ["auth-silk"],
    description:
      "A complete sign-in block with validation and submission states.",
    demo: "auth-silk",
  },
  {
    id: "auth-glass",
    title: "Glass sign-in",
    group: "Auth forms",
    components: ["auth-glass"],
    description:
      "A complete sign-in block with validation and submission states.",
    demo: "auth-glass",
  },
  {
    id: "auth-split",
    title: "Split sign-in",
    group: "Auth forms",
    components: ["auth-split"],
    description:
      "A complete sign-in block with validation and submission states.",
    demo: "auth-split",
  },
  {
    id: "auth-steps",
    title: "Step-by-step sign-in",
    group: "Auth forms",
    components: ["auth-steps"],
    description:
      "A complete sign-in block with validation and submission states.",
    demo: "auth-steps",
  },
  { id: "glass-sidebar", title: "Contour sidebar", group: "Navigation", components: ["glass-sidebar", "liquid-search"], description: "A continuous seam opens around each page as you move through the workspace.", demo: "glass-sidebar" },
]

export function getShowcase(name: string) {
  return showcases.find((item) =>
    item.components.some((component) => component === name),
  )
}
