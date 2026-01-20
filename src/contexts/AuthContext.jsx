import { createContext, useState, useContext, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import api from '@utils/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentCompany, setCurrentCompany] = useState(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  // Check if user is logged in on mount - FIXED
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token')
      const storedUser = localStorage.getItem('user')
      
      if (token && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser)
          setUser(parsedUser)
          
          // Only restore company if user is not admin
          if (parsedUser.role !== 'admin') {
            const storedCompany = localStorage.getItem('currentCompany')
            if (storedCompany) {
              try {
                const parsedCompany = JSON.parse(storedCompany)
                setCurrentCompany(parsedCompany)
              } catch (err) {
                console.error('Failed to parse stored company:', err)
                localStorage.removeItem('currentCompany')
              }
            }
          }
        } catch (error) {
          console.error('Auth initialization error:', error)
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          localStorage.removeItem('currentCompany')
        }
      }
      setLoading(false)
      setIsInitialized(true)
    }

    initializeAuth()
  }, [])

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials) => api.post('/auth/login', credentials),
    onSuccess: (data) => {
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      setUser(data.user)
      
      // Clear company on login
      setCurrentCompany(null)
      localStorage.removeItem('currentCompany')
      
      toast.success('Login successful!')
      
      // Redirect based on role
      if (data.user.role === 'admin') {
        navigate('/admin')
      } else {
        navigate('/dashboard')
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Login failed')
    }
  })

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (userData) => api.post('/auth/register', userData),
    onSuccess: (data) => {
      setError(null)
      // If company is returned, store it
      if (data.company) {
        const normalizedCompany = { ...data.company, id: data.company.id || data.company._id }
        setCurrentCompany(normalizedCompany)
        localStorage.setItem('currentCompany', JSON.stringify(normalizedCompany))
      }
      toast.success('Registration successful! Please login.')
      navigate('/login')
    },
    onError: (error) => {
      // Parse different error shapes (axios error.response.data or direct object)
      let msg = 'Registration failed'
      try {
        if (!error) msg = 'Registration failed'
        else if (typeof error === 'string') msg = error
        else if (error.message) msg = error.message
        else if (error.errors) {
          // Joi or validation errors
          if (Array.isArray(error.errors)) msg = error.errors.map(e => e.message || e).join(', ')
          else msg = JSON.stringify(error.errors)
        } else if (error.success === false && error.message) {
          msg = error.message
        }
      } catch (err) {
        msg = 'Registration failed'
      }
      setError(msg)
      toast.error(msg)
    }
  })

  // Logout function
  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('currentCompany')
    setUser(null)
    setCurrentCompany(null)
    navigate('/login')
    toast.success('Logged out successfully')
  }

  // Update user function
  const updateUser = (userData) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  // Set current company - FIXED
  const selectCompany = (company) => {
    if (!company) {
      setCurrentCompany(null)
      localStorage.removeItem('currentCompany')
      return
    }
    
    // Normalize company object
    const normalized = { 
      ...company, 
      id: company.id || company._id,
      _id: company._id || company.id
    }
    
    console.log('Selecting company:', normalized)
    setCurrentCompany(normalized)
    localStorage.setItem('currentCompany', JSON.stringify(normalized))
    
    // Navigate to dashboard after selecting company
    if (user?.role !== 'admin') {
      navigate('/dashboard', { replace: true })
    }
  }

  // Get user's companies
  const { data: companies = [], refetch: refetchCompanies } = useQuery({
    queryKey: ['companies'],
    queryFn: () => api.get('/companies'),
    enabled: !!user && user.role !== 'admin' && isInitialized
  })

  // Auto-select logic - SIMPLIFIED AND FIXED
  useEffect(() => {
    if (!isInitialized || loading || !user || user.role === 'admin') return
    
    // Skip if already on company-select page
    if (location.pathname.includes('company-select')) return
    
    // Skip if company is already selected
    if (currentCompany) return
    
    // Only auto-select if user has exactly one company
    if (Array.isArray(companies) && companies.length === 1) {
      const firstCompany = companies[0]
      const normalizedCompany = { 
        ...firstCompany, 
        id: firstCompany.id || firstCompany._id, 
        _id: firstCompany._id || firstCompany.id 
      }
      
      console.log('Auto-selecting company:', normalizedCompany)
      setCurrentCompany(normalizedCompany)
      localStorage.setItem('currentCompany', JSON.stringify(normalizedCompany))
      
      // Navigate to dashboard
      if (location.pathname === '/dashboard') {
        // Already on dashboard, just reload
        window.location.reload()
      } else {
        navigate('/dashboard', { replace: true })
      }
    }
  }, [companies, user, currentCompany, loading, isInitialized, location.pathname, navigate])

  const value = {
    user,
    loading,
    currentCompany,
    login: loginMutation.mutate,
    loginLoading: loginMutation.isLoading,
    register: registerMutation.mutate,
    registerLoading: registerMutation.isLoading,
    error,
    logout,
    updateUser,
    selectCompany,
    companies,
    refetchCompanies,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}