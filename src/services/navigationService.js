import api from '@/lib/api'

export const getNavigation = async (companyId) => {
  try {
    const params = companyId ? { companyId } : {}
    const response = await api.get('/navigation', { params })
    return response
  } catch (error) {
    console.error('Error fetching navigation:', error)
    throw error
  }
}

