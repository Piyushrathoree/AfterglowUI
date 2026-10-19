"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

// One slow-moving field of accent color; the themed surface shows through the soft edge.
const vertex = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`

const fragment = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec3 uColor;

void main(){
  vec2 uv=gl_FragCoord.xy/uRes;
  float t=uTime;
  float wave=.42+.10*sin(uv.x*6.283-t*.75)+.07*sin(uv.x*12.566+t*.48)+.025*sin(t*.60);
  float coverage=smoothstep(-.13,.10,wave-uv.y);
  // A wider accent halo follows the crest and fades into the themed background.
  float glow=.65*(1.-smoothstep(0.,.50,max(uv.y-wave,0.)));
  coverage+=(1.-coverage)*glow;
  gl_FragColor=vec4(uColor,coverage);
}`

// the browser does the colour maths: paint one pixel with the css colour and read it back as rgb
function readColor(element: Element, scratch: CanvasRenderingContext2D): [number, number, number] {
  const css = getComputedStyle(element).getPropertyValue("--glow").trim() || "oklch(0.8 0.16 55)"
  scratch.clearRect(0, 0, 1, 1)
  scratch.fillStyle = css
  scratch.fillRect(0, 0, 1, 1)
  const [r, g, b] = scratch.getImageData(0, 0, 1, 1).data
  return [r / 255, g / 255, b / 255]
}

type FlameFieldProps = React.ComponentProps<"div"> & {
  /** movement multiplier; defaults to 0.35 for slow, rolling waves */
  speed?: number
  /** how much smaller than the screen it is drawn; higher is softer and cheaper */
  softness?: number
}

function FlameField({ speed = 0.35, softness = 2.5, className, ...props }: FlameFieldProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const initialize = () => {
      // A failed or lost context leaves the themed background visible underneath.
      canvas.style.opacity = "0"
      const gl = canvas.getContext("webgl", { antialias: false, alpha: true, premultipliedAlpha: false, powerPreference: "low-power" })
      const scratch = document.createElement("canvas")
      scratch.width = scratch.height = 1
      const paint = scratch.getContext("2d", { willReadFrequently: true })
      if (!gl || !paint || gl.isContextLost()) return () => {}

      const compile = (type: number, source: string) => {
        const shader = gl.createShader(type)
        if (!shader) return null
        gl.shaderSource(shader, source)
        gl.compileShader(shader)
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          gl.deleteShader(shader)
          return null
        }
        return shader
      }
      const vertexShader = compile(gl.VERTEX_SHADER, vertex)
      const fragmentShader = compile(gl.FRAGMENT_SHADER, fragment)
      const program = gl.createProgram()
      if (!program || !vertexShader || !fragmentShader) {
        gl.deleteShader(vertexShader)
        gl.deleteShader(fragmentShader)
        gl.deleteProgram(program)
        return () => {}
      }
      gl.attachShader(program, vertexShader)
      gl.attachShader(program, fragmentShader)
      gl.linkProgram(program)
      gl.deleteShader(vertexShader)
      gl.deleteShader(fragmentShader)
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        gl.deleteProgram(program)
        return () => {}
      }
      gl.useProgram(program)

      const buffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
      const position = gl.getAttribLocation(program, "p")
      gl.enableVertexAttribArray(position)
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)
      const uRes = gl.getUniformLocation(program, "uRes")
      const uTime = gl.getUniformLocation(program, "uTime")
      const uColor = gl.getUniformLocation(program, "uColor")

      const motion = window.matchMedia("(prefers-reduced-motion: reduce)")
      let still = motion.matches
      let targetColor = readColor(canvas, paint)
      let color = [...targetColor]
      let visible = false
      let frame = 0
      let last = 0
      let elapsed = 8
      const resolution = Number.isFinite(softness) ? Math.max(1, softness) : 2.5
      const rate = Number.isFinite(speed) ? Math.max(0, speed) : 0.35

      const resize = () => {
        const width = Math.max(Math.round(canvas.clientWidth / resolution), 2)
        const height = Math.max(Math.round(canvas.clientHeight / resolution), 2)
        // Bound GPU work on large displays without changing the flame geometry.
        const scale = Math.min(1, Math.sqrt(300000 / (width * height)))
        canvas.width = Math.max(2, Math.round(width * scale))
        canvas.height = Math.max(2, Math.round(height * scale))
        gl.viewport(0, 0, canvas.width, canvas.height)
      }
      const draw = () => {
        gl.uniform2f(uRes, canvas.width, canvas.height)
        gl.uniform1f(uTime, elapsed)
        gl.uniform3f(uColor, color[0], color[1], color[2])
        gl.drawArrays(gl.TRIANGLES, 0, 3)
        if (canvas.style.opacity !== "1") canvas.style.opacity = "1"
      }
      const loop = (time: number) => {
        // Use every display frame. Clamp stalls and reset the clock after a pause.
        const delta = last ? Math.min((time - last) / 1000, .05) : 0
        last = time
        elapsed += delta * rate
        const blend = 1 - Math.exp(-delta * 9)
        color = color.map((value, i) => value + (targetColor[i] - value) * blend)
        draw()
        frame = requestAnimationFrame(loop)
      }
      const start = () => {
        cancelAnimationFrame(frame)
        last = 0
        if (!visible || document.hidden) return
        if (still) {
          color = [...targetColor]
        }
        draw()
        if (!still) frame = requestAnimationFrame(loop)
      }
      const changeMotion = () => {
        still = motion.matches
        start()
      }
      motion.addEventListener("change", changeMotion)
      document.addEventListener("visibilitychange", start)

      const watchColor = new MutationObserver(() => {
        targetColor = readColor(canvas, paint)
        if (still) {
          color = [...targetColor]
          if (visible && !document.hidden) draw()
        }
      })
      // Observe each ancestor so local accent overrides work as well as the page picker.
      for (let element: Element | null = canvas.parentElement; element; element = element.parentElement) {
        watchColor.observe(element, { attributes: true, attributeFilter: ["class", "style"] })
      }
      const watchView = new IntersectionObserver(([entry]) => {
        if (!visible && entry.isIntersecting) {
          color = [...targetColor]
        }
        visible = entry.isIntersecting
        start()
      })
      watchView.observe(canvas)
      const watchSize = new ResizeObserver(() => {
        resize()
        if (visible && !document.hidden) draw()
      })
      watchSize.observe(canvas)
      resize()

      return () => {
        cancelAnimationFrame(frame)
        watchColor.disconnect()
        watchView.disconnect()
        watchSize.disconnect()
        motion.removeEventListener("change", changeMotion)
        document.removeEventListener("visibilitychange", start)
        gl.deleteBuffer(buffer)
        gl.deleteProgram(program)
      }
    }

    let dispose = initialize()
    const onLost = (event: Event) => {
      event.preventDefault()
      dispose()
      canvas.style.opacity = "0"
    }
    const onRestored = () => { dispose = initialize() }
    canvas.addEventListener("webglcontextlost", onLost)
    canvas.addEventListener("webglcontextrestored", onRestored)
    return () => {
      dispose()
      canvas.removeEventListener("webglcontextlost", onLost)
      canvas.removeEventListener("webglcontextrestored", onRestored)
    }
  }, [softness, speed])

  return (
    <div
      data-slot="flame-field"
      aria-hidden
      className={cn(
        "pointer-events-none relative overflow-hidden bg-white dark:bg-black",
        className
      )}
      {...props}
    >
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />
    </div>
  )
}

export { FlameField, type FlameFieldProps }
