# Afterglow UI

Animated, copy-paste React components with a light-and-glow design language.

> Work in progress.

## Development

```bash
pnpm install
pnpm dev
```

Open `/docs` for the documentation or `/docs/components/fan-cards` for the first team-card example. The gallery remains at `/`.

## Documentation

The docs use Fumadocs Core and MDX with a custom component workspace: a liquid-glass Rail TOC sidebar, a central preview, and a spacious animated Docs/Code panel. The sidebar follows the homepage’s 26 composed showcases. Related primitives share one live scene; a reference picker keeps each of the 36 registry APIs and source files available. There is no Fumadocs UI theme. Guides use the same shell with a reading canvas. Pages live in `content/docs`; `meta.json` files control navigation and title/description search.

Content is loaded lazily on the server. Code highlighting runs on the server with Shiki, and source reads use Next's cache. Opening Code loads the viewer and fetches highlighted source from `/api/docs/source/[name]`; it is read from the actual project files. No syntax-highlighting engine is shipped to the browser, and gallery links do not prefetch the full showcase.

To document another component:

1. Register the component in `registry.json` and `lib/docs/catalog.ts`.
2. Reuse or add a shared gallery demo in `components/site`, group its components in `lib/docs/showcases.ts`, and register a lazy scene in `components/docs/library-demo.tsx`. Only the selected scene mounts; the homepage and docs share the composed examples.
3. Add its usage example and notes to `lib/docs/examples.json`, then run `node scripts/generate-docs.mjs`. This generates MDX usage, installation, and API tables from the actual source types. The source API automatically allows catalog entries and reads their registry files.

`pnpm install` generates `.source` using the postinstall script; dev and build also update it. Do not edit or commit generated `.source` files. Run `pnpm exec fumadocs-mdx` if you need to regenerate them before typechecking.

Install commands use the docs site's current origin, including localhost during development. This does not register or verify a production registry deployment.

```bash
pnpm typecheck
pnpm lint
pnpm build
```

## License

[MIT + Commons Clause](./LICENSE): free to use in any project, including commercial ones. You may not sell the components themselves.
