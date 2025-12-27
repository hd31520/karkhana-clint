import { useEffect } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import RegisterForm from '../../components/auth/RegisterForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'

const Register = () => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-primary"></div>
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 dark:bg-gray-900">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <Link to="/" className="inline-block">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <span className="text-xl font-bold">Karkhana.shop</span>
            </div>
          </Link>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Factory, Shop & Showroom Management System
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
              Start Your Digital Transformation Journey
            </h1>
            <p className="mb-6 text-lg text-gray-600 dark:text-gray-300">
              Join hundreds of manufacturers, shopkeepers, and showroom owners 
              who are already managing their businesses efficiently with Karkhana.shop
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                  <svg className="h-4 w-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Save Time on Manual Tasks</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Automate salary calculation, attendance tracking, and inventory management
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                  <svg className="h-4 w-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Make Better Decisions</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Get real-time insights with comprehensive reports and analytics
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                  <svg className="h-4 w-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Grow Your Business</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Scale efficiently with features designed for growing businesses
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
              <h4 className="mb-2 font-semibold">14-Day Free Trial</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                No credit card required. All features included. Cancel anytime.
              </p>
            </div>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Create Your Account</CardTitle>
                <CardDescription>
                  Fill in your details to get started
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RegisterForm />
              </CardContent>
            </Card>

            <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-300">
              <p>
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-primary hover:underline">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register