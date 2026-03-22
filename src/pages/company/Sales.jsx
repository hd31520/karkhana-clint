import { useEffect, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../../utils/api'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
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
import { exportToCSV, exportToExcel, exportToPDF } from '../../utils/printExport'

const Sales = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('orders')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const { currentCompany, user } = useAuth()
  const { showSuccess, showError, showInfo } = useToast()
  const queryClient = useQueryClient()

  const { data: productsRes } = useQuery({
    queryKey: ['products-list', currentCompany?.id],
    queryFn: () => api.get('/products', { params: { companyId: currentCompany?.id, limit: 200 } }),
    enabled: !!currentCompany,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  })

  const products = productsRes?.products || []

  const { data: statsRes } = useQuery({
    queryKey: ['sales-stats', currentCompany?.id],
    queryFn: () => api.get('/sales/stats', { params: { companyId: currentCompany?.id } }),
    enabled: !!currentCompany,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  })

  const stats = statsRes?.stats || { totalSales: 0, totalOrders: 0, activeCustomers: 0, avgOrder: 0, monthly: [] }

  const { data: ordersRes } = useQuery({
    queryKey: ['orders', currentCompany?.id, page, limit, searchTerm],
    queryFn: () => api.get('/sales/orders', { params: { companyId: currentCompany?.id, page, limit, search: searchTerm } }),
    enabled: !!currentCompany,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  })

  const orders = ordersRes?.orders || []
  const ordersTotal = ordersRes?.total ?? orders.length

  const { data: memosRes } = useQuery({
    queryKey: ['memos', currentCompany?.id, page, limit],
    queryFn: () => api.get('/sales/memos', { params: { companyId: currentCompany?.id, page, limit } }),
    enabled: !!currentCompany,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  })

  const memos = memosRes?.memos || []

  const { data: transactionsRes } = useQuery({
    queryKey: ['transactions', currentCompany?.id, page, limit],
    queryFn: () => api.get('/payments/transactions', { params: { companyId: currentCompany?.id, page: 1, limit: 10 } }),
    enabled: !!currentCompany,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  })

  const transactions = transactionsRes?.transactions || []

  // Dialog / action state
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [viewOpen, setViewOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [emailOpen, setEmailOpen] = useState(false)

  useEffect(() => {
    setSearchTerm('')
    setActiveTab('orders')
    setPage(1)
    setSelectedOrder(null)
    setViewOpen(false)
    setEditOpen(false)
    setEmailOpen(false)
  }, [currentCompany?.id])

  const fetchOrder = async (id) => {
    try {
      const res = await api.get(`/sales/orders/${id}`)
      return res.order
    } catch (err) {
      console.error('Failed to fetch order', err)
      return null
    }
  }

  const handlePrint = (order) => {
    // open printable invoice with company, seller and customer info
    const company = currentCompany || {}
    const sellerName = user?.name || user?.username || ''
    const customer = order.customer || {}
    const format = (v) => (typeof v === 'number' ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'BDT' }).format(v) : v)

    const html = `
      <html>
        <head>
          <title>Invoice ${order.orderNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; color: #111827; padding: 20px }
            .header { display:flex; justify-content:space-between; align-items:flex-start }
            .company { max-width:60% }
            .meta { text-align:right }
            h1 { margin:0 0 8px 0 }
            table { width:100%; border-collapse:collapse; margin-top:16px }
            th, td { border:1px solid #e5e7eb; padding:8px; text-align:left }
            th { background:#f3f4f6 }
            .totals { margin-top:12px; width:100%; display:flex; justify-content:flex-end }
            .totals .box { width:320px }
            .small { font-size:0.9rem; color:#6b7280 }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company">
              <h1>${company.name || ''}</h1>
              <div class="small">${company.address || ''}</div>
              <div class="small">${company.email || ''}${company.phone ? ' | ' + company.phone : ''}</div>
            </div>
            <div class="meta">
              <div><strong>Invoice:</strong> ${order.orderNumber || ''}</div>
              <div><strong>Date:</strong> ${new Date(order.createdAt || Date.now()).toLocaleString()}</div>
              <div><strong>Sold By:</strong> ${sellerName}</div>
            </div>
          </div>

          <hr style="margin:16px 0" />

          <div style="display:flex;justify-content:space-between">
            <div>
              <h3>Bill To</h3>
              <div><strong>${customer.name || ''}</strong></div>
              <div class="small">${customer.phone || ''}</div>
              <div class="small">${customer.address || ''}</div>
            </div>
            <div>
              <h3>Ship / Contact</h3>
              <div class="small">${order.delivery?.address || order.shippingAddress || ''}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Product</th>
                <th>Unit Price</th>
                <th>Qty</th>
                <th>Discount</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${(order.items || []).map((it, idx) => `
                <tr>
                  <td>${idx + 1}</td>
                  <td>${it.name || ''}</td>
                  <td>${format(it.unitPrice || it.price || 0)}</td>
                  <td>${it.quantity || 0}</td>
                  <td>${format(it.discount || 0)}</td>
                  <td>${format(it.total || ((it.unitPrice || 0) * (it.quantity || 0) - (it.discount || 0)))}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals">
            <div class="box">
              <div style="display:flex;justify-content:space-between"><span class="small">Subtotal</span><strong>${format(order.subtotal || 0)}</strong></div>
              <div style="display:flex;justify-content:space-between"><span class="small">Discount</span><strong>${format(order.discount?.amount || 0)}</strong></div>
              <div style="display:flex;justify-content:space-between"><span class="small">Tax</span><strong>${format(order.tax?.amount || 0)}</strong></div>
              <div style="display:flex;justify-content:space-between;margin-top:8px;font-size:1.1rem"><span>Total</span><strong>${format(order.total || 0)}</strong></div>
            </div>
          </div>
        </body>
      </html>`
    const w = window.open('', '_blank')
    if (w) {
      w.document.write(html)
      w.document.close()
      w.focus()
      w.print()
    } else {
      showError('Unable to open print window (popup blocked)')
    }
  }

  const handleSendEmail = async (id, email) => {
    try {
      const res = await api.post(`/sales/orders/${id}/email`, { email })
      if (res?.info?.logged) {
        showInfo('SMTP not configured — email was logged on server')
      } else {
        showSuccess('Email sent')
      }
      setEmailOpen(false)
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to send email'
      showError(msg)
    }
  }

  const handleUpdateOrder = async (id, updates) => {
    try {
      const res = await api.put(`/sales/orders/${id}`, updates)
      showSuccess('Order updated')
      setEditOpen(false)
      // refresh
      try { queryClient.invalidateQueries({ queryKey: ['orders'] }); queryClient.invalidateQueries({ queryKey: ['sales-stats'] }) } catch (e) {}
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update order'
      showError(msg)
    }
  }

  const salesData = useMemo(() => {
    // Map monthly aggregation into chart-friendly array
    return (stats.monthly || []).map(m => ({
      month: `${m._id.month}/${m._id.year}`,
      sales: m.total || 0,
      orders: m.orders || 0
    }))
  }, [stats.monthly])

  // Compute top products from orders
  const topProducts = useMemo(() => {
    const map = {}
    for (const o of orders) {
      for (const it of o.items || []) {
        const key = it.product || it.name
        if (!map[key]) map[key] = { name: it.name || key, quantity: 0, sales: 0 }
        map[key].quantity += it.quantity || 0
        map[key].sales += (it.total != null) ? it.total : ((it.unitPrice || 0) * (it.quantity || 0) - (it.discount || 0))
      }
    }
    return Object.values(map).sort((a, b) => b.sales - a.sales).slice(0, 5)
  }, [orders])

  const handleExportSales = (type = 'excel') => {
    if (!orders.length) {
      showError('No sales data available to export')
      return
    }

    const rows = orders.map((order) => ({
      'Order Number': order.orderNumber,
      Customer: order.customer?.name || order.customerName || '-',
      Date: order.createdAt ? new Date(order.createdAt).toLocaleString() : '-',
      Items: Array.isArray(order.items) ? order.items.length : 0,
      Total: Number(order.total || 0),
      'Payment Status': order.payment?.status || '-',
      'Payment Method': order.payment?.method || '-',
      Status: order.status || '-',
      Type: order.orderType || '-'
    }))

    const filename = `${(currentCompany?.name || 'company').replace(/\s+/g, '-').toLowerCase()}-sales`
    const ok = type === 'pdf'
      ? exportToPDF(rows, filename, 'Sales Report', { orientation: 'landscape' })
      : type === 'csv'
        ? exportToCSV(rows, filename)
        : exportToExcel(rows, filename, 'Sales')

    if (ok) showSuccess(`Sales exported as ${type.toUpperCase()}`)
    else showError('Failed to export sales')
  }

  const handlePrintMemo = (memo) => {
    const html = `
      <html>
        <head>
          <title>Memo ${memo.memoNumber || ''}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
            th { background: #f3f4f6; }
          </style>
        </head>
        <body>
          <h1>${currentCompany?.name || 'Company'} Memo</h1>
          <p><strong>Memo:</strong> ${memo.memoNumber || '-'}</p>
          <p><strong>Customer:</strong> ${memo.customerName || memo.customer?.name || '-'}</p>
          <p><strong>Total:</strong> ${memo.total || 0}</p>
          <p><strong>Paid:</strong> ${memo.paidAmount || 0}</p>
          <p><strong>Due:</strong> ${memo.dueAmount || 0}</p>
          <table>
            <thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
            <tbody>
              ${(memo.items || []).map((item) => `<tr><td>${item.name || '-'}</td><td>${item.quantity || 0}</td><td>${item.unitPrice || 0}</td><td>${item.total || 0}</td></tr>`).join('')}
            </tbody>
          </table>
        </body>
      </html>`
    const win = window.open('', '_blank')
    if (!win) {
      showError('Unable to open print window')
      return
    }
    win.document.write(html)
    win.document.close()
    win.focus()
    win.print()
  }

  // Compute payment distribution
  const paymentDistribution = useMemo(() => {
    const map = {}
    for (const o of orders) {
      const method = (o.payment && (o.payment.method || o.payment.paymentMethod)) || 'unknown'
      map[method] = (map[method] || 0) + (o.total || 0)
    }
    return Object.keys(map).map(k => ({ method: k, amount: map[k] }))
  }, [orders])

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Sales Management</h1>
          <p className="text-muted-foreground">Manage orders, process sales, and track payments</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Export Sales</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleExportSales('excel')}>Export as Excel</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportSales('csv')}>Export as CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportSales('pdf')}>Export as PDF</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                New Sale
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[calc(100vw-1rem)] sm:max-w-4xl">
              <DialogHeader>
                <DialogTitle>Create New Sale</DialogTitle>
                <DialogDescription>
                  Process a new sale order
                </DialogDescription>
              </DialogHeader>
              <SaleForm
                products={products}
                companyId={currentCompany?.id}
                onSuccess={(order) => { showSuccess('Sale created successfully') }}
                onError={(msg) => { showError(msg || 'Failed to create sale') }}
              />
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
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders ?? ordersTotal}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCustomers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(stats.avgOrder || 0)}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-1 gap-2 sm:grid-cols-3">
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="memos">Memos</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="orders" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <CardTitle>All Orders</CardTitle>
                  <CardDescription>
                    Manage and track all customer orders
                  </CardDescription>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search orders..."
                      className="w-full pl-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" size="icon" className="self-end sm:self-auto">
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
                    <TableRow key={order._id || order.orderNumber}>
                      <TableCell className="font-medium">{order.orderNumber}</TableCell>
                      <TableCell>{order.customer?.name || order.customer || '—'}</TableCell>
                      <TableCell className="text-sm">{order.createdAt ? new Date(order.createdAt).toLocaleString() : (order.date || '—')}</TableCell>
                      <TableCell>
                        {Array.isArray(order.items) ? (
                          <div className="space-y-1">
                            <div className="text-sm text-muted-foreground">{order.items.length} item(s)</div>
                            {order.items.slice(0,3).map((it, idx) => (
                              <div key={it.product || it._id || idx} className="text-sm">{it.name} × {it.quantity}</div>
                            ))}
                          </div>
                        ) : '—'}
                      </TableCell>
                      <TableCell className="font-medium">{(order.total || order.amount || 0).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={getPaymentColor(order.payment?.status || order.payment)}>
                          {order.payment?.status || order.payment?.method || order.payment || 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {order.orderType || order.type || '—'}
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
                            <DropdownMenuItem onClick={() => { setSelectedOrder(order); setViewOpen(true) }}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setSelectedOrder(order); setEditOpen(true) }}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Order
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handlePrint(order)}>
                              <Printer className="mr-2 h-4 w-4" />
                              Print Invoice
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setSelectedOrder(order); setEmailOpen(true) }}>
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
                  <Button variant="outline" className="h-auto flex-col items-center justify-center p-4" onClick={() => memos[0] && handlePrintMemo(memos[0])}>
                    <Printer className="mb-2 h-5 w-5" />
                    <span className="text-sm">Print Memo</span>
                  </Button>
                  <Button variant="outline" className="h-auto flex-col items-center justify-center p-4" onClick={() => handleExportSales('excel')}>
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
                <Button onClick={() => memos[0] ? handlePrintMemo(memos[0]) : showError('No memos available to print')}>
                  <Printer className="mr-2 h-4 w-4" />
                  Print Latest Memo
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
                          <Button size="sm" variant="outline" onClick={() => handlePrintMemo(memo)}>
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
                    {topProducts.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {item.quantity} units sold
                          </div>
                        </div>
                        <div className="font-medium">৳{Number(item.sales || 0).toLocaleString()}</div>
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
                      <BarChart data={paymentDistribution}>
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

      {/* Order dialogs */}
      <OrderViewDialog open={viewOpen} onOpenChange={setViewOpen} order={selectedOrder} />
      <OrderEditDialog open={editOpen} onOpenChange={setEditOpen} order={selectedOrder} onSave={handleUpdateOrder} />
      <OrderEmailDialog open={emailOpen} onOpenChange={setEmailOpen} order={selectedOrder} onSend={handleSendEmail} />

    </div>
  )
}

export default Sales

const SaleForm = ({ products, companyId, onSuccess, onError }) => {
  const queryClient = useQueryClient()
  const [customer, setCustomer] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [items, setItems] = useState([])
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [notes, setNotes] = useState('')
  const { showSuccess, showError } = useToast()

  const addEmptyLine = () => {
    setItems(prev => [...prev, { product: '', name: '', quantity: 1, unitPrice: 0, discount: 0, total: 0 }])
  }

  const removeLine = (index) => {
    setItems(prev => prev.filter((_, i) => i !== index))
  }

  const updateLine = (index, patch) => {
    setItems(prev => prev.map((r, i) => i === index ? { ...r, ...patch } : r))
  }

  const onSelectProduct = (index, productId) => {
    const p = products.find(x => x._id === productId)
    if (!p) return
    const unitPrice = (p.price && (p.price.sellingPrice || p.price.selling || p.price.retail)) || p.price || 0
    updateLine(index, { product: p._id, name: p.name, unitPrice, quantity: 1, discount: 0, total: unitPrice * 1 })
  }

  const computeTotals = () => {
    const subtotal = items.reduce((s, it) => s + ((it.unitPrice || 0) * (it.quantity || 0)) - (it.discount || 0), 0)
    const discount = 0
    const tax = 0
    const shipping = 0
    const total = subtotal - discount + tax + shipping
    return { subtotal, discount, tax, shipping, total }
  }

  const handleProcess = async () => {
    if (!companyId) return onError && onError('Company not selected')
    if (items.length === 0) return onError && onError('Add at least one product')
    // If customer name provided and phone is empty, require phone to auto-create
    if (customer && (!customerPhone || customerPhone.trim() === '')) {
      return onError && onError('Customer phone number is required when adding a new customer')
    }
    try {
      const payload = {
        companyId,
        customer: customer || null,
        customerPhone: customerPhone || null,
        items: items.map(i => ({ product: i.product, quantity: i.quantity, unitPrice: i.unitPrice, discount: i.discount })),
        payment: { method: paymentMethod },
        notes
      }
      const res = await api.post('/sales/orders', payload)
      if (res?.order) {
        onSuccess && onSuccess(res.order)
        showSuccess('Sale created')
        // refresh orders and stats
        try {
          queryClient.invalidateQueries({ queryKey: ['orders'] })
          queryClient.invalidateQueries({ queryKey: ['sales-stats'] })
        } catch (e) {
          // ignore
        }
      } else {
        onError && onError(res?.message || 'Failed')
      }
    } catch (err) {
      console.error(err)
      const msg = err?.response?.data?.message || err?.message || 'Server error'
      onError && onError(msg)
      showError(msg)
    }
  }

  const totals = computeTotals()

  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="customer">Customer</Label>
          <Input id="customer" value={customer} onChange={e => setCustomer(e.target.value)} placeholder="Search or add customer (enter name to auto-create)" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="customer-phone">Customer Phone</Label>
          <Input id="customer-phone" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="Required if creating new customer" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>
      </div>

      <div className="space-y-4">
        <Label>Products</Label>
        <div className="rounded-lg border">
          <div className="grid grid-cols-12 gap-4 p-4 border-b">
            <div className="col-span-6 font-medium">Product</div>
            <div className="col-span-2 font-medium">Quantity</div>
            <div className="col-span-2 font-medium">Price</div>
            <div className="col-span-1 font-medium">Discount</div>
            <div className="col-span-1 font-medium">Actions</div>
          </div>
          <div className="p-4 space-y-2">
            {items.length === 0 && (
              <div className="text-center text-muted-foreground">Add products to this sale</div>
            )}
            {items.map((it, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-6">
                  <select className="w-full rounded-md border" value={it.product} onChange={e => onSelectProduct(idx, e.target.value)}>
                    <option value="">Select product</option>
                    {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <Input type="number" value={it.quantity} onChange={e => updateLine(idx, { quantity: Number(e.target.value), total: (it.unitPrice || 0) * Number(e.target.value) - (it.discount || 0) })} />
                </div>
                <div className="col-span-2">
                  <Input type="number" value={it.unitPrice} onChange={e => updateLine(idx, { unitPrice: Number(e.target.value), total: Number(e.target.value) * (it.quantity || 1) - (it.discount || 0) })} />
                </div>
                <div className="col-span-1">
                  <Input type="number" value={it.discount} onChange={e => updateLine(idx, { discount: Number(e.target.value), total: (it.unitPrice || 0) * (it.quantity || 1) - Number(e.target.value) })} />
                </div>
                <div className="col-span-1">
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => removeLine(idx)}>Remove</Button>
                  </div>
                </div>
              </div>
            ))}
            <div>
              <Button onClick={addEmptyLine}>Add product</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="payment-method">Payment Method</Label>
            <select id="payment-method" className="flex h-10 w-full rounded-md border" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="mobile_banking">Mobile Banking</option>
              <option value="due">Due</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input id="notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Additional notes" />
          </div>
        </div>

        <div className="space-y-4 rounded-lg border p-4">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-medium">৳{totals.subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Discount</span>
            <span className="font-medium">৳{totals.discount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax</span>
            <span className="font-medium">৳{totals.tax.toLocaleString()}</span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="font-semibold">Total</span>
            <span className="text-xl font-bold">৳{totals.total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline">Cancel</Button>
        <Button onClick={handleProcess}>Process Sale</Button>
      </div>
    </div>
  )
}

// Dialog components for viewing/editing/emailing an order
const OrderViewDialog = ({ open, onOpenChange, order }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Order {order?.orderNumber}</DialogTitle>
        </DialogHeader>
        <div>
          <p>Customer: {order?.customer?.name || order?.customer}</p>
          <p>Total: {order?.total}</p>
          <div>
            {(order?.items || []).map((it, idx) => (
              <div key={it._id || idx}>{it.name} × {it.quantity} — {it.total}</div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

const OrderEditDialog = ({ open, onOpenChange, order, onSave }) => {
  const [status, setStatus] = useState(order?.status || '')
  const [notes, setNotes] = useState(order?.notes || '')
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Order {order?.orderNumber}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div>
            <Label>Status</Label>
            <select className="w-full rounded-md border" value={status} onChange={e => setStatus(e.target.value)}>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <Label>Notes</Label>
            <Input value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={() => onSave(order._id, { status, notes })}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

const OrderEmailDialog = ({ open, onOpenChange, order, onSend }) => {
  const [email, setEmail] = useState(order?.customer?.email || '')
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Invoice {order?.orderNumber}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div>
            <Label>Recipient Email</Label>
            <Input value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={() => onSend(order._id, email)}>Send</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
