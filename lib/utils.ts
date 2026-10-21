import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"
import { withConcentric } from "tailwindcss-concentric/merge"

// rounded-concentric classes conflict with rounded-* the way any other radius would
const twMerge = extendTailwindMerge(withConcentric)

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
