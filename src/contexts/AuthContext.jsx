import { createContext, useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
  const navigate = useNavigate()

  // Check if user is logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    // Restore selected company from previous session if present
    const storedCompany = localStorage.getItem('currentCompany')
    if (storedCompany) {
      try {
        setCurrentCompany(JSON.parse(storedCompany))
      } catch (err) {
        localStorage.removeItem('currentCompany')
      }
    }
    setLoading(false)
  }, [])

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials) => api.post('/auth/login', credentials),
    onSuccess: (data) => {
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      setUser(data.user)
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

  // Set current company
  const selectCompany = (company) => {
    // Normalize company object to include `id` for convenience
    const normalized = { ...company, id: company.id || company._id }
    setCurrentCompany(normalized)
    localStorage.setItem('currentCompany', JSON.stringify(normalized))
  }

  // Get user's companies
  const { data: companies = [], refetch: refetchCompanies } = useQuery({
    queryKey: ['companies'],
    queryFn: () => api.get('/companies'),
    enabled: !!user && user.role !== 'admin'
  })

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