# Squeeze — Image Tools Platform: TODO

Tracks all planned work for the platform. Update this file as work progresses.

## 🎉 All 8 tools are live

Image Compressor, Image Resizer, Image Converter, Crop, Rotate & Flip, Watermark, Metadata Remover, and Image to PDF — every tool on the homepage grid is now "Available". Nothing on the site says "Coming Soon" anymore (the underlying `coming-soon` status and `ComingSoonPage` template are still there, ready for whenever a 9th tool gets planned — they're just not pointing at anything right now).

## UI Redesign — search, categories, professional homepage ✅ done

- [x] **Tool registry gained categories** — `src/lib/tools.ts` now has a `ToolCategory` (`compress` / `convert` / `edit` / `privacy`) per tool plus `CATEGORY_META` (label, description, accent color) driving both the homepage sections and the filter chips from one source of truth: Compress → Image Compressor; Convert → Image Converter, Image to PDF; Edit → Image Resizer, Crop, Rotate, Watermark; Privacy → Metadata Remover
- [x] **Live search** (`ToolSearchBar.tsx`) — filters by name and description as you type, with a clear (✕) button
- [x] **Category filter chips** (`CategoryChips.tsx`) — horizontally-scrollable pill row (All tools/Compress/Convert/Edit/Privacy); selecting one filters the grid the same way a search does
- [x] **Homepage reorganized into sections by category**, each with a title, one-line description, and a working "See all →" link (jumps into the filtered single-category view — there's no pagination to reveal since categories are small, but it's a real, functional filter action, not decorative) — sections only show when neither search nor a category filter is active; searching or picking a chip collapses to a single filtered grid
- [x] **Empty state** — a distinct "No tools match ..." message with a one-click "Clear filters" reset when a search/category combination matches nothing
- [x] **Redesigned `ToolCard.tsx`** — icon in a category-colored rounded square, name, description, and a small "🔒 On-device" badge on every card (replacing the old "Available" pill, since all 8 tools are active now anyway)
- [x] **Trimmed `Hero.tsx`** to a single bold heading + one-line subheading (dropped the longer paragraph and the 3-badge row) so the search bar appears higher on the page
- [x] **Navbar gained "Home" and "Recent"** — "Home" is a text link (visible from `sm:` up; the logo already covers this on mobile, so it's not duplicated there) that highlights when you're on the homepage; "Recent" is a new icon-button dropdown showing the last 5 tools visited, persisted in `localStorage` (`hooks/useRecentTools.ts`), most-recent-first, with its own empty state before you've used anything. Opening either the "Tools" or "Recent" dropdown closes the other.
- [x] Verified the search/chip/section/empty-state logic actually works (typed "crop" → 1 result; picked the "Edit" chip → 4 results; searched gibberish → empty state; "Clear filters" → back to all 8), verified "Recent" starts empty and correctly lists tools after visiting them, most-recent-first, and verified opening one dropdown closes the other
- [x] Smoke-tested all 8 existing tool routes after the redesign — every one still renders its upload zone and works exactly as before; **no tool functionality, route, or path changed** — only the homepage, hero, tool card, and navbar were touched
- [x] Verified at 360px: search bar, chips (scroll horizontally within their own row, not the page), and stacked cards all have zero horizontal scroll on the page itself
- [x] Dark mode reviewed on the redesigned homepage and navbar dropdowns — clean, spacious, consistent with the rest of the site
- [x] Committed to git

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

## Part 2 — Full Image Compressor ✅ done

- [x] Smart Compression (auto balance)
- [x] Maximum Compression (smallest size)
- [x] Custom Quality slider (1–100)
- [x] Lossless (PNG/WebP) and Lossy (JPG/WebP/AVIF) modes
- [x] **Target Size option** — preset buttons (20 KB / 50 KB / 100 KB) + custom KB input, quality binary-search to hit the target (`binarySearchEncode` in `compress.ts`), warning shown when the target can't be reached
- [x] Input & output formats: JPG, PNG, WebP, AVIF, shown as badges on the compressor page
- [x] Graceful fallback if the browser can't encode AVIF/WebP (`formatSupport.ts`, already existed, reverified)
- [x] Before vs after comparison — both a draggable slider view **and** a side-by-side view (toggle in `PreviewModal.tsx`)
- [x] Compression Stats Card per image — Original Size, Compressed Size, % Saved, **Time Taken** (new)
- [x] Upload: drag & drop, click to browse, mobile file picker (already existed, reverified end-to-end)
- [x] Single image flow verified working end-to-end (upload → compress → download)
- [x] Download single compressed image
- [x] Mobile-first pass: target-size controls, stats card, and both comparison views verified at 360px with zero horizontal scroll
- [x] Committed to git

Batch processing, crop/rotate/resize editing, batch rename, and ZIP download were already built in the prior session and continue to work unchanged — verified they still function after this pass, not re-listed as new here.

## Part 3 — Batch Processing, ZIP Download & Polish ✅ done

- [x] Batch upload accepting up to 100 images (`MAX_FILES`), each with its own pending/processing/done/error status
- [x] Per-image stats card shown in the batch list (size, % saved, time taken)
- [x] Total summary — total original size, total compressed size, total % saved — now visible on mobile too (a condensed "Saved X%" pill; the full byte breakdown still shows at `md:` and up to avoid crowding small screens)
- [x] **Batch progress bar** — "Compressing… X/Y" shown above the queue while a batch run is in flight (`CompressPage.tsx`)
- [x] Individual image download
- [x] Download All as ZIP (`jszip` + `file-saver`)
- [x] Friendly warning when a browser can't encode a format (already existed, reverified)
- [x] Friendly, honest error state for corrupt/unreadable files — fixed two real bugs found while testing this: a permanently-errored file no longer shows "Reading…" forever, and the "Edit" button is now hidden for files that never successfully decoded (editing a file with no valid image data made no sense and showed a blank crop screen)
- [x] **`DownloadBar` rebuilt mobile-first** — "Rename" and "Clear all" were previously hidden entirely below the `sm` breakpoint, meaning phone users had no way to reach them at all; fixed
- [x] Verified with a real batch (14 images + 1 corrupt file): per-file status, ZIP download, batch rename, and the 100-image cap rejection banner (tested with 105 files — 100 accepted, 5 correctly rejected) all work correctly
- [x] Dark mode reviewed across the batch list, download bar, edit/crop toolbar, rename modal, and preview modal — no contrast issues found
- [x] Verified at 360px: batch grid, download bar, edit/crop toolbar, rename modal — zero horizontal scroll, large tap targets throughout
- [x] Committed to git

**Extra UX touches (added after the Part 3 commit):**
- [x] Success animation — the per-image checkmark badge now pops in with a bouncy scale/fade and the tick draws itself in right after (pure CSS keyframes in `index.css`, no animation library)
- [x] Sticky bottom bar made properly compact on mobile — "Rename"/"Clear all" moved up into the queue header (they're secondary actions, don't need to be pinned) so the sticky bar is just selection + Compress + Download; measured bar height dropped from ~110px to **53px** on a 360px viewport, with more image cards visible above the fold and zero horizontal scroll

## Other Tools (beyond the 3-part compressor build)

These weren't part of the 3-part compressor plan above — they're the wider "Image Tools" platform, built in their own batches.

### Part 1 tools — Resizer + Converter ✅ done

- [x] **Image Resizer** (`/resize`) — single-image tool: drag & drop/click/mobile picker upload, Width & Height inputs with a "Lock aspect ratio" toggle that auto-adjusts the other dimension, three preset buttons (1920×1080, 1080×1080, 800×600), live original-vs-target dimensions readout, side-by-side before/after preview, stats (new dimensions, new size, format, time taken), download, JPG/PNG/WebP/AVIF output with graceful fallback
- [x] **Image Converter** (`/convert`) — batch tool: same upload pattern, a dropdown to pick one target format (JPG/PNG/WebP/AVIF) applied to the whole batch, per-image before → after format + size badges, graceful encode-fallback warning, individual download, and Download All as ZIP
- [x] Promoted both from "Coming Soon" to "Available" in `src/lib/tools.ts`; homepage grid and Tools nav dropdown reflect it automatically
- [x] Success checkmark animation reused (shared `StatusBadge` component) on both new tools, matching the compressor
- [x] Verified at 360px: both tools' upload, controls, and result views have zero horizontal scroll and large tap targets
- [x] Dark mode reviewed on both — matches the existing theme with no contrast issues
- [x] **Shared infrastructure extracted to avoid duplicating the compressor's logic**: `utils/concurrency.ts` (`runWithConcurrency`), `utils/fileValidation.ts` (`MAX_FILES`, `isAcceptedImageFile`), `utils/resolveFormat.ts` (format-fallback resolution), a generalized `DownloadBar` (tool-agnostic action label instead of hardcoded "Compress"), a generalized `PreviewModal` (structural `PreviewableImage` type instead of the compressor-specific `QueueImage`), and a loosened `download.ts` (`Downloadable` type). `useImageQueue.ts` (the compressor's hook) was refactored to import the shared validation/concurrency utilities instead of duplicating them, and was smoke-retested afterward to confirm no regression.
- [x] Committed to git

### Part 2 tools — Crop + Rotate/Flip ✅ done

- [x] **Crop Image** (`/crop`) — single-image tool: interactive drag/resize crop box via `react-easy-crop` (the same library the compressor's edit toolbar already uses), aspect ratio presets (Free, 1:1, 4:3, 16:9, 3:2), live crop-dimensions badge that updates as you drag, zoom slider, side-by-side before/after preview, stats (new dimensions, new size, format, time taken), download, JPG/PNG/WebP/AVIF output with graceful fallback
- [x] **Rotate & Flip** (`/rotate`) — single-image tool: rotate left/right 90°, rotate 180°, flip horizontal, flip vertical, instant CSS-transform live preview (no reprocessing needed just to see the change), an explicit "Apply changes" step that bakes the transform into real pixel data via canvas, dimensions readout that shows the width/height swap on 90°/270° rotation, before/after result with stats, download
- [x] Touch-friendly crop box verified — `touch-action: none` set on the cropper container so mobile browsers don't hijack the drag gesture with page-scroll; confirmed via computed style in a touch-emulated browser context
- [x] Promoted both from "Coming Soon" to "Available" in `src/lib/tools.ts`
- [x] **Reused rather than duplicated**: `utils/crop.ts` and `utils/rotateFlip.ts` are thin wrappers around the compressor's existing `renderEditedCanvas` (already handles crop/rotate/flip math) plus the same format-resolution/encode helpers used by every other tool — no new canvas math was written. The four rotate/flip icons were extracted out of `EditToolbar.tsx` into a shared `RotateFlipIcons.tsx` so the compressor and the new Rotate page render the exact same icons instead of duplicated SVGs.
- [x] Verified at 360px: both tools' upload, controls (including the interactive cropper), and result views have zero horizontal scroll and large tap targets
- [x] Dark mode reviewed on both — matches the existing theme
- [x] Smoke-retested the compressor's own crop/rotate/flip edit toolbar after extracting the shared icons — confirmed no regression
- [x] Committed to git

### Part 3 tools — Watermark + Metadata Remover ✅ done

- [x] **Watermark** (`/watermark`) — batch tool: text watermark (custom text, font size, color, opacity) or logo/image watermark (upload a small logo, reused across the whole batch), a 9-position grid picker (corners, edges, center), a live preview overlaid via CSS on the first queued image so you see the result before processing anything, per-image apply/re-apply, individual download, Download All as ZIP, JPG/PNG/WebP/AVIF output with graceful fallback
- [x] **Metadata Remover** (`/metadata`) — batch tool: scans every image with the `exifr` library and shows *exactly* what it found — camera make/model, date taken, GPS coordinates (highlighted in red as the most sensitive), plus a count of any other data points — before you remove anything. Stripping reuses the converter's canvas re-encode (pixel data never carries EXIF, so redrawing the image already removes everything — no new stripping logic needed). After stripping, **re-scans the actual output** and shows "✓ Verified clean" instead of just claiming it worked.
- [x] Promoted both from "Coming Soon" to "Available" in `src/lib/tools.ts`; the Metadata Remover's route is `/metadata` (shorter than the registry's original `/metadata-remover`, per this round's spec)
- [x] **New shared infrastructure** (used by these two tools, without touching the already-shipped compressor/converter hooks): `hooks/useMediaQueue.ts` is a generic version of the batch-queue mechanics that `useConvertQueue` established — `useWatermarkQueue` and `useMetadataQueue` are now ~5-line wrappers around it instead of two more ~200-line copy-pastes
- [x] `exifr` added as a real dependency (not a dev/test-only install) — dynamically imported inside `utils/metadata.ts` so it doesn't bloat the main bundle, same lazy-load pattern already used for `heic2any`
- [x] Verified detection against a **real EXIF-embedded test JPEG** (Canon EOS R5, a timestamp, and GPS coordinates ~San Francisco) — confirmed all three are correctly parsed and displayed, confirmed a metadata-free image correctly shows "No metadata detected", and confirmed the post-strip re-scan genuinely reports clean
- [x] Fixed a real bug found in testing: switching Watermark's Text/Logo mode was tripping a React "controlled input becoming uncontrolled" warning — React was reusing the same DOM node across the two mode branches (both started with a `<div>` at the same position) and dropping the old input's `value` prop; fixed by giving each branch a distinct `key`
- [x] Fixed a real cosmetic bug: camera name was rendering as "Canon Canon EOS R5" when the EXIF Model field already included the Make as a prefix; now checks for that before concatenating
- [x] Verified at 360px: both tools' settings (including the 9-position grid and the live preview), batch list, and sticky bar have zero horizontal scroll and large tap targets
- [x] Dark mode reviewed on both — no contrast issues
- [x] Committed to git

### Part 4 tool — Image to PDF ✅ done

- [x] **Image to PDF** (`/pdf`) — combine one or more images into a single PDF: drag-to-reorder list (pointer-events based, not native HTML5 drag-and-drop, specifically so it works identically on touch and mouse — same code path handles both), page size (A4, Letter, or Fit-to-image, which sizes each page to its own image instead of a fixed format), portrait/landscape orientation (hidden when Fit-to-image is selected, since that mode picks orientation per-image automatically), margin presets (None/Small/Large), a numbered live-order list that doubles as the "preview", and a result card with page count/file size/time taken plus download
- [x] Promoted from "Coming Soon" to "Available" in `src/lib/tools.ts`; route is `/pdf` (shorter than the registry's original `/image-to-pdf`, per this round's spec)
- [x] `jsPDF` added as a dependency — caught and fixed a real bundle-size regression during verification: importing it statically pulled its optional HTML-rendering feature (and *that* pulls in `html2canvas` + `dompurify`) into the app's main bundle, ballooning it from ~550KB to ~960KB. Fixed by dynamically importing `jspdf` inside `buildPdf()`, same lazy-load pattern as `heic2any`/`exifr` — confirmed via a rebuild that the main bundle dropped back to ~560KB and jsPDF + its transitive deps now live in on-demand chunks that only load when `/pdf` is actually used
- [x] Verified the drag reorder actually reorders the underlying array (dragged item 1 to position 3 in a 4-image list, confirmed the resulting order), verified `touch-action: none` is set on the drag handle so mobile browsers don't hijack the gesture as a page-scroll, verified all three page-size modes (including that Fit-to-image correctly hides the orientation control), and verified the downloaded file is a real, valid PDF (checked the `%PDF` magic bytes)
- [x] Verified at 360px: the reorderable list, page-setup controls, and result card all have zero horizontal scroll
- [x] Dark mode reviewed — no contrast issues
- [x] Committed to git

## Final Polish Pass ✅ done

- [x] Swept all 8 tool routes at 360px in one pass — confirmed zero horizontal scroll on every single one (compress, resize, convert, crop, rotate, watermark, metadata, pdf)
- [x] Confirmed the homepage tool grid shows all 8 cards as "Available" (0 "Coming Soon" badges left) and each links to its correct, working route
- [x] Grepped the codebase for stray "Coming Soon" text — the only remaining references are the `coming-soon` status type, the filter that generates stub routes, and the `ComingSoonPage` template itself, none of which currently render anything (kept intentionally as ready-to-use infrastructure for a future tool, not dead code)
- [x] Confirmed success-animation consistency: every tool uses either the shared `StatusBadge` component (Compress/Convert/Watermark/Metadata, the batch tools) or the same inline `animate-success-pop`/`animate-check-draw` markup (Resize/Crop/Rotate/PDF, the single-result tools) — no tool has a one-off animation
- [x] Confirmed the sticky bottom action bar pattern is used consistently where it makes sense (the 4 batch/multi-select tools) and intentionally *not* forced onto the single-result tools (Resize/Crop/Rotate/PDF), which use an inline primary button instead since there's no batch selection to act on
- [x] Zero console errors across the full verification sweep

## SEO ✅ done

- [x] **Per-page SEO** (`react-helmet-async`) — unique `<title>`, meta description, and canonical URL per route via a reusable `Seo.tsx` component, driven by hand-written copy per tool in `lib/seoContent.ts` targeting real search intent ("compress image online", "resize image free", "convert jpg to png", "image to pdf", "remove exif data", etc.) without stuffing
- [x] Every tool page (plus the homepage) now has a proper `<h1>`, a short SEO-oriented intro paragraph under it, and a 2–3 question **FAQ** at the bottom (`FaqSection.tsx`) — heading hierarchy is consistent everywhere (one `<h1>` per page, then `<h2>`/`<h3>` nested, never skipped)
- [x] **OG + Twitter Card tags** (title/description/image) on every route, plus a **JSON-LD `WebApplication` schema** per tool (`buildWebApplicationSchema()`) and a **JSON-LD `FAQPage` schema** wherever a FAQ renders
- [x] `robots.txt`, `sitemap.xml` (all 9 URLs), `site.webmanifest` (PWA-friendly: icons, theme color, start_url/scope), and generated brand assets (`og-image.png`, `icon-192.png`, `icon-512.png`, `favicon.svg`)
- [x] All 8 tool routes converted to `React.lazy` + `Suspense` — confirmed via a real build that the main JS chunk dropped from ~567KB to ~285KB, with each tool now its own 10–30KB on-demand chunk
- [x] Alt-text audit — every `<img>` in the app has either a real descriptive `alt` or an intentional `alt=""` on purely decorative/duplicate-of-context previews (e.g. a live watermark-position preview)
- [x] **Static pre-rendering implemented** — `scripts/prerender.mjs` boots the real production build (`vite preview`) behind a headless Chromium (Playwright), visits all 9 routes, and saves each one's fully-rendered HTML to `dist/<route>/index.html`. This is real browser-driven prerendering, not server-side rendering — no Node/SSR compatibility concerns, since every route renders exactly the way a visitor's browser renders it (Canvas/`ImageBitmap`/`localStorage` and all), then that DOM snapshot is saved as static HTML. React still boots normally on top once JS loads. Wired into `npm run build` (`tsc -b && vite build && node scripts/prerender.mjs`) and into `.github/workflows/deploy.yml` (installs Playwright's Chromium before building).
  - Fixed a real bug: `React.lazy`/`Suspense` remounts the suspended subtree once its chunk resolves, and Helmet doesn't clean up an interrupted first mount's tags before the second mount adds its own — moved `<Seo>` to the route level, **outside** `Suspense`, so it renders exactly once regardless of chunk-load timing.
  - Fixed a second real bug: the prerender loop wrote each route straight into `dist/`, and since `vite preview` falls back to `dist/index.html` for any unmatched path, every route processed *after* home was served home's already-baked HTML as its initial shell. Fixed by staging all 9 captures in a temp directory and only copying them into `dist/` after every route has been rendered against the untouched build output.
  - Fixed a third real bug: `react-helmet-async` only tracks tags it rendered itself in the *current* browser session — it has no way to know a static file already has a baked-in `<title>`/meta/JSON-LD from a previous prerender pass, so on a fresh page load it appended its own instead of replacing them, leaving 2 of everything in the live, hydrated DOM (even though the static file itself was correct). Fixed with a small one-time cleanup in `main.tsx` that clears any pre-existing SEO tags from `<head>` before React ever mounts.
  - Verified with a live Playwright pass (not just grepping the static HTML): loaded 3 prerendered routes through `vite preview`, confirmed exactly 1 `<title>`/1 meta description each post-hydration, zero console errors, and that the upload zone is still fully interactive.
- [x] **What full SSR would still need, if ever wanted beyond this**: this setup is prerendering (a build-time browser snapshot), not true isomorphic SSR — there's no server that renders React to HTML per-request. To get real SSR you'd need to (1) move off GitHub Pages to something that can run Node per-request (Vercel/Netlify/a small Express server), (2) restructure the app so `react-dom/server` can render it outside a browser — meaning every browser-only API the tools rely on (`Canvas`, `createImageBitmap`, `localStorage`, `matchMedia`) would need to be guarded or deferred until after hydration, which touches nearly every tool page, and (3) switch `main.tsx` from `createRoot(...).render(...)` to `hydrateRoot(...)` and pass Helmet's collected tags through `renderToString`/`renderToPipeableStream` instead of relying on client-side DOM mutation. Given this app is 100% client-side image processing by design, the current prerender-snapshot approach gets crawlers real HTML without any of that restructuring risk.

## Production hardening & growth
- [ ] Unit tests for core image-processing logic (`compress.ts` binary-search/quality targeting, `canvasOps.ts`)
- [ ] Error boundary so a render crash doesn't blank the whole app
- [ ] PWA service worker for offline support (manifest/icons already in place from the SEO pass)
- [ ] CI: run `oxlint` in the GitHub Actions workflow, not just the build
- [ ] Accessibility pass — contrast, focus states, keyboard navigation audit
- [ ] Guardrail UX — warn on very large individual files, not just the 100-file batch cap
- [ ] Growth/monetization surface — analytics, and a pricing/upgrade path if the product goes paid
- [ ] Replace default README with real product docs
