import api from '../lib/api'

const dueManagementService = {
  getDueSummary: (companyId) =>
    api.get('/customers/due-summary', {
      params: { companyId },
    }),

  getCustomerDueHistory: (customerId) =>
    api.get(`/customers/${customerId}/due-history`),

  collectDue: (customerId, payload) =>
    api.post(`/customers/${customerId}/collect-due`, payload),

  getDueMemos: (companyId, params = {}) =>
    api.get('/sales/memos', {
      params: {
        companyId,
        page: 1,
        limit: 100,
        ...params,
      },
    }),
}

export default dueManagementService
