"use client"

import * as React from "react"
import {
  isMotionValue,
  motion,
  useMotionValue,
  useTransform,
  type MotionValue,
} from "motion/react"

import { ringMask } from "@/lib/afterglow"
import { cn } from "@/lib/utils"

/*
 * Liquid glass: a pane that bends whatever sits behind it, like Apple's
 * Liquid Glass. The rim is a curved lens, so content near the edges is
 * pulled inward, while the flat middle stays clear.
 *
 * Refraction is an SVG displacement map used as a backdrop-filter, which only
 * Chromium supports. Other browsers get a frosted fallback with the same rim.
 */

const SAMPLES = 128
const INDEX_OF_REFRACTION = 1.5

// convex squircle: flat in the middle, rounding off toward the rim
const surface = (x: number) => Math.pow(1 - Math.pow(1 - x, 4), 0.25)

// how far a straight-down ray is bent sideways at each point across the rim
function rimProfile(bezel: number) {
  const profile = new Float32Array(SAMPLES)
  for (let i = 0; i < SAMPLES; i++) {
    const x = i / (SAMPLES - 1)
    const a = Math.max(x - 0.001, 0)
    const b = Math.min(x + 0.001, 1)
    const slope = (surface(b) - surface(a)) / (b - a)
    const incident = Math.atan(slope)
    const refracted = Math.asin(Math.sin(incident) / INDEX_OF_REFRACTION)
    const thickness = bezel * (0.25 + surface(x))
    profile[i] = thickness * Math.tan(incident - refracted)
  }
  return profile
}

type DisplacementMap = { url: string; scale: number }
const maps = new Map<string, DisplacementMap>()

function displacementMap(
  width: number,
  height: number,
  radius: number,
  bezel: number,
  magnify: number
): DisplacementMap {
  const key = [width, height, radius, bezel, magnify].join(":")
  const cached = maps.get(key)
  if (cached) return cached

  const profile = rimProfile(bezel)
  const dx = new Float32Array(width * height)
  const dy = new Float32Array(width * height)
  let max = 0

  for (let j = 0; j < height; j++) {
    for (let i = 0; i < width; i++) {
      // signed distance to a rounded rectangle, and the outward normal
      const px = i + 0.5 - width / 2
      const py = j + 0.5 - height / 2
      const qx = Math.abs(px) - width / 2 + radius
      const qy = Math.abs(py) - height / 2 + radius
      const inside =
        -(Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) +
          Math.min(Math.max(qx, qy), 0) -
          radius)
      let nx = 0
      let ny = 0
      if (qx > 0 && qy > 0) {
        const length = Math.hypot(qx, qy) || 1
        nx = (qx / length) * Math.sign(px)
        ny = (qy / length) * Math.sign(py)
      } else if (qx > qy) nx = Math.sign(px)
      else ny = Math.sign(py)

      let x = -px * magnify
      let y = -py * magnify
      if (inside >= 0 && inside < bezel) {
        // sample inward, so the rim shows what's just inside the edge
        const shift = profile[Math.round((inside / bezel) * (SAMPLES - 1))]
        x -= nx * shift
        y -= ny * shift
      }
      const k = j * width + i
      dx[k] = x
      dy[k] = y
      max = Math.max(max, Math.abs(x), Math.abs(y))
    }
  }

  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext("2d")
  if (!context) return { url: "", scale: 0 }
  const image = context.createImageData(width, height)
  for (let k = 0; k < width * height; k++) {
    // 128 is "no shift"; red moves along x, green along y
    image.data[k * 4] = 128 + (dx[k] / (max || 1)) * 127
    image.data[k * 4 + 1] = 128 + (dy[k] / (max || 1)) * 127
    image.data[k * 4 + 2] = 128
    image.data[k * 4 + 3] = 255
  }
  context.putImageData(image, 0, 0)

  const map = { url: canvas.toDataURL(), scale: max * 2 }
  if (maps.size > 48) maps.delete(maps.keys().next().value!)
  maps.set(key, map)
  return map
}

