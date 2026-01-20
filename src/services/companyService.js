import api from '../utils/api'

export const companyService = {
  create: (data) => api.post('/companies', data),
  getAll: (params) => api.get('/companies', { params }),
  getById: (id) => api.get(`/companies/${id}`),
  update: (id, data) => api.put(`/companies/${id}`, data),
  delete: (id) => api.delete(`/companies/${id}`),
  getStats: (id) => api.get(`/companies/${id}/stats`)
}

