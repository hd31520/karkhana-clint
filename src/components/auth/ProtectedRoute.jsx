import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import LoadingSpinner from '../shared/LoadingSpinner'

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading, isAuthenticated } = useAuth()
  const location = useLocation()

  if (loading) {
    return <LoadingSpinner fullScreen />
  }

  if (!isAuthenticated) {
    // Redirect to login, but save the attempted location
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  if (requireAdmin && user?.role !== 'admin') {
    // User is not admin but trying to access admin route
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default ProtectedRoute