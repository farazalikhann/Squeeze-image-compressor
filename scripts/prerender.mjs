// Prerenders each route to real static HTML in dist/, so crawlers that don't
// execute JavaScript (most social-media link unfurlers, and as a bonus
// belt-and-suspenders for search engines) see fully-populated per-route
// <title>/meta/JSON-LD instead of just the bare SPA shell. This is
// prerendering via a real headless browser — not server-side rendering —
// so there's no Node/SSR compatibility concerns: every route is rendered
// exactly the way a real visitor's browser would render it, then the
// resulting HTML is saved as a static file. React still boots normally on
// top of it once JS loads; this file is just a fast, crawlable snapshot.
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { mkdir, writeFile, copyFile, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const distDir = path.join(root, 'dist')
// Routes are staged here first, NOT written straight into dist/. vite preview
// serves dist/ as static files for the entire lifetime of this script, and it
// falls back to dist/index.html for any path with no matching file — so if
// route '' were written into dist/ immediately, every route processed after
// it would have that fully-rendered *home* HTML served as its initial shell
// instead of the plain SPA fallback, and Helmet would then layer its own
// tags on top of home's instead of onto a blank slate. Staging elsewhere
// keeps dist/'s fallback shell untouched until every route has been captured.
const stagingDir = path.join(root, '.prerender-staging')
const PORT = 4174
// Served from the squeeze.services custom domain root — no repo-name subpath.
const BASE = ''
const ORIGIN = `http://localhost:${PORT}`

const ROUTES = ['', 'compress', 'resize', 'convert', 'crop', 'rotate', 'watermark', 'metadata', 'pdf']

function waitForServer(url, timeoutMs = 20000) {
  const start = Date.now()
  return new Promise((resolve, reject) => {
    const tryOnce = () => {
      fetch(url)
        .then(() => resolve())
        .catch(() => {
          if (Date.now() - start > timeoutMs) reject(new Error(`Preview server did not start within ${timeoutMs}ms`))
          else setTimeout(tryOnce, 300)
        })
    }
    tryOnce()
  })
}

// Headless Chromium can hang indefinitely instead of erroring when a CI
// sandbox/shared-memory issue prevents it from starting properly — without
// this, a bad CI environment turns into a silent multi-hour job hang instead
// of a fast, readable failure.
function withTimeout(promise, ms, message) {
  let timer
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(message)), ms)
  })
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer))
}

async function renderRoute(browser, route) {
  const context = await browser.newContext()
  const page = await context.newPage()
  try {
    const url = `${ORIGIN}${BASE}/${route}`
    await page.goto(url, { waitUntil: 'networkidle' })
    // Helmet updates <head> in a post-render effect; wait for it explicitly
    // rather than trusting networkidle timing alone. <meta> is never
    // "visible", so wait for it to be attached to the DOM instead.
    await page.waitForSelector('meta[name="description"]', { state: 'attached', timeout: 10000 })
    await page.waitForTimeout(150)

    // page.content() already includes the document's own "<!DOCTYPE html>",
    // so no need to prepend a second one.
    const html = await page.content()
    const outDir = route === '' ? stagingDir : path.join(stagingDir, route)
    await mkdir(outDir, { recursive: true })
    await writeFile(path.join(outDir, 'index.html'), html, 'utf-8')
    console.log(`[prerender] captured ${route === '' ? '/index.html' : `/${route}/index.html`}`)
  } finally {
    await context.close()
  }
}

async function main() {
  if (!existsSync(distDir)) {
    throw new Error('dist/ not found — run `vite build` before prerendering')
  }

  console.log(`[prerender] starting vite preview on port ${PORT}...`)
  const preview = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
    cwd: root,
    stdio: 'pipe',
    shell: true,
  })
  let previewOutput = ''
  preview.stdout.on('data', (d) => (previewOutput += d.toString()))
  preview.stderr.on('data', (d) => (previewOutput += d.toString()))

  const cleanupPreview = () => {
    preview.kill()
  }

  try {
    await waitForServer(`${ORIGIN}${BASE}/`)

    await rm(stagingDir, { recursive: true, force: true })

    // --no-sandbox/--disable-dev-shm-usage: standard hardening for headless
    // Chromium on CI runners, where the sandbox or /dev/shm can be
    // restricted in ways that otherwise make the browser fail to start.
    const browser = await withTimeout(
      chromium.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'] }),
      30000,
      'chromium.launch() timed out after 30s',
    )

    // A fresh browser context (and page) per route, not one page reused
    // across goto() calls — react-helmet-async accumulates stale <title>/
    // <meta> tags from the previous route instead of replacing them when the
    // same page object is reused across navigations. A clean context avoids
    // that entirely and mirrors how a real visitor loads each URL.
    for (const route of ROUTES) {
      await withTimeout(renderRoute(browser, route), 20000, `Timed out rendering route "${route || '/'}" after 20s`)
    }

    await browser.close()

    // Only now, after every route has been captured against the untouched
    // dist/ shell, copy the staged files into their real dist/ locations.
    for (const route of ROUTES) {
      const from = route === '' ? path.join(stagingDir, 'index.html') : path.join(stagingDir, route, 'index.html')
      const toDir = route === '' ? distDir : path.join(distDir, route)
      await mkdir(toDir, { recursive: true })
      await copyFile(from, path.join(toDir, 'index.html'))
      console.log(`[prerender] wrote ${route === '' ? '/index.html' : `/${route}/index.html`}`)
    }
    await rm(stagingDir, { recursive: true, force: true })

    // 404.html should still exist for genuinely unknown paths — vite build
    // already copies public/404.html into dist/, but confirm it's there.
    const notFoundPath = path.join(distDir, '404.html')
    if (!existsSync(notFoundPath)) {
      await copyFile(path.join(root, 'public', '404.html'), notFoundPath)
    }

    console.log(`[prerender] done — ${ROUTES.length} routes prerendered`)
  } catch (err) {
    console.error('[prerender] FAILED:', previewOutput)
    throw err
  } finally {
    cleanupPreview()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
