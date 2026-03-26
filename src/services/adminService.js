import api from '../lib/api'

export const adminService = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  getCompanies: (params) => api.get('/admin/companies', { params }),
}

export default adminService
