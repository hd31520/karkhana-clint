import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Handle 401 - Unauthorized (token expired/invalid)
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
      return Promise.reject(error)
    }

    // Handle 403 - Forbidden (user doesn't have permission)
    if (error.response?.status === 403) {
      // Log the forbidden access attempt
      console.warn('Access Forbidden:', error.response?.data?.message)
      return Promise.reject(error)
    }

    // Handle 404 - Not Found
    if (error.response?.status === 404) {
      console.warn('Resource not found:', error.response?.data?.message)
      return Promise.reject(error)
    }

    // Handle 500+ - Server errors
    if (error.response?.status >= 500) {
      console.error('Server error:', error.response?.data?.message)
      return Promise.reject(error)
    }

    return Promise.reject(error)
  }
)

export default api
