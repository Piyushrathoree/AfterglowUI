"use client"

import * as React from "react"

// the geometry that the rail components share: a path drawn through the centre of every row,
// stepping sideways with rounded elbows where a row is indented, and a short curved hook that
// turns off the rail into a row

type RailRow = { x: number; y: number }

type RailTrack = {
  /** the full path, from the first row to the last */
  d: string
  /** how far along the path each row sits, in px */
  at: number[]
  total: number
}

/** a path through every row. rows that sit at a different x get a rounded jog halfway between them */
function buildTrack(rows: RailRow[], radius = 7, bend: "rounded" | "diagonal" = "rounded"): RailTrack {
  if (!rows.length) return { d: "", at: [], total: 0 }
  let d = `M ${rows[0].x} ${rows[0].y}`
  let length = 0
  const at = [0]
  for (let i = 1; i < rows.length; i++) {
    const a = rows[i - 1]
    const b = rows[i]
    if (a.x === b.x) {
      d += ` V ${b.y}`
      length += b.y - a.y
    } else {
      if (bend === "diagonal") {
        const mid = (a.y + b.y) / 2
        const half = Math.min(Math.abs(b.x - a.x) / 2, (b.y - a.y) / 4)
        d += ` V ${mid - half} L ${b.x} ${mid + half} V ${b.y}`
        length += b.y - a.y - 2 * half + Math.hypot(b.x - a.x, 2 * half)
        at.push(length)
        continue
      }
      const dir = b.x > a.x ? 1 : -1
      const dx = Math.abs(b.x - a.x)
      const r = Math.min(radius, dx / 2, (b.y - a.y) / 4)
      const mid = (a.y + b.y) / 2
      d += ` V ${mid - r} A ${r} ${r} 0 0 ${dir === 1 ? 0 : 1} ${a.x + dir * r} ${mid} H ${b.x - dir * r}`
      d += ` A ${r} ${r} 0 0 ${dir === 1 ? 1 : 0} ${b.x} ${mid + r} V ${b.y}`
      length += mid - r - a.y + (Math.PI * r) / 2 + (dx - 2 * r) + (Math.PI * r) / 2 + (b.y - mid - r)
    }
    at.push(length)
  }
  return { d, at, total: length }
}

/** how far along the track a position is, where 1.5 means halfway between the second and third row */
function lengthAt(track: RailTrack, position: number) {
  if (!track.at.length) return 0
  const clamped = Math.min(Math.max(position, 0), track.at.length - 1)
  const index = Math.min(Math.floor(clamped), track.at.length - 2)
  if (index < 0) return 0
  const t = clamped - index
  return track.at[index] + (track.at[index + 1] - track.at[index]) * t
}

/**
 * measures the centre of each `[data-rail-row]` inside the list. a row's `data-depth` shifts it
 * sideways by `step` px. returns null until the first measure, so nothing is drawn on the server
 */
function useRailRows(list: React.RefObject<HTMLElement | null>, x: number, step: number, watch: unknown) {
  const [rows, setRows] = React.useState<RailRow[] | null>(null)

  React.useEffect(() => {
    const node = list.current
    if (!node) return
    let frame = 0
    const measure = () => {
      frame = 0
      const found = Array.from(node.querySelectorAll<HTMLElement>("[data-rail-row]"))
      setRows(
        found.map((row) => ({
          x: x + Number(row.dataset.depth ?? 0) * step,
          y: row.offsetTop + row.offsetHeight / 2,
        }))
      )
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure)
    }
    schedule()
    const observer = new ResizeObserver(schedule)
    observer.observe(node)
    node.querySelectorAll("[data-rail-row]").forEach((row) => observer.observe(row))
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [list, x, step, watch])

  return rows
}

export { buildTrack, lengthAt, useRailRows, type RailRow, type RailTrack }
