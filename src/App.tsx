import { lazy, Suspense } from 'react'
import type { ComponentType } from 'react'
import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import ComingSoonPage from './pages/ComingSoonPage'
import NotFoundPage from './pages/NotFoundPage'
import Seo from './components/Seo'
import { TOOLS } from './lib/tools'
import { SEO_CONTENT } from './lib/seoContent'
import { buildWebApplicationSchema } from './lib/seo'

const CompressPage = lazy(() => import('./pages/CompressPage'))
const ResizePage = lazy(() => import('./pages/ResizePage'))
const ConvertPage = lazy(() => import('./pages/ConvertPage'))
const CropPage = lazy(() => import('./pages/CropPage'))
const RotatePage = lazy(() => import('./pages/RotatePage'))
const WatermarkPage = lazy(() => import('./pages/WatermarkPage'))
const MetadataPage = lazy(() => import('./pages/MetadataPage'))
const PdfPage = lazy(() => import('./pages/PdfPage'))

function PageLoading() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-24">
      <svg className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
    </div>
  )
}

interface ToolRouteProps {
  seoKey: keyof typeof SEO_CONTENT
  appName: string
  path: string
  Component: ComponentType
}

/** Seo/Helmet lives OUTSIDE <Suspense> deliberately: once a lazy chunk
 *  resolves, React remounts the suspended subtree, and react-helmet-async
 *  doesn't clean up tags from an interrupted first mount before the second
 *  mount adds its own — that produced duplicate <title>/<meta> tags in the
 *  prerendered output. Keeping Seo in the always-mounted parent means it
 *  renders exactly once per navigation, regardless of chunk-load timing. */
function ToolRoute({ seoKey, appName, path, Component }: ToolRouteProps) {
  const seo = SEO_CONTENT[seoKey]
  return (
    <>
      <Seo
        title={seo.title}
        description={seo.description}
        path={path}
        jsonLd={buildWebApplicationSchema(appName, seo.description, path)}
      />
      <Suspense fallback={<PageLoading />}>
        <Component />
      </Suspense>
    </>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route
          path="compress"
          element={<ToolRoute seoKey="compress" appName="Image Compressor" path="/compress" Component={CompressPage} />}
        />
        <Route
          path="resize"
          element={<ToolRoute seoKey="resize" appName="Image Resizer" path="/resize" Component={ResizePage} />}
        />
        <Route
          path="convert"
          element={<ToolRoute seoKey="convert" appName="Image Converter" path="/convert" Component={ConvertPage} />}
        />
        <Route path="crop" element={<ToolRoute seoKey="crop" appName="Crop" path="/crop" Component={CropPage} />} />
        <Route
          path="rotate"
          element={<ToolRoute seoKey="rotate" appName="Rotate & Flip" path="/rotate" Component={RotatePage} />}
        />
        <Route
          path="watermark"
          element={<ToolRoute seoKey="watermark" appName="Watermark" path="/watermark" Component={WatermarkPage} />}
        />
        <Route
          path="metadata"
          element={
            <ToolRoute seoKey="metadata-remover" appName="Metadata Remover" path="/metadata" Component={MetadataPage} />
          }
        />
        <Route
          path="pdf"
          element={<ToolRoute seoKey="image-to-pdf" appName="Image to PDF" path="/pdf" Component={PdfPage} />}
        />
        {TOOLS.filter((tool) => tool.status === 'coming-soon').map((tool) => (
          <Route key={tool.id} path={tool.path.slice(1)} element={<ComingSoonPage tool={tool} />} />
        ))}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
