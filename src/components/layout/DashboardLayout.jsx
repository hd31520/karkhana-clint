import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import Sidebar from './Sidebar'
import Header from './Header'
import LoadingSpinner from '../shared/LoadingSpinner'
import { useState } from 'react'

const DashboardLayout = ({ admin = false }) => {
  const { user, loading, isAuthenticated } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  if (loading) {
    return <LoadingSpinner fullScreen />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  if (admin && user?.role !== 'admin') {
    return <Navigate to="/dashboard" />
  }

  if (!admin && user?.role === 'admin') {
    return <Navigate to="/admin" />
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar (desktop) and mobile drawer */}
      <Sidebar admin={admin} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="flex-1 flex flex-col">
        <Header admin={admin} onMobileToggle={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout