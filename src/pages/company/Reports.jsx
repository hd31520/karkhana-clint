import { useState } from 'react'
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
  BarChart,
  PieChart,
  Download,
  Filter,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Package,
  ShoppingCart,
  FileText,
  Printer,
  Mail
} from 'lucide-react'
import {
  LineChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Pie,
  Cell,
} from 'recharts'

const Reports = () => {
  const [activeTab, setActiveTab] = useState('sales')
  const { currentCompany } = useAuth()
  const queryClient = useQueryClient()

  const [reportType, setReportType] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [format, setFormat] = useState('pdf')
  // Dynamic analytics queries
  const { data: salesStatsRes } = useQuery({
    queryKey: ['sales-stats', currentCompany?.id],
    queryFn: () => api.get('/sales/stats', { params: { companyId: currentCompany?.id } }),
    enabled: !!currentCompany,
  })

  const salesStats = salesStatsRes?.stats || { totalSales: 0, totalOrders: 0, activeCustomers: 0, avgOrder: 0, monthly: [] }

  const salesData = (salesStats.monthly || []).map(m => ({ month: `${m._id.month}/${m._id.year}`, sales: m.total || 0, target: 0 }))
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  // Expenses by category
  const { data: expensesRes } = useQuery({
    queryKey: ['expenses', currentCompany?.id],
    queryFn: () => api.get('/payments/transactions', { params: { companyId: currentCompany?.id, type: 'expense', limit: 100 } }),
    enabled: !!currentCompany,
  })

  const expenseTransactions = expensesRes?.transactions || []
  const expenseMap = {}
  for (const t of expenseTransactions) {
    const cat = t.category || 'Other'
    expenseMap[cat] = (expenseMap[cat] || 0) + (Number(t.amount || 0))
  }
  const expenseData = Object.keys(expenseMap).map((k, i) => ({ name: k, value: expenseMap[k], color: COLORS[i % COLORS.length] }))

  const totalExpenses = Object.values(expenseMap).reduce((s, v) => s + v, 0)
  const totalRevenue = salesStats.totalSales || 0
  const profit = totalRevenue - totalExpenses
  const activeCustomers = salesStats.activeCustomers || 0

  // Inventory analytics: stock value and alerts
  const { data: stockValueRes } = useQuery({
    queryKey: ['products-stock-value', currentCompany?.id],
    queryFn: () => api.get('/products/stock-value', { params: { companyId: currentCompany?.id } }),
    enabled: !!currentCompany,
  })
  const totalStockValue = stockValueRes?.totalValue || 0

  const { data: alertsRes } = useQuery({
    queryKey: ['inventory-alerts', currentCompany?.id],
    queryFn: () => api.get('/inventory/alerts', { params: { companyId: currentCompany?.id } }),
    enabled: !!currentCompany,
  })
  const lowStockProducts = alertsRes?.alerts?.products?.lowStock || []
  const outOfStockProducts = alertsRes?.alerts?.products?.outOfStock || []

  // Customers for segmentation/top customers
  const { data: customersRes } = useQuery({
    queryKey: ['customers', currentCompany?.id, 'top'],
    queryFn: () => api.get('/customers', { params: { companyId: currentCompany?.id, limit: 100 } }),
    enabled: !!currentCompany,
  })
  const customers = customersRes?.customers || []
  const customerSegmentsMap = {}
  for (const c of customers) {
    const seg = (c.customerType || 'retail')
    customerSegmentsMap[seg] = (customerSegmentsMap[seg] || { count: 0, revenue: 0 })
    customerSegmentsMap[seg].count += 1
    customerSegmentsMap[seg].revenue += Number(c.totalPurchases || 0)
  }
  const customerSegments = Object.keys(customerSegmentsMap).map((k) => ({ segment: k, count: customerSegmentsMap[k].count, revenue: customerSegmentsMap[k].revenue }))
  const topCustomers = (customers || []).slice().sort((a,b) => (Number(b.totalPurchases || 0) - Number(a.totalPurchases || 0))).slice(0,5)

  // Fetch generated reports from the API (server returns { success, count, total, reports })
  const { data: reportsData, isLoading: reportsLoading, isError: reportsError } = useQuery({
    queryKey: ['reports', currentCompany?.id],
    queryFn: async () => {
      const res = await api.get('/reports', { params: { companyId: currentCompany?.id } })
      // api wrapper in this project sometimes returns response or response.data — normalize both
      return res.data ? res.data : res
    },
    enabled: !!currentCompany,
  })

  const recentReports = reportsData?.reports || []

  // Fetch product performance data
  const { data: productsRes } = useQuery({
    queryKey: ['products', currentCompany?.id],
    queryFn: () => api.get('/products', { params: { companyId: currentCompany?.id, limit: 50 } }),
    enabled: !!currentCompany,
  })

  // Calculate product performance from products data
  const productPerformance = (productsRes?.products || []).slice(0, 5).map(product => ({
    product: product.name || 'Unnamed Product',
    sales: Number(product.totalSales || product.salesValue || 0),
    units: Number(product.totalSold || product.quantitySold || 0),
    growth: product.growth || '+0%'
  }))

  const generateReportMutation = useMutation({
    mutationFn: async (body) => {
      const res = await api.post('/reports/generate', body)
      return res.data ? res.data : res
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['reports', currentCompany?.id])
    }
  })

  const handleQuickGenerate = () => {
    if (!currentCompany) return
    const now = new Date()
    const body = {
      companyId: currentCompany.id,
      type: 'monthly_sales',
      period: { month: now.getMonth() + 1, year: now.getFullYear() },
      format: 'pdf'
    }
    generateReportMutation.mutate(body)
  }

  const handleGenerateFromForm = () => {
    if (!currentCompany) return
    const period = startDate || endDate ? { startDate: startDate || null, endDate: endDate || null } : {}
    const body = {
      companyId: currentCompany.id,
      type: reportType || 'monthly_sales',
      period,
      format
    }
    generateReportMutation.mutate(body)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Generate insights and download business reports
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Last 30 Days
          </Button>
          <Button onClick={handleQuickGenerate} disabled={generateReportMutation.isLoading}>
            <FileText className="mr-2 h-4 w-4" />
            {generateReportMutation.isLoading ? 'Generating...' : 'Generate Report'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(totalRevenue || 0)}</div>
            <p className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
              {salesData.length ? `${salesData.length} months` : ''}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(totalExpenses || 0)}</div>
            <p className="flex items-center text-xs text-muted-foreground">
              <TrendingDown className="mr-1 h-3 w-3 text-red-600" />
              {expenseData.length ? `${expenseData.length} categories` : ''}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(profit || 0)}</div>
            <p className="text-xs text-muted-foreground">
              {totalRevenue > 0 ? `${((profit / totalRevenue) * 100).toFixed(1)}% profit margin` : ''}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCustomers}</div>
            <p className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
              {activeCustomers ? `${activeCustomers} active` : ''}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="reports">All Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sales" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sales Performance</CardTitle>
                <CardDescription>
                  Monthly sales vs target comparison
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`৳${value.toLocaleString()}`, 'Amount']} />
                      <Legend />
                      <Bar dataKey="sales" fill="#10B981" name="Actual Sales" />
                      <Bar dataKey="target" fill="#3B82F6" name="Target Sales" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Product Performance</CardTitle>
                <CardDescription>
                  Top selling products by revenue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Sales Revenue</TableHead>
                      <TableHead>Units Sold</TableHead>
                      <TableHead>Growth</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productPerformance.map((product, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{product.product}</TableCell>
                        <TableCell>৳{product.sales.toLocaleString()}</TableCell>
                        <TableCell>{product.units}</TableCell>
                        <TableCell>
                          <Badge variant={product.growth.startsWith('+') ? 'default' : 'destructive'}>
                            {product.growth}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Expense Distribution</CardTitle>
                <CardDescription>
                  Breakdown of business expenses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {expenseData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`৳${value.toLocaleString()}`, 'Amount']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Profit & Loss Statement</CardTitle>
                <CardDescription>
                  Quarterly financial summary
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Revenue</span>
                      <span className="font-medium text-green-600">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(totalRevenue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cost of Goods Sold</span>
                      <span className="font-medium text-red-600">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(totalExpenses)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Gross Profit</span>
                      <span className="font-medium">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(profit)}</span>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span>Operating Expenses</span>
                      <span className="font-medium text-red-600">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(totalExpenses * 0.3)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Salary Expenses</span>
                      <span className="font-medium text-red-600">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(totalExpenses * 0.4)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Other Expenses</span>
                      <span className="font-medium text-red-600">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(totalExpenses * 0.3)}</span>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between font-bold">
                      <span>Net Profit</span>
                      <span className="text-xl text-green-600">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(profit)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Profit Margin</span>
                      <span>{totalRevenue > 0 ? `${((profit / totalRevenue) * 100).toFixed(1)}%` : '0%'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="inventory">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Inventory Analysis</CardTitle>
                <CardDescription>
                  Stock levels and turnover rates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[
                        { month: 'Jan', stock: 120, sales: 85 },
                        { month: 'Feb', stock: 110, sales: 78 },
                        { month: 'Mar', stock: 95, sales: 92 },
                        { month: 'Apr', stock: 130, sales: 65 },
                        { month: 'May', stock: 145, sales: 88 },
                        { month: 'Jun', stock: 125, sales: 95 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="stock" stroke="#3B82F6" name="Stock Level" />
                      <Line type="monotone" dataKey="sales" stroke="#10B981" name="Units Sold" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Stock Turnover</CardTitle>
                  <CardDescription>
                    Inventory turnover by category
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { category: 'Furniture', turnover: '2.8x', days: 32 },
                      { category: 'Electronics', turnover: '4.2x', days: 22 },
                      { category: 'Textile', turnover: '3.5x', days: 26 },
                      { category: 'Accessories', turnover: '5.1x', days: 18 },
                    ].map((item) => (
                      <div key={item.category} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{item.category}</div>
                          <div className="text-sm text-muted-foreground">
                            Avg. {item.days} days
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{item.turnover}</div>
                          <div className="text-sm text-muted-foreground">Turnover rate</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Low Stock Alerts</CardTitle>
                  <CardDescription>
                    Products needing restocking
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {lowStockProducts.length === 0 ? (
                      <div className="text-sm text-muted-foreground">No low stock products</div>
                    ) : (
                      lowStockProducts.map((p) => (
                        <div key={p._id || p.id} className="rounded-lg border p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{p.name}</div>
                              <div className="text-sm text-muted-foreground">
                                Stock: {p.inventory?.quantity ?? 0} | Min: {p.inventory?.minStock ?? 0}
                              </div>
                            </div>
                            <Badge variant="destructive">Low Stock</Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="customers">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Analysis</CardTitle>
                <CardDescription>
                  Customer segmentation and behavior
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={customerSegments.map(s => ({ segment: (s.segment || '').toString().charAt(0).toUpperCase() + (s.segment || '').toString().slice(1), count: s.count, revenue: s.revenue }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="segment" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="count" fill="#3B82F6" name="Customer Count" />
                      <Bar yAxisId="right" dataKey="revenue" fill="#10B981" name="Revenue (BDT)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Loyalty</CardTitle>
                  <CardDescription>
                    Repeat customer analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { level: 'New Customers', count: 8, percentage: 9.4 },
                      { level: 'Regular (1-5 orders)', count: 45, percentage: 52.9 },
                      { level: 'Loyal (6-10 orders)', count: 25, percentage: 29.4 },
                      { level: 'VIP (10+ orders)', count: 7, percentage: 8.2 },
                    ].map((item) => (
                      <div key={item.level} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{item.level}</span>
                          <span className="text-sm text-muted-foreground">{item.count} customers</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Customers</CardTitle>
                  <CardDescription>
                    Highest spending customers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topCustomers.map((customer, index) => (
                      <div key={customer._id || customer.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                            <span className="text-sm font-bold">{index + 1}</span>
                          </div>
                          <div>
                            <div className="font-medium">{customer.name || customer.companyName || customer.customer || 'Customer'}</div>
                            <div className="text-sm text-muted-foreground">
                              {customer.orders || 0} orders
                            </div>
                          </div>
                        </div>
                        <div className="font-bold">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(customer.totalPurchases || 0)}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>All Generated Reports</CardTitle>
              <CardDescription>
                Access and download previously generated reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date Generated</TableHead>
                    <TableHead>File Size</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                  <TableBody>
                    {reportsLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">Loading reports...</TableCell>
                      </TableRow>
                    ) : (recentReports.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">No reports found</TableCell>
                      </TableRow>
                    ) : (
                      recentReports.map((report) => (
                        <TableRow key={report._id || report.id}>
                          <TableCell className="font-medium">{report.title || report.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{report.type}</Badge>
                          </TableCell>
                          <TableCell className="text-sm">{report.createdAt ? new Date(report.createdAt).toLocaleString() : report.date}</TableCell>
                          <TableCell className="text-sm">{report.fileSize || report.size || '-'}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => report.fileUrl && window.open(report.fileUrl, '_blank')}
                                disabled={!report.fileUrl}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" disabled>
                                <Printer className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" disabled>
                                <Mail className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ))}
                  </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Generate Custom Report</CardTitle>
                <CardDescription>
                  Create a report with specific parameters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="report-type">Report Type</Label>
                    <select
                      id="report-type"
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="">Select report type</option>
                      <option value="daily_sales">Daily Sales Report</option>
                      <option value="monthly_sales">Monthly Sales Report</option>
                      <option value="inventory">Inventory Report</option>
                      <option value="financial">Financial Report</option>
                      <option value="customer">Customer Report</option>
                      <option value="salary">Salary Report</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start-date">Start Date</Label>
                      <Input id="start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end-date">End Date</Label>
                      <Input id="end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="format">Format</Label>
                    <select
                      id="format"
                      value={format}
                      onChange={(e) => setFormat(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="pdf">PDF</option>
                      <option value="excel">Excel</option>
                      <option value="csv">CSV</option>
                    </select>
                  </div>

                  <Button className="w-full" type="button" onClick={handleGenerateFromForm} disabled={generateReportMutation.isLoading || !currentCompany}>
                    {generateReportMutation.isLoading ? 'Generating...' : 'Generate Report'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Report Templates</CardTitle>
                <CardDescription>
                  Predefined report templates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'Monthly Sales Summary', desc: 'Sales performance overview' },
                    { name: 'Inventory Status Report', desc: 'Stock levels and alerts' },
                    { name: 'Customer Purchase History', desc: 'Detailed customer analysis' },
                    { name: 'Salary Payment Report', desc: 'Salary breakdown and payments' },
                    { name: 'Profit & Loss Statement', desc: 'Financial performance' },
                  ].map((template) => (
                    <div key={template.name} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <div className="font-medium">{template.name}</div>
                        <div className="text-sm text-muted-foreground">{template.desc}</div>
                      </div>
                      <Button size="sm" variant="outline">
                        Use Template
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Reports