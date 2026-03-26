import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../../lib/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card'
import { Button } from '../../components/ui/button'

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => api.get(`/products/${id}`),
    enabled: !!id
  })

  const product = data?.product

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error loading product</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Product Details</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/dashboard/products')}>Back</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{product.name}</CardTitle>
          <CardDescription>SKU: {product.sku}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium">Pricing</h3>
              <p>Cost: ৳{product.price?.cost ?? 0}</p>
              <p>Selling: ৳{product.price?.selling ?? 0}</p>
            </div>
            <div>
              <h3 className="font-medium">Inventory</h3>
              <p>Quantity: {product.inventory?.quantity ?? 0} {product.inventory?.unit || ''}</p>
              <p>Min Stock: {product.inventory?.minStock ?? '-'}</p>
              <p>Location: {product.inventory?.location || '-'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ProductDetail

