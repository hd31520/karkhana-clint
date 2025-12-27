import api from '../utils/api'

export const salaryService = {
  calculate: (data) => api.post('/salary/calculate', data),
  calculateAll: (data) => api.post('/salary/calculate-all', data),
  getAll: (params) => api.get('/salary', { params }),
  pay: (id, data) => api.put(`/salary/${id}/pay`, data),
  getSlip: (id) => api.get(`/salary/${id}/slip`)
}

