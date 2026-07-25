import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import CompressPage from './pages/CompressPage'
import ComingSoonPage from './pages/ComingSoonPage'
import NotFoundPage from './pages/NotFoundPage'
import { TOOLS } from './lib/tools'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="compress" element={<CompressPage />} />
        {TOOLS.filter((tool) => tool.status === 'coming-soon').map((tool) => (
          <Route key={tool.id} path={tool.path.slice(1)} element={<ComingSoonPage tool={tool} />} />
        ))}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
