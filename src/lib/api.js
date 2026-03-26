import axios from 'axios'
import authStorage from './authStorage'

const API_ERROR_MESSAGES = {
  401: 'Your session has expired. Please sign in again.',
  403: 'You do not have permission to perform this action.',
  500: 'Something went wrong on the server. Please try again.',
}

const normalizeError = (error) => {
  if (error.response?.data) {
    const payload = error.response.data
    const status = error.response.status

    return {
      status,
      success: payload.success ?? false,
      message: payload.message || API_ERROR_MESSAGES[status] || 'Request failed',
      data: payload.data,
    }
  }

  return {
    status: 0,
    success: false,
    message: 'Network error. Please check your connection and try again.',
    data: null,
  }
}

const withDataShape = (payload) => {
  if (Array.isArray(payload) || payload === null || typeof payload !== 'object') {
    return payload
  }

  return typeof payload.data === 'undefined'
    ? { ...payload, data: payload }
    : payload
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

api.interceptors.request.use(
  (config) => {
    const token = authStorage.getToken()

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(normalizeError(error))
)

api.interceptors.response.use(
  (response) => withDataShape(typeof response.data?.data !== 'undefined' ? response.data.data : response.data),
  (error) => {
    const normalizedError = normalizeError(error)

    if (normalizedError.status === 401) {
      authStorage.clear()
      window.dispatchEvent(new CustomEvent('auth:unauthorized', { detail: normalizedError }))
    }

    if (normalizedError.status === 403) {
      window.dispatchEvent(new CustomEvent('auth:forbidden', { detail: normalizedError }))
    }

    if (normalizedError.status >= 500 || normalizedError.status === 0) {
      window.dispatchEvent(new CustomEvent('api:server-error', { detail: normalizedError }))
    }

    return Promise.reject(normalizedError)
  }
)

export { API_ERROR_MESSAGES, normalizeError }
export default api
