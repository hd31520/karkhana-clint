import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import MainLayout from './components/layout/MainLayout'
import Home from './pages/Home'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import CompleteRegistration from './pages/auth/CompleteRegistration'
import DashboardLayout from './components/layout/DashboardLayout'
import Dashboard from './pages/dashboard/Overview'
import CompanySelect from './pages/dashboard/CompanySelect'
import Profile from './pages/dashboard/Profile'

// Company pages
import Workers from './pages/company/Workers'
import Roles from './pages/company/Roles'
import Products from './pages/company/Products'
import Inventory from './pages/company/Inventory'
import Sales from './pages/company/Sales'
import Customers from './pages/company/Customers'
import Salary from './pages/company/Salary'
import Reports from './pages/company/Reports'
import CompanySettings from './pages/company/Settings'

// Admin pages
import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import AdminCompanies from './pages/admin/Companies'
import AdminSettings from './pages/admin/Settings'

// Protected Route Component
import ProtectedRoute from './components/auth/ProtectedRoute'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password" element={<ResetPassword />} />
            <Route path="complete-registration/:token" element={<CompleteRegistration />} />
          </Route>

          {/* Dashboard Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="company-select" element={<CompanySelect />} />
            <Route path="profile" element={<Profile />} />
            <Route path="profile/:companyId" element={<Profile />} />
            
            {/* Company Management Routes */}
            <Route path="workers" element={<Workers />} />
            <Route path="roles" element={<Roles />} />
            <Route path="products" element={<Products />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="sales" element={<Sales />} />
            <Route path="customers" element={<Customers />} />
            <Route path="salary" element={<Salary />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<CompanySettings />} />
          </Route>

          {/* Admin Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <DashboardLayout admin={true} />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="companies" element={<AdminCompanies />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<div>404 - Page Not Found</div>} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App