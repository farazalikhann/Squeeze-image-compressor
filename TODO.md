# Squeeze — Image Tools Platform: TODO

Tracks all planned work across the 3 build parts. Update this file as parts progress.

## Part 1 — Foundation (shell, navigation, homepage) ✅ done

- [x] Project scaffold with React Router set up (`BrowserRouter`, routes in `App.tsx`)
- [x] Central tool registry (`src/lib/tools.ts`) driving the navbar, homepage grid, and routes
- [x] Persistent top navbar — logo, "Tools" switcher dropdown, dark mode toggle (`Navbar.tsx`)
- [x] Homepage with tool grid: Image Compressor (Available) + 7 tools marked Coming Soon (`HomePage.tsx`, `ToolCard.tsx`)
- [x] Each tool has its own route (`/compress`, `/resize`, `/convert`, `/crop`, `/rotate`, `/watermark`, `/metadata-remover`, `/image-to-pdf`)
- [x] Stub "Coming Soon" page for unbuilt tools (`ComingSoonPage.tsx`)
- [x] 404 page for unknown routes (`NotFoundPage.tsx`)
- [x] Existing Image Compressor migrated into the new shell (`CompressPage.tsx`) — fully functional, unchanged behavior
- [x] Dark mode toggle, persisted in `localStorage`
- [x] Prominent privacy badge ("🔒 Processed locally in your browser. No uploads.") on hero + compressor page
- [x] Shared `Layout`, `Navbar`, `ToolCard`, `Footer` components
- [x] Mobile-first pass: verified no horizontal scroll at 360px on home, tools menu, compress page, coming-soon page, and 404 page; 44px+ tap targets throughout
- [x] GitHub Pages SPA deep-link fix (`public/404.html` + decode script in `index.html`) so direct links like `/compress` don't 404 on refresh
- [x] `.gitignore` for `node_modules`, `dist`, etc.
- [x] Committed to git

## Part 2 — Build the tools

- [ ] Image Resizer — exact dimensions or percentage scale, aspect-lock option
- [ ] Image Converter — JPG ⇄ PNG ⇄ WebP ⇄ AVIF, with capability fallback (reuse `formatSupport.ts` logic)
- [ ] Crop — standalone crop tool (reuse `react-easy-crop` integration from the compressor's edit toolbar)
- [ ] Rotate — standalone rotate/flip tool
- [ ] Watermark — text and/or logo image watermark, position/opacity controls
- [ ] Metadata Remover — strip EXIF/location without necessarily re-compressing
- [ ] Image to PDF — combine one or more images into a single downloadable PDF
- [ ] Promote each tool from "Coming Soon" to "Available" in `src/lib/tools.ts` as it ships

## Part 3 — Production hardening & growth

- [ ] Unit tests for core image-processing logic (`compress.ts` binary-search/quality targeting, `canvasOps.ts`)
- [ ] Error boundary so a render crash doesn't blank the whole app
- [ ] PWA support — manifest + service worker, installable/offline-capable
- [ ] SEO — Open Graph tags, per-tool meta descriptions, sitemap.xml, robots.txt
- [ ] CI: run `oxlint` in the GitHub Actions workflow, not just the build
- [ ] Accessibility pass — contrast, focus states, keyboard navigation audit
- [ ] Guardrail UX — warn on very large individual files, not just the 100-file batch cap
- [ ] Growth/monetization surface — analytics, and a pricing/upgrade path if the product goes paid
- [ ] Replace default README with real product docs
