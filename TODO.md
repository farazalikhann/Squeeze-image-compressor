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

### Still to build

- [ ] Crop — standalone crop tool (reuse `react-easy-crop` integration from the compressor's edit toolbar)
- [ ] Rotate — standalone rotate/flip tool
- [ ] Watermark — text and/or logo image watermark, position/opacity controls
- [ ] Metadata Remover — strip EXIF/location without necessarily re-compressing
- [ ] Image to PDF — combine one or more images into a single downloadable PDF

## Production hardening & growth
- [ ] Unit tests for core image-processing logic (`compress.ts` binary-search/quality targeting, `canvasOps.ts`)
- [ ] Error boundary so a render crash doesn't blank the whole app
- [ ] PWA support — manifest + service worker, installable/offline-capable
- [ ] SEO — Open Graph tags, per-tool meta descriptions, sitemap.xml, robots.txt
- [ ] CI: run `oxlint` in the GitHub Actions workflow, not just the build
- [ ] Accessibility pass — contrast, focus states, keyboard navigation audit
- [ ] Guardrail UX — warn on very large individual files, not just the 100-file batch cap
- [ ] Growth/monetization surface — analytics, and a pricing/upgrade path if the product goes paid
- [ ] Replace default README with real product docs
