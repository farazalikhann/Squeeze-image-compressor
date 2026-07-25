import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import CompressPage from './pages/CompressPage'
import ResizePage from './pages/ResizePage'
import ConvertPage from './pages/ConvertPage'
import CropPage from './pages/CropPage'
import RotatePage from './pages/RotatePage'
import WatermarkPage from './pages/WatermarkPage'
import MetadataPage from './pages/MetadataPage'
import ComingSoonPage from './pages/ComingSoonPage'
import NotFoundPage from './pages/NotFoundPage'
import { TOOLS } from './lib/tools'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="compress" element={<CompressPage />} />
        <Route path="resize" element={<ResizePage />} />
        <Route path="convert" element={<ConvertPage />} />
        <Route path="crop" element={<CropPage />} />
        <Route path="rotate" element={<RotatePage />} />
        <Route path="watermark" element={<WatermarkPage />} />
        <Route path="metadata" element={<MetadataPage />} />
        {TOOLS.filter((tool) => tool.status === 'coming-soon').map((tool) => (
          <Route key={tool.id} path={tool.path.slice(1)} element={<ComingSoonPage tool={tool} />} />
        ))}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
