import api from '../lib/api'

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.put(`/auth/reset-password/${token}`, { password }),
  setPassword: (token, password) => api.put(`/auth/set-password/${token}`, { password }),
  updatePassword: (currentPassword, newPassword) =>
    api.put('/auth/update-password', { currentPassword, newPassword }),
  resendVerification: (email) => api.post('/auth/resend-verification', { email }),
  logout: () => api.post('/auth/logout'),
}

export default authService
