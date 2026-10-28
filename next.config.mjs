import { createMDX } from "fumadocs-mdx/next"

/** @type {import('next').NextConfig} */
const nextConfig = {
  // lets a phone on the same wifi (or tailscale) hydrate the dev site
  allowedDevOrigins: ["192.168.*.*", "100.*.*.*", "*.local"],
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "**/globals.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
}

const withMDX = createMDX({ macro: false })

export default withMDX(nextConfig)