// only Chromium can use an SVG filter as a backdrop-filter
function canRefract() {
  const nav = navigator as Navigator & {
    userAgentData?: { brands: { brand: string }[] }
  }
  if (nav.userAgentData) {
    return nav.userAgentData.brands.some((b) => b.brand === "Chromium")
  }
  return /Chrome\/\d+/.test(nav.userAgent) && !/Firefox|FxiOS/.test(nav.userAgent)
}

const noopSubscribe = () => () => {}

function useCanRefract() {
  return React.useSyncExternalStore(noopSubscribe, canRefract, () => false)
}

type LiquidGlassProps = React.ComponentProps<"div"> & {
  /** width of the curved rim in px, defaults to the corner radius (max 24) */
  bezel?: number
  /** 0 is flat glass, 1 is the full lens; pass a motion value to animate it */
  refraction?: number | MotionValue<number>
  /** zooms the middle like a magnifier, 0 to 0.3 */
  magnify?: number
  /** blur behind the glass in px */
  frost?: number
  /** a color mixed over the glass, e.g. for a tinted primary button */
  tint?: string
  /**
   * fades the whole pane in and out. Never fade a parent of liquid glass
   * instead: an ancestor with opacity cuts the glass off from what's behind it.
   */
  presence?: number | MotionValue<number>
}

