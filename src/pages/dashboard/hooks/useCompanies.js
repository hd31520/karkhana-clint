import { useQuery, useMutation } from '@tanstack/react-query'
import api from '../../utils/api'
import { useToast } from '../../contexts/ToastContext'

export const useCompanies = () => {
  const { showSuccess, showError } = useToast()

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['companies'],
    queryFn: () => api.get('/companies'),
  })

  const companies = data?.companies || []

  const createCompanyMutation = useMutation({
    mutationFn: (companyData) => api.post('/companies', companyData),
    onSuccess: (data) => {
      showSuccess('Company created successfully!')
      refetch()
      return data.company
    },
    onError: (error) => {
      showError(error.message || 'Failed to create company')
    }
  })

  return {
    companies,
    isLoading,
    refetch,
    createCompany: createCompanyMutation.mutate,
    isCreating: createCompanyMutation.isPending
  }
}