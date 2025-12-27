import api from '../utils/api'

export const productService = {
  create: (data) => api.post('/products', data),
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  updateInventory: (id, data) => api.put(`/products/${id}/inventory`, data)
}

