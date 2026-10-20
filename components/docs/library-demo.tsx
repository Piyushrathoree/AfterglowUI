"use client"

import dynamic from "next/dynamic"
import { getShowcase } from "@/lib/docs/showcases"
import type { ComponentName } from "@/lib/docs/catalog"

const scenes = {
  "glass-sidebar": dynamic(() => import("./showcases/glass-sidebar")),
  controls: dynamic(() => import("./showcases/controls"), {
    loading: () => (
      <p role="status" className="ag-demo-loading">
        Loading preview…
      </p>
    ),
  }),
  desktop: dynamic(() => import("./showcases/desktop"), {
    loading: () => (
      <p role="status" className="ag-demo-loading">
        Loading preview…
      </p>
    ),
  }),
  phone: dynamic(() => import("./showcases/phone"), {
    loading: () => (
      <p role="status" className="ag-demo-loading">
        Loading preview…
      </p>
    ),
  }),
  lens: dynamic(() => import("./showcases/lens"), {
    loading: () => (
      <p role="status" className="ag-demo-loading">
        Loading preview…
      </p>
    ),
  }),
  "metal-hero": dynamic(() => import("./showcases/metal-hero"), {
    loading: () => (
      <p role="status" className="ag-demo-loading">
        Loading preview…
      </p>
    ),
  }),
  "metal-card": dynamic(() => import("./showcases/metal-card"), {
    loading: () => (
      <p role="status" className="ag-demo-loading">
        Loading preview…
      </p>
    ),
  }),
  "metal-pass": dynamic(() => import("./showcases/metal-pass"), {
    loading: () => (
      <p role="status" className="ag-demo-loading">
        Loading preview…
      </p>
    ),
  }),
  gloss: dynamic(() => import("./showcases/gloss"), {
    loading: () => (
      <p role="status" className="ag-demo-loading">
        Loading preview…
      </p>
    ),
  }),
  sheen: dynamic(() => import("./showcases/sheen"), {
    loading: () => (
      <p role="status" className="ag-demo-loading">
        Loading preview…
      </p>
    ),
  }),
  fan: dynamic(() => import("./showcases/fan"), {
    loading: () => (
      <p role="status" className="ag-demo-loading">
        Loading preview…
      </p>
    ),
  }),
  switches: dynamic(() => import("./showcases/switches"), {
    loading: () => (
      <p role="status" className="ag-demo-loading">
        Loading preview…
      </p>
    ),
  }),
  sliders: dynamic(() => import("./showcases/sliders"), {
    loading: () => (
      <p role="status" className="ag-demo-loading">
        Loading preview…
      </p>
    ),
  }),
  toasts: dynamic(() => import("./showcases/toasts"), {
    loading: () => (
      <p role="status" className="ag-demo-loading">
        Loading preview…
      </p>
    ),
  }),
  deploy: dynamic(() => import("./showcases/deploy"), {
    loading: () => (
      <p role="status" className="ag-demo-loading">
        Loading preview…
      </p>
    ),
  }),
  copy: dynamic(() => import("./showcases/copy"), {
    loading: () => (
      <p role="status" className="ag-demo-loading">
        Loading preview…
      </p>
    ),
  }),
  tabs: dynamic(() => import("./showcases/tabs"), {
    loading: () => (
      <p role="status" className="ag-demo-loading">
        Loading preview…
      </p>
    ),
  }),
  accent: dynamic(() => import("./showcases/accent"), {
    loading: () => (
      <p role="status" className="ag-demo-loading">
        Loading preview…
      </p>
    ),
  }),
  flame: dynamic(() => import("./showcases/flame"), {
    loading: () => (
      <p role="status" className="ag-demo-loading">
        Loading preview…
      </p>
    ),
  }),
  dock: dynamic(() => import("./showcases/dock"), {
    loading: () => (
      <p role="status" className="ag-demo-loading">
        Loading preview…
      </p>
    ),
  }),
  navigation: dynamic(() => import("./showcases/navigation"), {
    loading: () => (
      <p role="status" className="ag-demo-loading">
        Loading preview…
      </p>
    ),
  }),
  chat: dynamic(() => import("./showcases/chat"), {
    loading: () => (
      <p role="status" className="ag-demo-loading">
        Loading preview…
      </p>
    ),
  }),
  footer: dynamic(() => import("./showcases/footer"), {
    loading: () => (
      <p role="status" className="ag-demo-loading">
        Loading preview…
      </p>
    ),
  }),
  "auth-silk": dynamic(() => import("./showcases/auth-silk"), {
    loading: () => (
      <p role="status" className="ag-demo-loading">
        Loading preview…
      </p>
    ),
  }),
  "auth-glass": dynamic(() => import("./showcases/auth-glass"), {
    loading: () => (
      <p role="status" className="ag-demo-loading">
        Loading preview…
      </p>
    ),
  }),
  "auth-split": dynamic(() => import("./showcases/auth-split"), {
    loading: () => (
      <p role="status" className="ag-demo-loading">
        Loading preview…
      </p>
    ),
  }),
  "auth-steps": dynamic(() => import("./showcases/auth-steps"), {
    loading: () => (
      <p role="status" className="ag-demo-loading">
        Loading preview…
      </p>
    ),
  }),
}
const foundations = {
  "afterglow-theme": dynamic(() => import("./examples/afterglow-theme")),
  "rail-path": dynamic(() => import("./examples/rail-path")),
  "auth-parts": dynamic(() => import("./examples/auth-parts")),
}

export function LibraryDemo({ name }: { name: ComponentName }) {
  const scene = getShowcase(name)
  if (scene) {
    const Scene = scenes[scene.demo as keyof typeof scenes]
    return <Scene />
  }
  const Foundation = foundations[name as keyof typeof foundations]
  return Foundation ? (
    <div className="ag-showcase">
      <Foundation />
    </div>
  ) : null
}
