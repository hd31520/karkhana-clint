import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
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
import { Download, Plus, Eye, Edit, Trash2, MoreVertical, Mail, Printer, ShoppingCart, TrendingUp, DollarSign, Users, Package, Filter, Search } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '../../components/ui/dropdown-menu'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog'

const Sales = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('orders')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const { currentCompany } = useAuth()

  const { data: statsRes } = useQuery({
    queryKey: ['sales-stats', currentCompany?.id],
    queryFn: () => api.get('/sales/stats', { params: { companyId: currentCompany?.id } }),
    enabled: !!currentCompany,
  })

  const stats = statsRes?.stats || { totalSales: 0, totalOrders: 0, activeCustomers: 0, avgOrder: 0, monthly: [] }

  const { data: ordersRes } = useQuery({
    queryKey: ['orders', currentCompany?.id, page, limit, searchTerm],
    queryFn: () => api.get('/sales/orders', { params: { companyId: currentCompany?.id, page, limit, search: searchTerm } }),
    enabled: !!currentCompany,
  })

  const orders = ordersRes?.orders || []
  const ordersTotal = ordersRes?.total ?? orders.length

  const { data: memosRes } = useQuery({
    queryKey: ['memos', currentCompany?.id, page, limit],
    queryFn: () => api.get('/sales/memos', { params: { companyId: currentCompany?.id, page, limit } }),
    enabled: !!currentCompany,
  })

  const memos = memosRes?.memos || []

  const { data: transactionsRes } = useQuery({
    queryKey: ['transactions', currentCompany?.id, page, limit],
    queryFn: () => api.get('/payments/transactions', { params: { companyId: currentCompany?.id, page: 1, limit: 10 } }),
    enabled: !!currentCompany,
  })

  const transactions = transactionsRes?.transactions || []

  const salesData = useMemo(() => {
    // Map monthly aggregation into chart-friendly array
    return (stats.monthly || []).map(m => ({
      month: `${m._id.month}/${m._id.year}`,
      sales: m.total || 0,
      orders: m.orders || 0
    }))
  }, [stats.monthly])

  const filteredOrders = (orders || []).filter(order =>
    (order.orderNumber || order.orderNumberString || '').toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.customer?.name || order.customer || '').toString().toLowerCase().includes(searchTerm.toLowerCase())
  )

  const statusCounts = useMemo(() => {
    const map = {}
    for (const o of orders) {
      const s = o.status || o.orderStatus || 'Pending'
      map[s] = (map[s] || 0) + 1
    }
    // Ensure common statuses exist
    const statuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled']
    return statuses.map(s => ({ status: s, count: map[s] || 0, color: s === 'Pending' ? 'bg-amber-500' : s === 'Confirmed' ? 'bg-blue-500' : s === 'Processing' ? 'bg-purple-500' : s === 'Shipped' ? 'bg-cyan-500' : s === 'Delivered' ? 'bg-green-500' : 'bg-red-500' }))
  }, [orders])

  const getPaymentColor = (status) => {
    const colors = {
      'Paid': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'Pending': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
      'Partial': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    }
    return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
      'Confirmed': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'Processing': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'Shipped': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
      'Delivered': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'Cancelled': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    }
    return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Management</h1>
          <p className="text-muted-foreground">
            Manage orders, process sales, and track payments
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Sale
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Create New Sale</DialogTitle>
                <DialogDescription>
                  Process a new sale order
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer">Customer</Label>
                    <Input id="customer" placeholder="Search or add customer" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" type="date" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Label>Products</Label>
                  <div className="rounded-lg border">
                    <div className="grid grid-cols-12 gap-4 p-4 border-b">
                      <div className="col-span-6 font-medium">Product</div>
                      <div className="col-span-2 font-medium">Quantity</div>
                      <div className="col-span-2 font-medium">Price</div>
                      <div className="col-span-2 font-medium">Total</div>
                    </div>
                    <div className="p-4">
                      <div className="text-center text-muted-foreground">
                        Add products to this sale
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="payment-method">Payment Method</Label>
                      <select
                        id="payment-method"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <option value="">Select method</option>
                        <option value="cash">Cash</option>
                        <option value="card">Card</option>
                        <option value="bank">Bank Transfer</option>
                        <option value="mobile">Mobile Banking</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Input id="notes" placeholder="Additional notes" />
                    </div>
                  </div>
                  
                  <div className="space-y-4 rounded-lg border p-4">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-medium">৳0</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Discount</span>
                      <span className="font-medium">৳0</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span className="font-medium">৳0</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-semibold">Total</span>
                      <span className="text-xl font-bold">৳0</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3">
                  <Button variant="outline">Cancel</Button>
                  <Button>Process Sale</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(stats.totalSales || 0)}</div>
            <p className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
              +23% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders ?? ordersTotal}</div>
            <p className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
              +15% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCustomers}</div>
            <p className="text-xs text-muted-foreground">
              +8 new this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(stats.avgOrder || 0)}</div>
            <p className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
              +5% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="memos">Memos</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="orders" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Orders</CardTitle>
                  <CardDescription>
                    Manage and track all customer orders
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search orders..."
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
                    <TableHead>Order #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.orderNumber}</TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell className="text-sm">{order.date}</TableCell>
                      <TableCell>{order.items}</TableCell>
                      <TableCell className="font-medium">{order.amount}</TableCell>
                      <TableCell>
                        <Badge className={getPaymentColor(order.payment)}>
                          {order.payment}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {order.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Order
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Printer className="mr-2 h-4 w-4" />
                              Print Invoice
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="mr-2 h-4 w-4" />
                              Send Email
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Cancel Order
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredOrders.length === 0 && (!ordersRes || (ordersRes && ordersRes.total === 0)) && (
                <div className="py-12 text-center">
                  <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No orders found</h3>
                  <p className="mt-2 text-muted-foreground">
                    No orders match your search criteria.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Order Statistics</CardTitle>
                <CardDescription>
                  Order status distribution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {statusCounts.map((stat) => (
                    <div key={stat.status} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{stat.status}</span>
                        <span className="text-sm text-muted-foreground">{stat.count} orders</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                        <div
                          className={`h-full rounded-full ${stat.color}`}
                          style={{ width: `${(stat.count / Math.max(stats.totalOrders || ordersTotal || 1, 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common sales operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="h-auto flex-col items-center justify-center p-4">
                    <ShoppingCart className="mb-2 h-5 w-5" />
                    <span className="text-sm">POS Sale</span>
                  </Button>
                  <Button variant="outline" className="h-auto flex-col items-center justify-center p-4">
                    <Printer className="mb-2 h-5 w-5" />
                    <span className="text-sm">Print Memo</span>
                  </Button>
                  <Button variant="outline" className="h-auto flex-col items-center justify-center p-4">
                    <Download className="mb-2 h-5 w-5" />
                    <span className="text-sm">Export Sales</span>
                  </Button>
                  <Button variant="outline" className="h-auto flex-col items-center justify-center p-4">
                    <Mail className="mb-2 h-5 w-5" />
                    <span className="text-sm">Send Invoice</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="memos">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Offline Sales (Memos)</CardTitle>
                  <CardDescription>
                    Manage offline sales and customer memos
                  </CardDescription>
                </div>
                <Button>
                  <Printer className="mr-2 h-4 w-4" />
                  New Memo
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Memo #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Paid Amount</TableHead>
                    <TableHead>Due Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {memos.map((memo) => (
                    <TableRow key={memo.id}>
                      <TableCell className="font-medium">{memo.memoNumber}</TableCell>
                      <TableCell>{memo.customer}</TableCell>
                      <TableCell className="text-sm">{memo.date}</TableCell>
                      <TableCell className="font-medium">{memo.amount}</TableCell>
                      <TableCell className="text-green-600">{memo.paid}</TableCell>
                      <TableCell className={memo.due !== '৳0' ? 'text-red-600' : ''}>
                        {memo.due}
                      </TableCell>
                      <TableCell>
                        <Badge className={getPaymentColor(memo.status)}>
                          {memo.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <Printer className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="rounded-lg border p-6">
            <h3 className="mb-4 text-lg font-semibold">Memo Generator</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="memo-customer">Customer Name</Label>
                  <Input id="memo-customer" placeholder="Enter customer name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="memo-date">Date</Label>
                  <Input id="memo-date" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="memo-products">Products</Label>
                  <select
                    id="memo-products"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Select products</option>
                    <option value="chair">Wooden Dining Chair</option>
                    <option value="table">Steel Office Table</option>
                    <option value="sofa">Leather Sofa Set</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="memo-payment">Payment Method</Label>
                  <select
                    id="memo-payment"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="bank">Bank Transfer</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="memo-discount">Discount (BDT)</Label>
                  <Input id="memo-discount" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="memo-notes">Notes</Label>
                  <Input id="memo-notes" placeholder="Additional notes" />
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline">Clear</Button>
              <Button>Generate Memo</Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sales Performance</CardTitle>
                <CardDescription>
                  Monthly sales trend and analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`৳${value.toLocaleString()}`, 'Amount']} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="sales"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        name="Sales (BDT)"
                      />
                      <Line
                        type="monotone"
                        dataKey="orders"
                        stroke="#10B981"
                        strokeWidth={2}
                        name="Orders"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Top Selling Products</CardTitle>
                  <CardDescription>
                    Best performing products by sales
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { product: 'Wooden Dining Chair', sales: '৳425,000', quantity: 170 },
                      { product: 'Steel Office Table', sales: '৳285,600', quantity: 42 },
                      { product: 'Leather Sofa Set', sales: '৳480,000', quantity: 15 },
                      { product: 'Wooden Bed Frame', sales: '৳238,000', quantity: 28 },
                      { product: 'Metal Wardrobe', sales: '৳345,000', quantity: 30 },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{item.product}</div>
                          <div className="text-sm text-muted-foreground">
                            {item.quantity} units sold
                          </div>
                        </div>
                        <div className="font-medium">{item.sales}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>
                    Distribution by payment type
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { method: 'Cash', amount: 650000 },
                        { method: 'Card', amount: 350000 },
                        { method: 'Bank', amount: 150000 },
                        { method: 'Mobile', amount: 100000 },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="method" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`৳${value.toLocaleString()}`, 'Amount']} />
                        <Bar
                          dataKey="amount"
                          fill="#10B981"
                          name="Amount (BDT)"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Sales