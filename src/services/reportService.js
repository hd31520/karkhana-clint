import api from '../lib/api'

export const reportService = {
  generate: (data) => api.post('/reports/generate', data),
  getAll: (params) => api.get('/reports', { params }),
  getById: (id) => api.get(`/reports/${id}`)
}


