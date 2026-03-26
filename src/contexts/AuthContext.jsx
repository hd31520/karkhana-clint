import { createContext, useContext, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import api from '@/lib/api'
import authStorage from '../lib/authStorage'

const AuthContext = createContext()

const normalizeCompany = (company) => {
  if (!company) {
    return null
  }

  return {
    ...company,
    id: company.id || company._id,
    _id: company._id || company.id,
  }
}

export const useAuth = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const [user, setUser] = useState(null)
  const [currentCompany, setCurrentCompany] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)

  const clearAuthState = ({ redirectToLogin = true } = {}) => {
    authStorage.clear()
    setUser(null)
    setCurrentCompany(null)
    setError(null)
    queryClient.clear()

    if (redirectToLogin && location.pathname !== '/login') {
      navigate('/login', {
        replace: true,
        state: { from: location.pathname },
      })
    }
  }

  useEffect(() => {
    setUser(authStorage.getUser())
    setCurrentCompany(authStorage.getCompany())
    setLoading(false)
    setIsInitialized(true)
  }, [])

  useEffect(() => {
    const handleUnauthorized = (event) => {
      clearAuthState()
      toast.error(event?.detail?.message || 'Please sign in again.')
    }

    const handleForbidden = (event) => {
      toast.error(event?.detail?.message || 'You do not have permission to access that.')
    }

    const handleServerError = (event) => {
      toast.error(event?.detail?.message || 'Unexpected server error. Please try again.')
    }

    window.addEventListener('auth:unauthorized', handleUnauthorized)
    window.addEventListener('auth:forbidden', handleForbidden)
    window.addEventListener('api:server-error', handleServerError)

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized)
      window.removeEventListener('auth:forbidden', handleForbidden)
      window.removeEventListener('api:server-error', handleServerError)
    }
  }, [location.pathname, navigate])

  const loginMutation = useMutation({
    mutationFn: ({ rememberMe = false, ...credentials }) =>
      api.post('/auth/login', credentials).then((data) => ({ ...data, rememberMe })),
    onSuccess: (data) => {
      authStorage.setToken(data.token, { remember: data.rememberMe })
      authStorage.setUser(data.user)
      authStorage.setCompany(null)
      setUser(data.user)
      setCurrentCompany(null)
      setError(null)
      toast.success('Login successful')
      navigate(data.user.role === 'admin' ? '/admin' : '/dashboard', { replace: true })
    },
    onError: (apiError) => {
      setError(apiError.message)
      toast.error(apiError.message)
    },
  })

  const registerMutation = useMutation({
    mutationFn: (payload) => api.post('/auth/register', payload),
    onSuccess: () => {
      setError(null)
      toast.success('Registration successful. Please sign in.')
      navigate('/login', { replace: true })
    },
    onError: (apiError) => {
      setError(apiError.message)
      toast.error(apiError.message)
    },
  })

  const logout = async () => {
    try {
      if (authStorage.getToken()) {
        await api.post('/auth/logout')
      }
    } catch {
      // Ignore logout request failures and clear local state regardless.
    } finally {
      clearAuthState({ redirectToLogin: true })
      toast.success('Logged out successfully')
    }
  }

  const updateUser = (userData) => {
    setUser(userData)
    authStorage.setUser(userData)
  }

  const selectCompany = (company) => {
    const normalizedCompany = normalizeCompany(company)
    setCurrentCompany(normalizedCompany)
    authStorage.setCompany(normalizedCompany)

    queryClient.invalidateQueries({ queryKey: ['companies'] })
    queryClient.invalidateQueries({ queryKey: ['workers'] })
    queryClient.invalidateQueries({ queryKey: ['attendanceToday'] })
    queryClient.invalidateQueries({ queryKey: ['salarySummary'] })
    queryClient.invalidateQueries({ queryKey: ['sales-stats'] })
    queryClient.invalidateQueries({ queryKey: ['orders'] })
    queryClient.invalidateQueries({ queryKey: ['memos'] })
    queryClient.invalidateQueries({ queryKey: ['transactions'] })
    queryClient.invalidateQueries({ queryKey: ['products-list'] })

    if (user?.role !== 'admin' && normalizedCompany) {
      navigate('/dashboard', { replace: true })
    }
  }

  const {
    data: companiesData,
    refetch: refetchCompanies,
    isFetched: companiesFetched,
    isLoading: companiesLoading,
  } = useQuery({
    queryKey: ['companies'],
    queryFn: () => api.get('/companies'),
    enabled: !!user && user.role !== 'admin' && isInitialized,
  })

  const companies = (companiesData?.companies || companiesData || []).map(normalizeCompany)

  useEffect(() => {
    if (!currentCompany || !companiesFetched || companiesLoading) {
      return
    }

    const matchedCompany = companies.find(
      (company) => company?.id === currentCompany?.id || company?._id === currentCompany?._id
    )

    if (!matchedCompany) {
      setCurrentCompany(null)
      authStorage.setCompany(null)
      return
    }

    if (JSON.stringify(matchedCompany) !== JSON.stringify(currentCompany)) {
      setCurrentCompany(matchedCompany)
      authStorage.setCompany(matchedCompany)
    }
  }, [companies, companiesFetched, companiesLoading, currentCompany])

  useEffect(() => {
    if (!isInitialized || loading || !user || user.role === 'admin' || currentCompany) {
      return
    }

    if (location.pathname.includes('company-select')) {
      return
    }

    if (companies.length === 1) {
      const normalizedCompany = normalizeCompany(companies[0])
      setCurrentCompany(normalizedCompany)
      authStorage.setCompany(normalizedCompany)

      if (location.pathname !== '/dashboard') {
        navigate('/dashboard', { replace: true })
      }
    }
  }, [companies, currentCompany, isInitialized, loading, location.pathname, navigate, user])

  const value = {
    user,
    loading,
    currentCompany,
    login: loginMutation.mutate,
    loginLoading: loginMutation.isPending,
    register: registerMutation.mutate,
    registerLoading: registerMutation.isPending,
    error,
    logout,
    updateUser,
    selectCompany,
    companies,
    companiesLoading,
    companiesFetched,
    refetchCompanies,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

