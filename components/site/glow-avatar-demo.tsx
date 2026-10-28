"use client"

import { useState } from "react"
import {
  GlowAvatar,
  type AiBotActivity,
  type AiBotEmotion,
  type AiBotMotion,
  type AiBotShape,
} from "@/components/ui/glow-avatar"
import styles from "./glow-avatar-demo.module.css"

const activities: { value: AiBotActivity; label: string }[] = [
  { value: "idle", label: "Idle" },
  { value: "listening", label: "Listening" },
  { value: "speaking", label: "Speaking" },
]

const expressions: { value: AiBotEmotion; label: string }[] = [
  { value: "neutral", label: "Calm" },
  { value: "thinking", label: "Thinking" },
  { value: "happy", label: "Happy" },
]

const shapes: { value: AiBotShape; label: string }[] = [
  { value: "pebble", label: "Pebble" },
  { value: "circle", label: "Circle" },
  { value: "flower", label: "Flower" },
]

const motions: { value: AiBotMotion; label: string }[] = [
  { value: "jump", label: "Jump" },
  { value: "spin", label: "Spin" },
  { value: "bounce", label: "Bounce" },
]

function ChoiceGroup<T extends string>({
  label,
  value,
  options,
  onChange,
  action = false,
}: {
  label: string
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
  action?: boolean
}) {
  return (
    <fieldset className={styles.group}>
      <legend className={styles.legend}>{label}</legend>
      <div className={styles.choices}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={styles.choice}
            aria-pressed={action ? undefined : value === option.value}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

export function GlowAvatarDemo() {
  const [activity, setActivity] = useState<AiBotActivity>("idle")
  const [emotion, setEmotion] = useState<AiBotEmotion>("happy")
  const [shape, setShape] = useState<AiBotShape>("pebble")
  const [motion, setMotion] = useState<AiBotMotion | null>(null)
  const [motionKey, setMotionKey] = useState(0)

  function playMotion(nextMotion: AiBotMotion) {
    setMotion(nextMotion)
    setMotionKey((key) => key + 1)
  }

  return (
    <div className={styles.demo}>
      <div className={styles.stage}>
        <div className={styles.aura} aria-hidden="true" />
        <GlowAvatar
          className={styles.avatar}
          size={156}
          label="An expressive AI assistant. Move your pointer nearby."
          activity={activity}
          emotion={emotion}
          shape={shape}
          motion={motion}
          motionKey={motionKey}
          followCursor
          lookAround
        />
        <p className={styles.hint} aria-live="polite">
          {activity === "idle" ? "Move your pointer nearby" : activity === "listening" ? "Listening for you" : "Speaking with you"}
        </p>
      </div>

      <div className={styles.controls}>
        <ChoiceGroup label="Activity" value={activity} options={activities} onChange={setActivity} />
        <ChoiceGroup label="Expression" value={emotion} options={expressions} onChange={setEmotion} />
        <ChoiceGroup label="Shape" value={shape} options={shapes} onChange={setShape} />
        <ChoiceGroup
          label="Motion"
          action
          value={motion ?? ""}
          options={motions}
          onChange={(nextMotion) => { if (nextMotion) playMotion(nextMotion) }}
        />
      </div>
    </div>
  )
}
