import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.tsx'

// Prerendered pages (scripts/prerender.mjs) bake a real <title>/meta/JSON-LD
// snapshot into each dist/<route>/index.html for crawlers. react-helmet-async
// has no idea those tags exist — on its first-ever mount it only tracks tags
// it renders itself, so it appends its own instead of replacing the baked-in
// ones. Clearing them before React mounts gives Helmet a blank head to render
// into, so the live/hydrated page ends up with exactly one of each, same as
// the static file. This is a no-op on a plain (non-prerendered) index.html,
// since none of these tags exist there yet.
function clearPrerenderedSeoTags() {
  const selectors = [
    'title',
    'meta[name="description"]',
    'meta[property^="og:"]',
    'meta[name^="twitter:"]',
    'link[rel="canonical"]',
    'script[type="application/ld+json"]',
  ]
  selectors.forEach((selector) => {
    document.head.querySelectorAll(selector).forEach((el) => el.remove())
  })
}
clearPrerenderedSeoTags()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
)
