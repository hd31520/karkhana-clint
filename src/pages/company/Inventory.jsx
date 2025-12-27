import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../utils/api'
import { useAuth } from '../../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Badge } from '../../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { 
  Package,
  PackagePlus,
  Search,
  Filter,
  Download,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Barcode,
  Move,
  History
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const { currentCompany } = useAuth()
  const queryClient = useQueryClient()

  // Products (used as inventory items list)
  const { data: productsRes, isLoading: productsLoading } = useQuery({
    queryKey: ['products', currentCompany?.id, page, limit, searchTerm],
    queryFn: () => api.get('/products', { params: { companyId: currentCompany?.id, page, limit, search: searchTerm } }),
    enabled: !!currentCompany,
  })

  const products = productsRes?.products || []
  const productsTotal = productsRes?.total ?? products.length

  // Total stock value (aggregated)
  const { data: stockValueRes } = useQuery({
    queryKey: ['products-stock-value', currentCompany?.id],
    queryFn: () => api.get('/products/stock-value', { params: { companyId: currentCompany?.id } }),
    enabled: !!currentCompany,
  })
  const totalStockValue = stockValueRes?.totalValue ?? 0

  // Stock alerts
  const { data: alertsRes } = useQuery({
    queryKey: ['inventory-alerts', currentCompany?.id],
    queryFn: () => api.get('/inventory/alerts', { params: { companyId: currentCompany?.id } }),
    enabled: !!currentCompany,
  })

  const alerts = alertsRes?.alerts || { lowStock: 0, outOfStock: 0, products: { lowStock: [], outOfStock: [] } }

  // Inventory movement/history
  const { data: historyRes } = useQuery({
    queryKey: ['inventory-history', currentCompany?.id, page, limit],
    queryFn: () => api.get('/inventory', { params: { companyId: currentCompany?.id, page, limit } }),
    enabled: !!currentCompany,
  })
  const history = historyRes?.inventory || []

  // Compute categories summary from products
  const categoryData = useMemo(() => {
    const map = {}
    for (const p of products) {
      const cat = (p.category && p.category.name) || p.category || 'Uncategorized'
      if (!map[cat]) map[cat] = { category: cat, stock: 0, value: 0 }
      const qty = p.inventory?.quantity || 0
      const cost = p.price?.cost || 0
      map[cat].stock += qty
      map[cat].value += qty * cost
    }
    return Object.values(map).map(c => ({ ...c, value: `৳${Number(c.value).toLocaleString()}` }))
  }, [products])

  const filteredInventory = products.filter(item =>
    (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.sku || item.code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    ((item.category && (item.category.name || item.category)) || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatCurrency = (value) => {
    if (!value) return '৳0'
    if (value >= 1_000_000) return `৳${(value / 1_000_000).toFixed(1)}M`
    if (value >= 1_000) return `৳${(value / 1_000).toFixed(1)}k`
    return `৳${Number(value).toFixed(2)}`
  }

  const movementData = useMemo(() => {
    // Build simple daily incoming/outgoing from history
    const map = {}
    for (const h of history) {
      const date = new Date(h.createdAt || h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      if (!map[date]) map[date] = { date, incoming: 0, outgoing: 0 }
      if (h.type === 'in' || h.type === 'purchase') {
        map[date].incoming += Math.abs(h.quantity || 0)
      } else if (h.type === 'out' || h.type === 'sale') {
        map[date].outgoing += Math.abs(h.quantity || 0)
      } else if (h.type === 'transfer') {
        // treat transfer as outgoing here
        map[date].outgoing += Math.abs(h.quantity || 0)
      }
    }
    return Object.values(map).slice(-15)
  }, [history])

  const getStatusColor = (status) => {
    const colors = {
      'in-stock': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'low-stock': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
      'out-of-stock': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    }
    return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground">
            Track and manage your inventory in real-time
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <RefreshCw className="mr-2 h-4 w-4" />
            Stock Count
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stock Value</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalStockValue)}</div>
            <p className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
              +8.5% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productsTotal}</div>
            <p className="flex items-center text-xs text-muted-foreground">
              <TrendingDown className="mr-1 h-3 w-3 text-red-600" />
              -3 items from last count
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(alerts.lowStock || 0) + (alerts.outOfStock || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Need immediate attention
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Turnover Rate</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.8x</div>
            <p className="text-xs text-muted-foreground">
              Annual inventory turnover
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="items">All Items</TabsTrigger>
          <TabsTrigger value="movement">Movement</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Inventory Movement</CardTitle>
                <CardDescription>
                  Daily incoming and outgoing stock
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={movementData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="incoming"
                        stroke="#10B981"
                        strokeWidth={2}
                        name="Incoming Stock"
                      />
                      <Line
                        type="monotone"
                        dataKey="outgoing"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        name="Outgoing Stock"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Stock by Category</CardTitle>
                <CardDescription>
                  Inventory distribution across categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="stock"
                        fill="#8B5CF6"
                        name="Stock Quantity"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common inventory management tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Button variant="outline" className="h-auto flex-col items-center justify-center p-4">
                  <Barcode className="mb-2 h-5 w-5" />
                  <span className="text-sm">Scan Items</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col items-center justify-center p-4">
                  <Move className="mb-2 h-5 w-5" />
                  <span className="text-sm">Transfer Stock</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col items-center justify-center p-4">
                  <PackagePlus className="mb-2 h-5 w-5" />
                  <span className="text-sm">Receive Stock</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col items-center justify-center p-4">
                  <History className="mb-2 h-5 w-5" />
                  <span className="text-sm">View History</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="items">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Inventory Items</CardTitle>
                  <CardDescription>
                    Detailed view of all inventory items
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search inventory..."
                      className="w-64 pl-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Code</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Stock Levels</TableHead>
                    <TableHead>Stock Value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInventory.map((item) => {
                    const id = item._id || item.id
                    const code = item.sku || item.code || '-'
                    const name = item.name || item.productName || '-'
                    const category = (item.category && (item.category.name || item.category)) || '-'
                    const currentStock = item.inventory?.quantity ?? 0
                    const minStock = item.inventory?.minStock ?? 0
                    const maxStock = item.inventory?.maxStock ?? 1
                    const unit = item.inventory?.unit || ''
                    const stockValue = (currentStock * (item.price?.cost || 0)) || 0
                    const status = currentStock === 0 ? 'out-of-stock' : (currentStock <= minStock ? 'low-stock' : 'in-stock')
                    const lastUpdated = item.updatedAt || item.lastUpdated || item.createdAt || ''
                    return (
                      <TableRow key={id}>
                        <TableCell className="font-medium">{code}</TableCell>
                        <TableCell>{name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{category}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>Current: {currentStock} {unit}</span>
                              <span className="text-muted-foreground">Min: {minStock}</span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                              <div
                                className={`h-full rounded-full ${
                                  status === 'in-stock' ? 'bg-green-600' : status === 'low-stock' ? 'bg-amber-600' : 'bg-red-600'
                                }`}
                                style={{ width: `${(currentStock / Math.max(maxStock, 1)) * 100}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{formatCurrency(stockValue)}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(status)}>
                            {status.replace('-', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{lastUpdated ? new Date(lastUpdated).toLocaleString() : '-'}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movement">
          <Card>
            <CardHeader>
              <CardTitle>Stock Movement History</CardTitle>
              <CardDescription>
                Track all inventory movements and adjustments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>By</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((movement) => (
                    <TableRow key={movement._id || movement.id}>
                      <TableCell className="text-sm">{new Date(movement.createdAt).toLocaleString()}</TableCell>
                      <TableCell className="font-medium">{movement.product?.name || movement.product || '-'}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            movement.type === 'out' || movement.type === 'sale' ? 'destructive'
                            : movement.type === 'in' || movement.type === 'purchase' ? 'default'
                            : 'outline'
                          }
                        >
                          {movement.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={movement.quantity > 0 ? 'text-green-600' : 'text-red-600'}>
                          {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">{movement.reference || movement._id}</TableCell>
                      <TableCell className="text-sm">{movement.performedBy?.name || '-'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {movement.reason || movement.remarks || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Category Summary</CardTitle>
                <CardDescription>
                  Inventory breakdown by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {categoryData.map((category) => (
                    <div key={category.category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{category.category}</span>
                        <span className="text-sm text-muted-foreground">
                          {category.stock} items
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${(category.stock / 340) * 100}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Stock Value</span>
                        <span className="font-medium">{category.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Management</CardTitle>
                <CardDescription>
                  Add or edit product categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="category-name">Category Name</Label>
                    <Input id="category-name" placeholder="Enter category name" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="parent-category">Parent Category (Optional)</Label>
                    <select
                      id="parent-category"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="">Select parent category</option>
                      <option value="furniture">Furniture</option>
                      <option value="electronics">Electronics</option>
                      <option value="textile">Textile</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category-description">Description</Label>
                    <Input id="category-description" placeholder="Brief description" />
                  </div>
                  
                  <Button className="w-full">Add Category</Button>
                </div>
                
                <div className="mt-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                  <h4 className="mb-2 font-medium">Category Tips</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Use clear, descriptive category names</li>
                    <li>• Create hierarchical categories for better organization</li>
                    <li>• Regularly review and update categories</li>
                    <li>• Assign products to appropriate categories</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Inventory
