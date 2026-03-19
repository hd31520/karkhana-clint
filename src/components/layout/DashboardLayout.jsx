import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import Sidebar from './Sidebar'
import Header from './Header'
import LoadingSpinner from '../shared/LoadingSpinner'
import { useState } from 'react'

const DashboardLayout = ({ admin = false }) => {
  const { user, loading, isAuthenticated, currentCompany } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  if (loading) {
    return <LoadingSpinner fullScreen />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  if (admin && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  if (!admin && user?.role === 'admin') {
    return <Navigate to="/admin" replace />
  }

  // REMOVED the auto-redirect to company-select
  // Let users access all pages, each page will handle "no company" state

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar (desktop) and mobile drawer */}
      <Sidebar 
        admin={admin} 
        mobileOpen={mobileOpen} 
        setMobileOpen={setMobileOpen} 
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header admin={admin} onMobileToggle={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto px-3 py-4 sm:px-4 md:px-6">
          <div className="mx-auto w-full max-w-[1600px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
