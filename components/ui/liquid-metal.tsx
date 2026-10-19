"use client"

import * as React from "react"
import { useReducedMotion } from "motion/react"

import { ringMask } from "@/lib/afterglow"
import { cn } from "@/lib/utils"

/*
 * Liquid metal: a slowly flowing metal surface, drawn by a small WebGL shader.
 * The surface is sine waves bent by other sine waves; each pixel reflects a
 * photo-studio backdrop (dark floor, bright horizon), which reads as metal.
 * Softness blurs that horizon, turning mirror chrome into brushed satin.
 *
 * Every piece on the page shares one WebGL context: it draws each piece in
 * turn and copies the frame into that piece's own canvas. Browsers cap live
 * contexts at about 16, so this keeps any number of pieces running.
 */

const VERTEX = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}`

const FRAGMENT = `
precision highp float;
varying vec2 vUv;
uniform vec2 uResolution;
uniform float uTime;
uniform vec3 uTint;
uniform float uBrightness;
uniform float uScale;
uniform float uSoftness;
uniform float uSilk;

// round ripples, like a pool of mercury
float liquid(vec2 p, float t) {
  vec2 q = p;
  q += 0.55 * vec2(sin(q.y * 1.3 + t * 1.1), sin(q.x * 1.1 - t * 0.9));
  q += 0.28 * vec2(sin(q.y * 2.3 - t * 0.7), sin(q.x * 2.1 + t * 1.3));
  return 0.5 * sin(q.x * 1.4 + t * 0.4) + 0.5 * sin(q.y * 1.7 - t * 0.3);
}

// long diagonal folds, like draped silk
float silk(vec2 p, float t) {
  vec2 d = normalize(vec2(1.0, 0.55));
  float u = dot(p, d);
  float v = dot(p, vec2(-d.y, d.x));
  float w = u + 0.45 * sin(v * 0.9 + t * 0.8) + 0.2 * sin(v * 2.1 - t * 0.6);
  return 0.65 * sin(w * 1.7 + t * 0.35) + 0.35 * sin(w * 3.1 - v * 0.4 - t * 0.25);
}

float height(vec2 p, float t) {
  return mix(liquid(p, t), silk(p, t), uSilk);
}

float studio(float y, float soft) {
  float edge = mix(0.03, 0.5, soft);
  float ground = 0.05 + 0.12 * smoothstep(-1.2, -0.15, y);
  float sky = 0.5 + 0.42 * smoothstep(0.05, 1.0, y);
  float v = mix(ground, sky, smoothstep(-edge, edge, y));
  v += mix(0.75, 0.28, soft) * exp(-pow((y - 0.03) * mix(26.0, 3.0, soft), 2.0));
  v += 0.2 * exp(-pow((y - 0.6) * 8.0, 2.0));
  return v;
}

void main() {
  vec2 p = (vUv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0) * 2.2 * uScale;
  float t = uTime * 0.25;
  float e = 0.01;
  float h = height(p, t);
  float dx = (height(p + vec2(e, 0.0), t) - h) / e;
  float dy = (height(p + vec2(0.0, e), t) - h) / e;
  float k = mix(0.8, 0.32, uSoftness);
  vec3 n = normalize(vec3(-dx * k, -dy * k, 1.0));
  vec3 r = reflect(vec3(0.0, 0.0, -1.0), n);
  float y = r.y * 1.1 + p.y * 0.12 + 0.12 + uBrightness;
  float v = studio(y, uSoftness) + mix(0.3, 0.12, uSoftness) * pow(max(r.x, 0.0), 5.0);
  vec3 color = vec3(v);
  color = mix(color, color * uTint, 0.4 * smoothstep(0.35, 1.0, v));
  gl_FragColor = vec4(color, 1.0);
}`

// shown before the first frame, and wherever WebGL isn't available
const CHROME_FALLBACK =
  "conic-gradient(from 200deg at 35% 45%, #18181b, #e9e2da 14%, #2a2a2e 27%, #a29c95 41%, #141416 55%, #f3ece4 69%, #38383c 83%, #18181b)"
const SATIN_FALLBACK =
  "linear-gradient(155deg, #2a2a2e, #8d8984 40%, #d6d1cb 52%, #5a5a5e 75%, #1c1c1f)"

type Settings = {
  speed: number
  tint: [number, number, number]
  brightness: number
  scale: number
  softness: number
  silk: number
  maxAspect: number
  still: boolean
}

type Piece = {
  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
  settings: Settings
  start: number
  visible: boolean
  painted: boolean
}

type Renderer = {
  canvas: HTMLCanvasElement
  gl: WebGLRenderingContext
  uniforms: Record<string, WebGLUniformLocation | null>
}

const pieces = new Set<Piece>()
let renderer: Renderer | null = null
let unavailable = false
let frame = 0

function createRenderer(): Renderer | null {
  const canvas = document.createElement("canvas")
  const gl = canvas.getContext("webgl", { antialias: false, alpha: false })
  if (!gl) return null
  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type)!
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    return shader
  }
  const program = gl.createProgram()!
  gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX))
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT))
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null
  gl.useProgram(program)
  // one triangle that covers the whole viewport
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const position = gl.getAttribLocation(program, "position")
  gl.enableVertexAttribArray(position)
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)
  const names = ["uResolution", "uTime", "uTint", "uBrightness", "uScale", "uSoftness", "uSilk"]
  const uniforms = Object.fromEntries(names.map((name) => [name, gl.getUniformLocation(program, name)]))

  canvas.addEventListener("webglcontextlost", (event) => {
    event.preventDefault()
    cancelAnimationFrame(frame)
    frame = 0
    renderer = null
    for (const piece of pieces) {
      piece.painted = false
      piece.canvas.style.opacity = "0"
    }
    // build a fresh context once the browser has recovered
    window.setTimeout(wake, 1000)
  })
  return { canvas, gl, uniforms }
}

function paint(piece: Piece, now: number) {
  const { canvas, gl, uniforms } = renderer!
  const { width, height } = piece.canvas
  // the shared canvas only grows, and each piece draws into its bottom-left corner
  if (canvas.width < width || canvas.height < height) {
    canvas.width = Math.max(canvas.width, width)
    canvas.height = Math.max(canvas.height, height)
  }
  const s = piece.settings
  gl.viewport(0, 0, width, height)
  gl.uniform2f(uniforms.uResolution, width, height)
  // under reduced motion, hold one pleasing frame
  gl.uniform1f(uniforms.uTime, s.still ? 3 : ((now - piece.start) / 1000) * s.speed + 3)
  gl.uniform3f(uniforms.uTint, ...s.tint)
  gl.uniform1f(uniforms.uBrightness, s.brightness)
  // past maxAspect, ripples stretch across wide shapes instead of repeating
  const aspect = width / height
  gl.uniform1f(uniforms.uScale, s.maxAspect && aspect > s.maxAspect ? (s.scale * s.maxAspect) / aspect : s.scale)
  gl.uniform1f(uniforms.uSoftness, s.softness)
  gl.uniform1f(uniforms.uSilk, s.silk)
  gl.drawArrays(gl.TRIANGLES, 0, 3)
  piece.context.drawImage(canvas, 0, canvas.height - height, width, height, 0, 0, width, height)
  piece.painted = true
  piece.canvas.style.opacity = "1"
}

function tick(now: number) {
  frame = 0
  if (!renderer) return
  let moving = false
  for (const piece of pieces) {
    if (!piece.visible || piece.canvas.width < 2) continue
    if (piece.settings.still && piece.painted) continue
    paint(piece, now)
    if (!piece.settings.still) moving = true
  }
  if (moving) frame = requestAnimationFrame(tick)
}

function wake() {
  if (frame || unavailable) return
  if (!renderer) {
    renderer = createRenderer()
    if (!renderer) {
      unavailable = true
      return
    }
  }
  frame = requestAnimationFrame(tick)
}

type LiquidMetalProps = React.ComponentProps<"div"> & {
  /** 1 is a slow drift */
  speed?: number
  /** warms or cools the highlights, as r, g, b from 0 to 1 */
  tint?: [number, number, number]
  /** 0.5 renders at half resolution, plenty for thin rims */
  quality?: number
  /** shifts the reflection toward the bright sky; 0.8 is mostly silver */
  brightness?: number
  /** below 1 makes the ripples broader, good for small or wide shapes */
  scale?: number
  /** 0 is mirror chrome, 1 is soft brushed satin */
  softness?: number
  /** "silk" lays the ripples out as long diagonal folds */
  pattern?: "liquid" | "silk"
  /** wider than this width-to-height ratio, ripples stretch instead of repeating */
  maxAspect?: number
}

function LiquidMetal({
  speed = 1,
  tint = [1, 0.82, 0.66],
  quality = 1,
  brightness = 0,
  scale = 1,
  softness = 0,
  pattern = "liquid",
  maxAspect = 0,
  className,
  style,
  ...props
}: LiquidMetalProps) {
  const reduceMotion = useReducedMotion()
  const rootRef = React.useRef<HTMLDivElement>(null)
  const [r, g, b] = tint

  React.useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const canvas = document.createElement("canvas")
    canvas.className = "absolute inset-0 size-full opacity-0 transition-opacity duration-300"
    const context = canvas.getContext("2d", { alpha: false })
    if (!context) return
    root.appendChild(canvas)

    const piece: Piece = {
      canvas,
      context,
      settings: {
        speed,
        tint: [r, g, b],
        brightness,
        scale,
        softness,
        silk: pattern === "silk" ? 1 : 0,
        maxAspect,
        still: !!reduceMotion,
      },
      start: performance.now(),
      visible: false,
      painted: false,
    }
    pieces.add(piece)

    const visibility = new IntersectionObserver(([entry]) => {
      piece.visible = entry.isIntersecting
      if (piece.visible) wake()
    })
    visibility.observe(canvas)

    const sizing = new ResizeObserver(() => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2) * quality
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * ratio))
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * ratio))
      // resizing clears the canvas, so paint again
      piece.painted = false
      wake()
    })
    sizing.observe(canvas)

    return () => {
      visibility.disconnect()
      sizing.disconnect()
      pieces.delete(piece)
      canvas.remove()
    }
  }, [b, brightness, g, maxAspect, pattern, quality, r, reduceMotion, scale, softness, speed])

  return (
    <div
      ref={rootRef}
      data-slot="liquid-metal"
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]", className)}
      style={{ background: softness >= 0.5 ? SATIN_FALLBACK : CHROME_FALLBACK, ...style }}
      {...props}
    />
  )
}

type MetalRimProps = Omit<React.ComponentProps<"span">, "children"> & {
  /** thickness of the ring in px */
  width?: number
  brightness?: number
  quality?: number
}

/*
 * A hairline of chrome around its parent (give the parent a radius and
 * position). A steady edge, lit from above, sits under the moving metal; the
 * metal is screen-blended on top, so its dark patches never break the ring.
 */
function MetalRim({ width = 1, brightness = 0.35, quality = 0.6, className, style, ...props }: MetalRimProps) {
  return (
    <span
      aria-hidden
      data-slot="metal-rim"
      className={cn("pointer-events-none absolute inset-0 rounded-[inherit]", className)}
      style={{ ...ringMask, padding: width, ...style }}
      {...props}
    >
      <span className="absolute inset-0 rounded-[inherit] bg-[linear-gradient(180deg,oklch(0.78_0.01_80),oklch(0.36_0.004_285)_40%,oklch(0.3_0.004_285)_70%,oklch(0.55_0.006_80))]" />
      <LiquidMetal className="mix-blend-screen" quality={quality} brightness={brightness} maxAspect={3.2} />
    </span>
  )
}

export { LiquidMetal, MetalRim, type LiquidMetalProps, type MetalRimProps }
