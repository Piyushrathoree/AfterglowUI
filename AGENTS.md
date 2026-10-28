<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Nested corners: tailwindcss-concentric

Every rounded element inside another rounded element must be concentric: inner radius = outer radius − the gap between them (padding + border). Do this with [tailwindcss-concentric](https://tailwindcss-concentric.diip3sh.xyz/), never by hand-picking a smaller radius.

- Set up already: `tailwindcss-concentric` is a dependency, `app/globals.css` imports it after Tailwind, and `cn()` in `lib/utils.ts` uses its tailwind-merge helper.
- Parent keeps its normal classes (`rounded-3xl border p-2`). The child gets `rounded-concentric` (or a side/corner form like `rounded-t-concentric`). Never copy the parent's radius onto the child, and never write `rounded-[calc(...)]`.
- The plugin reads only Tailwind classes on the nearest `rounded` ancestor and the nearest wrapper. Padding from inline styles or custom CSS needs an explicit gap: `rounded-concentric-2` / `rounded-concentric-[6px]`. With two padded wrappers, give the outer one `rounded-concentric` too.
- Pills stay pills: a `rounded-full` parent passes a pill down. Unequal padding (`px-4 py-2`) can use `concentric-elliptical`. Set `[--concentric-floor:4px]` where a corner would go fully square.
- Plain CSS files (`components/docs/library.css`, `app/docs/docs.css`) can't use the class. Apply the same rule by hand there: `calc(var(--outer-r) - var(--pad))`.
- Registry components (`components/ui`, `components/blocks`) ship to other projects. If one uses `rounded-concentric`, give that item in `registry.json` `"dependencies": ["tailwindcss-concentric"]` and `"css": { "@import \"tailwindcss-concentric\"": {} }` (the shadcn CLI installs both for the user), then run `npx shadcn build`. `glass-sidebar` and `liquid-search` already do.
- Elements that sit mid-panel, not in a corner, can keep their own radius: put a `{/* concentric-ignore: why */}` comment right before them so the audit stays clean.
- Check existing code with `npx tailwindcss-concentric audit components app`.

## Icons: animate-ui animated icons

Every icon in the app is an animated icon from [animate-ui](https://animate-ui.com/docs/icons), not a static `lucide-react` icon.

- Import from `@/components/animate-ui/icons/<name>` (e.g. `import { Bell } from "@/components/animate-ui/icons/bell"`). Add a missing one with `npx shadcn@latest add @animate-ui/icons-<name>`; if the registry 404s, copy it from the animate-ui repo (`apps/v2/registry/icons/<name>/index.tsx`) and point its import at `@/components/animate-ui/icons/icon`. When the CLI offers to overwrite `components/animate-ui/icons/icon.tsx`, decline, then check `git diff components/animate-ui/icons/icon.tsx` shows the patch is still there.
- Our copy of the core (`components/animate-ui/icons/icon.tsx`) is patched: default size 24 and `aria-hidden` like lucide, and an icon with no trigger props plays while its closest link/button/tab is hovered or keyboard-focused. So app code just writes `<Bell />`. Pass `animate={false}` where the parent already animates the icon (trail-tabs gestures).
- Registry components (`components/ui`, `components/blocks`) ship with the stock core, which has no auto trigger. Wrap the interactive element in `<AnimateIcon animateOnHover asChild>`, give each icon `aria-hidden` and an explicit size (the stock default is 28), and list each icon in the item's `registryDependencies` as `@animate-ui/icons-<name>`. Never add `components/animate-ui/**` to an item's `files`: animate-ui's license forbids redistributing its components, so users must fetch them from animate-ui.
- Icons animate-ui doesn't have (or hasn't published, for registry components) stay on `lucide-react`.
- Docs usage snippets (`components/docs/examples`) keep `lucide-react` so readers can paste them without extra installs.

## Component motion: micro-interaction skill

- Before creating or changing any component, read and apply `.agents/skills/micro-interaction/SKILL.md` as the motion and interaction checklist. This applies to every component in `components/ui`, `components/blocks`, and their demos.
- For each component, consider hover, press, focus, state changes, and enter/exit behavior. Add motion only when it clarifies feedback or continuity; keep static components calm when motion would be decorative.
- Keep feedback quick, favor `transform` and `opacity`, and honor `prefers-reduced-motion`. For menus, drawers, toasts, lists, and other stateful interactions, use the skill's enter/exit and stable-state guidance.
- When updating an existing component, review its current motion against the skill and keep the interaction consistent with Afterglow's restrained liquid-glass style.
- For web interface design and motion, consult `.agents/skills/apple-design/SKILL.md` and `.agents/skills/animation-principles/SKILL.md` when relevant; favor immediate, interruptible feedback and restrained movement.
- Use `.agents/skills/gsap-core/SKILL.md` or `.agents/skills/gsap-scrolltrigger/SKILL.md` when working with GSAP or its scroll triggers. Keep the existing Motion/CSS approach when it already meets the need; add dependencies only when necessary.
- Use `.agents/skills/apple-native-ui/SKILL.md` for native Apple platform work, and `.agents/skills/remotion-interactivity/SKILL.md` for Remotion Studio compositions. Do not apply platform-specific instructions to unrelated web components.