function LiquidGlass({
  bezel,
  refraction = 1,
  magnify = 0,
  frost = 1,
  tint,
  presence = 1,
  className,
  children,
  ...props
}: LiquidGlassProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const displaceRef = React.useRef<SVGFEDisplacementMapElement>(null)
  const id = `liquid-${React.useId().replace(/[^a-zA-Z0-9_-]/g, "")}`
  const canRefractHere = useCanRefract()
  // A fixed zero opts out of SVG backdrop sampling entirely. Native frosting avoids
  // clipped-backdrop seams when flat panes overlap and change stacking order.
  // Motion values still keep the map ready so they can animate away from zero.
  const refract = canRefractHere && (typeof refraction !== "number" || refraction > 0)
  const [shape, setShape] = React.useState<{ w: number; h: number; r: number }>()
  // the scale last written to the filter, so a no-op resize can put it back
  const applied = React.useRef(0)

  React.useEffect(() => {
    const node = ref.current
    if (!node || !refract) return
    const measure = () => {
      const w = Math.round(node.offsetWidth)
      const h = Math.round(node.offsetHeight)
      const raw = getComputedStyle(node).borderTopLeftRadius
      const value = parseFloat(raw) || 0
      const r = Math.round(
        Math.min(raw.endsWith("%") ? (value / 100) * Math.min(w, h) : value, w / 2, h / 2)
      )
      setShape((prev) => {
        if (prev?.w === w && prev.h === h && prev.r === r) {
          displaceRef.current?.setAttribute("scale", String(applied.current))
          return prev
        }
        return { w, h, r }
      })
    }
    // measure right away, then wait for resizing to settle before rebuilding the map
    let first = true
    let frame = 0
    let timer = 0
    const observer = new ResizeObserver(() => {
      if (first) {
        first = false
        measure()
        return
      }
      // until the new map is ready, the old one would bend the wrong pixels
      displaceRef.current?.setAttribute("scale", "0")
      window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        frame = requestAnimationFrame(measure)
      }, 100)
    })
    observer.observe(node)
    return () => {
      observer.disconnect()
      window.clearTimeout(timer)
      cancelAnimationFrame(frame)
    }
  }, [refract])

  const map = React.useMemo(() => {
    if (!refract || !shape || shape.w < 2 || shape.h < 2) return undefined
    const rim = Math.max(1, Math.min(bezel ?? Math.min(shape.r, 24), shape.w / 2, shape.h / 2))
    return displacementMap(shape.w, shape.h, shape.r, Math.round(rim), magnify)
  }, [bezel, magnify, refract, shape])

  // animate refraction by scaling the filter, without rebuilding the map
  React.useEffect(() => {
    if (!map) return
    const apply = (v: number) => {
      applied.current = map.scale * v
      displaceRef.current?.setAttribute("scale", String(applied.current))
    }
    if (typeof refraction === "number") {
      apply(refraction)
      return
    }
    apply(refraction.get())
    return refraction.on("change", apply)
  }, [map, refraction])

  const ownPresence = useMotionValue(isMotionValue(presence) ? 1 : presence)
  const visible = isMotionValue(presence) ? presence : ownPresence
  React.useEffect(() => {
    if (!isMotionValue(presence)) ownPresence.set(presence)
  }, [ownPresence, presence])
  const rimOpacity = useTransform(visible, (v) => v * 0.95)

  const strength = isMotionValue(refraction) ? refraction.get() : refraction
  const backdrop = map
    ? `url(#${id})`
    : `blur(${Math.max(frost, 10)}px) saturate(1.6)`

  return (
    <div
      ref={ref}
      data-slot="liquid-glass"
      // no isolation here: an isolated parent cuts the glass off from the scene
      // behind it in Chrome. Layers stack in source order, and direct children
      // are made relative so they sit on top (wrap an absolute child to keep it).
      className={cn("relative [&>:where(:not([data-glass-layer]))]:relative", className)}
      {...props}
    >
      {map && (
        <svg data-glass-layer aria-hidden width="0" height="0" className="pointer-events-none absolute">
          <filter id={id} colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation={frost} result="frost" />
            <feImage
              href={map.url}
              x="0"
              y="0"
              width={shape?.w}
              height={shape?.h}
              preserveAspectRatio="none"
              result="map"
            />
            <feDisplacementMap
              ref={displaceRef}
              in="frost"
              in2="map"
              scale={map.scale * strength}
              xChannelSelector="R"
              yChannelSelector="G"
              result="bent"
            />
            {/* glass makes what's behind it a little brighter and more vivid */}
            <feColorMatrix in="bent" type="saturate" values="1.45" result="vivid" />
            <feComponentTransfer in="vivid">
              <feFuncR type="linear" slope="1.05" />
              <feFuncG type="linear" slope="1.05" />
              <feFuncB type="linear" slope="1.05" />
            </feComponentTransfer>
          </filter>
        </svg>
      )}
      <motion.div
        data-glass-layer
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[0_10px_30px_-10px_var(--liquid-shadow),0_2px_8px_-2px_var(--liquid-shadow)]"
        style={{ opacity: visible }}
      />
      <motion.div
        data-glass-layer
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{
          backdropFilter: backdrop,
          WebkitBackdropFilter: backdrop,
          opacity: visible,
        }}
      />
      {/* tint, heavier when there's no refraction so text stays legible */}
      <motion.div
        data-glass-layer
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 rounded-[inherit] bg-(--liquid-tint)",
          !map && "bg-(--liquid-fallback)"
        )}
        style={tint ? { background: tint, opacity: visible } : { opacity: visible }}
      />
      {/* volume: light gathers inside the top edge, shade settles along the bottom */}
      <motion.div
        data-glass-layer
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_1px_16px_-4px_var(--liquid-glow),inset_0_-12px_20px_-14px_var(--liquid-shade)]"
        style={{ opacity: visible }}
      />
      {/* rim light: bright where the light comes from (top left), softer opposite */}
      <motion.div
        data-glass-layer
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_0.5px_var(--liquid-edge),inset_1px_1.5px_1px_-1px_var(--liquid-rim),inset_-1px_-1.5px_1px_-1px_color-mix(in_oklch,var(--liquid-rim)_45%,transparent)]"
        style={{ opacity: visible }}
      />
      <motion.div
        data-glass-layer
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] p-px"
        style={{
          ...ringMask,
          background:
            "conic-gradient(from 300deg, var(--liquid-rim), transparent 70deg, transparent 110deg, color-mix(in oklch, var(--liquid-rim) 55%, transparent) 180deg, transparent 250deg, transparent 290deg, var(--liquid-rim))",
          opacity: rimOpacity,
        }}
      />
      {children}
    </div>
  )
}

export { LiquidGlass, useCanRefract, type LiquidGlassProps }
