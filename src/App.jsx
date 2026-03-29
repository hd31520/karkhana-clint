import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import MainLayout from './components/layout/MainLayout'
import DashboardLayout from './components/layout/DashboardLayout'
import ProtectedRoute from './components/auth/ProtectedRoute'
import PageNotFound from './pages/PageNotFound'
import FullPageSpinner from './components/shared/FullPageSpinner'

// Lazy load pages
const Home = lazy(() => import('./pages/Home'))
const Login = lazy(() => import('./pages/auth/Login'))
const Register = lazy(() => import('./pages/auth/Register'))
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'))
const CompleteRegistration = lazy(() => import('./pages/auth/CompleteRegistration'))
const SetPassword = lazy(() => import('./pages/auth/SetPassword'))
const PaymentResult = lazy(() => import('./pages/payments/PaymentResult'))
const Dashboard = lazy(() => import('./pages/dashboard/Overview'))
const CompanySelect = lazy(() => import('./pages/dashboard/CompanySelect'))
const Profile = lazy(() => import('./pages/dashboard/Profile'))
const AttendanceSystem = lazy(() => import('./pages/company/AttendanceSystem'))
const Workers = lazy(() => import('./pages/company/Workers'))
const Roles = lazy(() => import('./pages/company/Roles'))
const Products = lazy(() => import('./pages/company/Products'))
const ProductDetail = lazy(() => import('./pages/company/ProductDetail'))
const Inventory = lazy(() => import('./pages/company/Inventory'))
const DueManagement = lazy(() => import('./pages/company/due-management'))
const Sales = lazy(() => import('./pages/company/Sales'))
const Customers = lazy(() => import('./pages/company/Customers'))
const Salary = lazy(() => import('./pages/company/Salary'))
const Reports = lazy(() => import('./pages/company/Reports'))
const CompanySettings = lazy(() => import('./pages/company/Settings'))
const WorkerAttendance = lazy(() => import('./pages/company/WorkerAttendance'))
const AttendanceOverview = lazy(() => import('./pages/company/AttendanceOverview'))
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'))
const AdminUsers = lazy(() => import('./pages/admin/Users'))
const AdminCompanies = lazy(() => import('./pages/admin/Companies'))
const AdminSettings = lazy(() => import('./pages/admin/Settings'))

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Suspense fallback={<FullPageSpinner />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="reset-password" element={<ResetPassword />} />
              <Route path="complete-registration/:token" element={<CompleteRegistration />} />
              <Route path="set-password" element={<SetPassword />} />
              <Route path="payments/result" element={<PaymentResult />} />
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
              
              {/* Company Management Routes */}
              <Route path="attendance-system" element={<AttendanceSystem />} />
              <Route path="workers" element={<Workers />} />
              <Route path="workers/:id/attendance" element={<WorkerAttendance />} />
              <Route path="attendance" element={<AttendanceOverview />} />
              <Route path="roles" element={<Roles />} />
              <Route path="products" element={<Products />} />
              <Route path="products/:id" element={<ProductDetail />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="due-management" element={<DueManagement />} />
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
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
