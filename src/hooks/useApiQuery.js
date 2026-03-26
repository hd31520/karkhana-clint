import { useQuery } from '@tanstack/react-query'

const useApiQuery = ({ queryKey, queryFn, ...options }) =>
  useQuery({
    queryKey,
    queryFn,
    ...options,
  })

export default useApiQuery
