import api from '../utils/api'

export const salesService = {
  createOrder: (data) => api.post('/sales/orders', data),
  createMemo: (data) => api.post('/sales/memos', data),
  getOrders: (params) => api.get('/sales/orders', { params }),
  getMemos: (params) => api.get('/sales/memos', { params }),
  updateOrderStatus: (id, status) => api.put(`/sales/orders/${id}/status`, { status })
}

