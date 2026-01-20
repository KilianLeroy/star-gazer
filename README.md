# Star Gazer

Explore mythological deities as an interactive 3D starfield powered by live Wikidata SPARQL queries. Build custom constellations, cluster figures by domain, and collect social interactions via webmentions and visitation cards.

## Key Features
- **3D mythology visualization (Three.js)**: Navigate a starfield of deities; click a star for details, Wikipedia link, domains, family, and imagery. Press **F** or the toolbar button to toggle canvas fullscreen (layout-only, no browser fullscreen request).
- **Live SPARQL builder**: Compose Wikidata queries with toggles for domains, family relations, descriptions, images, articles, ordering, and limits. Supports Greek, Norse, Egyptian, Hindu, and Celtic deity types, plus extra FILTER/graph patterns.
- **Domain clustering & filtering**: Group stars by domains, draw inter-domain links for multi-domain figures, and optionally show only “dense” domains (≥3 members).
- **Fallback seed data**: Ships with static mythology data so the visualization still works offline or before querying.
- **Webmentions end-to-end**: Submit webmentions via the form, parse microformats, verify source links, deduplicate by normalized target, and display mentions/replies/likes/reposts.
- **Visitation cards**: Simple profile dropbox API that stores visitor profile URLs.
- **Nuxt UI + Tailwind CSS 4** styling with Vue 3 & TypeScript on Nuxt 4.

## Stack
- **Framework**: Nuxt 4 (Vue 3, TypeScript)
- **UI**: @nuxt/ui, Tailwind CSS 4
- **3D**: Three.js with custom `useThree` and `useMythologyVisualization` composables
- **Data/Queries**: Wikidata SPARQL (builder utilities & examples)
- **Social**: Webmentions (microformats-parser) and visitation cards APIs

## Getting Started
### Prerequisites
- Node.js 18.20+ (Nuxt 4 requirement)
- pnpm (recommended) or npm/yarn/bun

### Install & Run
```bash
pnpm install
pnpm dev
```
App runs at http://localhost:3000.

### Scripts
- `pnpm dev` — start dev server
- `pnpm build` — production build
- `pnpm preview` — preview the built app
- `pnpm generate` — pre-render static site
- `pnpm postinstall` — nuxt prepare (auto-run)

## Usage Walkthrough
### Explore the starfield
1. Load the home page to view the default mythology dataset.
2. Click stars to open the info panel (description, domains, family, image, Wikipedia link when available).
3. Use **F** or the “Enter Fullscreen (F)” button to stretch the canvas.

### Run SPARQL searches
1. Toggle **SPARQL Search** on the home page.
2. Select deity types (multi-select), adjust limit/order, and toggle fields (domains, family, image, article, description).
3. Add optional FILTER/graph patterns for custom constraints.
4. Toggle **Group by Domain** for clustered layouts; toggle **Only dense domains (≥3)** to filter sparse domains.
5. Click **Run query** to fetch from Wikidata and populate the visualization.

### Webmentions
- Submit your page URL that links to the site via the Webmention form.
- Mentions are verified to ensure the source links the target, parsed for author/content, deduped, stored in `public/data/webmentions.json`, and rendered in categorized lists (mentions, replies, likes, reposts).
- API endpoints:
  - `POST /api/webmentions` with `{ source, target }`
  - `GET /api/webmentions?target=<url>` to list mentions for a page (normalized matching by URL/root)

### Visitation Cards
- Drop a profile URL to be recorded:
  - `POST /api/visitation-cards` with `{ profile: "https://example.com/me" }`
  - `GET /api/visitation-cards` to retrieve stored profiles
- Data is persisted in `public/data/visitation-cards.json`.

## Architecture Notes
- **Pages**: `app/pages/index.vue` hosts the hero, SPARQL UI, and Three.js canvas.
- **3D**: `components/three/StarField.vue` orchestrates the scene, controls, labels, and star click handling.
- **SPARQL**: Query builder options live in `components/sparql/sparqlSearch.vue`, with query composition in `app/data/sparqlQueries.ts` and execution via `app/composables/useSparqlQuery.ts` + `app/utils/sparqlQuery.ts`.
- **Data conversion**: `app/utils/sparqlDataConverter.ts` maps SPARQL results to StarData, clusters by domain, and builds relationships.
- **Webmentions**: UI components in `app/components/webmention/*`; server handlers in `server/api/webmentions.*`; logic in `server/utils/webmention.ts`.
- **Visitation cards**: `server/api/visitation-cards.*` store/retrieve profile URLs.
- **Seed data**: `app/data/mythologyData.ts` provides static figures for offline/default rendering.

## Data Source
- Wikidata SPARQL endpoint (queries built with prefixes in `utils/sparqlQueryBuilder.ts`). Respect rate limits; consider lowering limits if requests time out.

## Deployment
```bash
pnpm build
pnpm preview   # smoke-test the production build locally
```
Serve the generated `.output` (Nuxt) on your hosting provider or pre-render with `pnpm generate` for static hosting.

## Troubleshooting
- **SPARQL errors or empty results**: Check network access to `query.wikidata.org`, reduce `limit`, or simplify filters.
- **Webmentions not appearing**: Ensure the source page actually links the target; verification will reject otherwise. Confirm write access to `public/data/webmentions.json` on your host.
- **Fullscreen**: The “fullscreen” toggle only stretches the canvas; it intentionally avoids invoking the browser fullscreen API.

## License
- MIT. See [LICENSE](./LICENSE).
