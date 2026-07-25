import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import { useDarkMode } from '../hooks/useDarkMode'

export default function Layout() {
  const { isDark, toggle } = useDarkMode()

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar isDark={isDark} onToggleDark={toggle} />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  )
}
