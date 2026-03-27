import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Users,
  UserPlus,
  Search,
  Download,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Phone,
  Mail,
  DollarSign,
  TrendingUp,
  Wallet,
  ReceiptText
} from 'lucide-react'
import api from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Badge } from '../../components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog'
import { exportToCSV, exportToExcel, exportToPDF } from '../../utils/printExport'

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'BDT',
  maximumFractionDigits: 0
})

const formatCurrency = (value) => currencyFormatter.format(Number(value || 0))

const emptyCustomerForm = {
  name: '',
  email: '',
  phone: '',
  customerType: 'retail',
  address: '',
  creditLimit: ''
}

const emptyCollectionForm = {
  amount: '',
  paymentMethod: 'cash',
  note: '',
  transactionId: ''
}

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [customerForm, setCustomerForm] = useState(emptyCustomerForm)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [collectOpen, setCollectOpen] = useState(false)
  const [collectionForm, setCollectionForm] = useState(emptyCollectionForm)
  const { currentCompany } = useAuth()
  const { showSuccess, showError } = useToast()
  const queryClient = useQueryClient()

  const customerQueryKey = ['customers', currentCompany?.id, page, limit, searchTerm]

  const getCustomerParams = () => ({
    ...(currentCompany?.id ? { companyId: currentCompany.id } : {}),
    page,
    limit,
    ...(searchTerm ? { search: searchTerm } : {}),
  })

  const { data, isLoading, error } = useQuery({
    queryKey: customerQueryKey,
    queryFn: () => api.get('/customers', {
      params: getCustomerParams(),
    }),
    enabled: !!currentCompany?.id,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  })

  const { data: totalCustomersData } = useQuery({
    queryKey: ['customers-total', currentCompany?.id],
    queryFn: () => api.get('/customers', {
      params: { companyId: currentCompany?.id, page: 1, limit: 1 }
    }),
    enabled: !!currentCompany?.id,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  })

  const { data: dueSummaryData } = useQuery({
    queryKey: ['customer-due-summary', currentCompany?.id],
    queryFn: () => api.get('/customers/due-summary', {
      params: currentCompany?.id ? { companyId: currentCompany.id } : {}
    }),
    enabled: !!currentCompany?.id,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  })

  const { data: dueHistoryData, isLoading: dueHistoryLoading } = useQuery({
    queryKey: ['customer-due-history', selectedCustomer?._id],
    queryFn: () => api.get(`/customers/${selectedCustomer?._id}/due-history`),
    enabled: historyOpen && !!selectedCustomer?._id,
  })

  const createCustomerMutation = useMutation({
    mutationFn: (payload) => api.post('/customers', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers', currentCompany?.id] })
      queryClient.invalidateQueries({ queryKey: ['customer-due-summary', currentCompany?.id] })
      setCustomerForm(emptyCustomerForm)
      showSuccess('Customer added successfully')
    },
    onError: (error) => {
      showError(error?.message || 'Failed to add customer')
    }
  })

  const collectDueMutation = useMutation({
    mutationFn: ({ customerId, payload }) => api.post(`/customers/${customerId}/collect-due`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers', currentCompany?.id] })
      queryClient.invalidateQueries({ queryKey: ['customer-due-summary', currentCompany?.id] })
      queryClient.invalidateQueries({ queryKey: ['customer-due-history', selectedCustomer?._id] })
      setCollectionForm(emptyCollectionForm)
      setCollectOpen(false)
      showSuccess('Due payment collected successfully')
    },
    onError: (error) => {
      showError(error?.message || 'Failed to collect due payment')
    }
  })

  const customers = data?.customers || []
  const totalCustomers = totalCustomersData?.total ?? data?.total ?? customers.length
  const dueSummary = dueSummaryData?.summary || { totalDue: 0, dueCustomersCount: 0, averageDue: 0 }
  const filteredCustomers = customers

  const activeCustomers = useMemo(
    () => customers.filter((customer) => customer.isActive).length,
    [customers]
  )

  const avgPurchase = useMemo(() => {
    if (!customers.length) return 0
    return customers.reduce((sum, customer) => sum + Number(customer.totalPurchases || 0), 0) / customers.length
  }, [customers])

  const dueCustomers = useMemo(
    () => customers.filter((customer) => Number(customer.dueAmount || 0) > 0).length,
    [customers]
  )

  const topCustomers = useMemo(() => {
    return [...customers]
      .sort((a, b) => Number(b.totalPurchases || 0) - Number(a.totalPurchases || 0))
      .slice(0, 5)
  }, [customers])

  const handleCustomerFormChange = (e) => {
    const { name, value } = e.target
    setCustomerForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddCustomer = (e) => {
    e.preventDefault()

    if (!currentCompany?.id) {
      showError('Please select a company first')
      return
    }

    createCustomerMutation.mutate({
      companyId: currentCompany.id,
      name: customerForm.name.trim(),
      email: customerForm.email.trim() || undefined,
      phone: customerForm.phone.trim(),
      customerType: customerForm.customerType,
      creditLimit: Number(customerForm.creditLimit || 0),
      address: customerForm.address
        ? { street: customerForm.address.trim() }
        : undefined
    })
  }

  const openCollectDialog = (customer) => {
    setSelectedCustomer(customer)
    setCollectionForm({
      ...emptyCollectionForm,
      amount: String(Number(customer?.dueAmount || 0))
    })
    setCollectOpen(true)
  }

  const openHistoryDialog = (customer) => {
    setSelectedCustomer(customer)
    setHistoryOpen(true)
  }

  const handleCollectDue = () => {
    if (!selectedCustomer?._id) return

    collectDueMutation.mutate({
      customerId: selectedCustomer._id,
      payload: {
        amount: Number(collectionForm.amount),
        paymentMethod: collectionForm.paymentMethod,
        note: collectionForm.note.trim() || undefined,
        transactionId: collectionForm.transactionId.trim() || undefined,
      }
    })
  }

  const getTypeColor = (type) => {
    const t = String(type || '').toLowerCase()
    const colors = {
      corporate: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      wholesale: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      retail: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      walk_in: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
    return colors[t] || colors.walk_in
  }

  const handleExportCustomers = (type = 'excel') => {
    if (!customers.length) {
      showError('No customers available to export')
      return
    }

    const rows = customers.map((customer) => ({
      Name: customer.name,
      Phone: customer.phone,
      Email: customer.email || '-',
      Type: customer.customerType,
      'Credit Limit': Number(customer.creditLimit || 0),
      Due: Number(customer.dueAmount || 0),
      'Total Purchases': Number(customer.totalPurchases || 0),
      Status: customer.isActive ? 'Active' : 'Inactive',
      'Last Purchase': customer.lastPurchaseDate ? new Date(customer.lastPurchaseDate).toLocaleDateString() : '-'
    }))

    const filename = `${(currentCompany?.name || 'company').replace(/\s+/g, '-').toLowerCase()}-customers`
    const ok = type === 'pdf'
      ? exportToPDF(rows, filename, 'Customer List')
      : type === 'csv'
        ? exportToCSV(rows, filename)
        : exportToExcel(rows, filename, 'Customers')

    if (ok) showSuccess(`Customers exported as ${type.toUpperCase()}`)
    else showError('Failed to export customers')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Customer Management</h1>
          <p className="text-muted-foreground">
            Manage customers, track outstanding dues, and collect payments
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Export Customers</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleExportCustomers('excel')}>Export as Excel</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExportCustomers('csv')}>Export as CSV</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExportCustomers('pdf')}>Export as PDF</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              {customers.length > 0 ? `Showing ${customers.length} customers` : 'No customers yet'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Due</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(dueSummary.totalDue)}</div>
            <p className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-red-600" />
              {dueSummary.dueCustomersCount} customers with due
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
            <p className="text-xs text-muted-foreground">
              {customers.length ? `${Math.round((activeCustomers / customers.length) * 100)}% active rate` : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Purchase</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(avgPurchase)}</div>
            <p className="text-xs text-muted-foreground">
              {dueCustomers} customers currently owe money
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>All Customers</CardTitle>
              <CardDescription>
                View balances, due amounts, and payment activity
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                className="w-full pl-9"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setPage(1)
                }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Credit Limit</TableHead>
                <TableHead>Current Due</TableHead>
                <TableHead>Total Purchased</TableHead>
                <TableHead>Last Purchase</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer._id || customer.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={customer.avatar} alt={customer.name || 'Customer'} />
                        <AvatarFallback>
                          {(customer.name || '').split(' ').map((n) => n[0]).join('') || 'C'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{customer.name || 'Unnamed Customer'}</div>
                        <div className="text-sm text-muted-foreground">
                          ID: CUST-{String(customer._id || '').slice(-6).toUpperCase()}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-3 w-3" />
                        {customer.phone || '-'}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-3 w-3" />
                        {customer.email || '-'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getTypeColor(customer.customerType)}>
                      {String(customer.customerType || '').replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{formatCurrency(customer.creditLimit)}</div>
                  </TableCell>
                  <TableCell>
                    <div className={`font-medium ${Number(customer.dueAmount || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(customer.dueAmount)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{formatCurrency(customer.totalPurchases)}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {customer.lastPurchaseDate ? new Date(customer.lastPurchaseDate).toLocaleDateString() : '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={customer.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}>
                      {customer.isActive ? 'active' : 'inactive'}
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
                        <DropdownMenuItem onClick={() => openHistoryDialog(customer)}>
                          <ReceiptText className="mr-2 h-4 w-4" />
                          Due History
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openCollectDialog(customer)}
                          disabled={Number(customer.dueAmount || 0) <= 0}
                        >
                          <DollarSign className="mr-2 h-4 w-4" />
                          Collect Due
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem disabled>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {(isLoading || error || filteredCustomers.length === 0) && (
            <div className="py-12 text-center">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">
                {isLoading ? 'Loading customers...' : error ? 'Error loading customers' : 'No customers found'}
              </h3>
              <p className="mt-2 text-muted-foreground">
                {error?.data?.errors?.[0]?.message || error?.message || (searchTerm ? 'No customers match your search criteria.' : 'Add your first customer below.')}
              </p>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {filteredCustomers.length} of {totalCustomers} customers
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                Previous
              </Button>
              <Button variant="outline" size="sm" className="font-bold">
                {page}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page * limit >= totalCustomers}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Add New Customer</CardTitle>
            <CardDescription>
              Create customers and define their credit limit
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddCustomer} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer-name">Customer Name</Label>
                  <Input
                    id="customer-name"
                    name="name"
                    value={customerForm.name}
                    onChange={handleCustomerFormChange}
                    placeholder="Enter customer name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer-type">Customer Type</Label>
                  <select
                    id="customer-type"
                    name="customerType"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={customerForm.customerType}
                    onChange={handleCustomerFormChange}
                  >
                    <option value="retail">Retail</option>
                    <option value="wholesale">Wholesale</option>
                    <option value="corporate">Corporate</option>
                    <option value="walk_in">Walk In</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer-email">Email Address</Label>
                <Input
                  id="customer-email"
                  name="email"
                  type="email"
                  value={customerForm.email}
                  onChange={handleCustomerFormChange}
                  placeholder="customer@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer-phone">Phone Number</Label>
                <Input
                  id="customer-phone"
                  name="phone"
                  value={customerForm.phone}
                  onChange={handleCustomerFormChange}
                  placeholder="+8801712345678"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer-address">Address</Label>
                <Input
                  id="customer-address"
                  name="address"
                  value={customerForm.address}
                  onChange={handleCustomerFormChange}
                  placeholder="Enter customer address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="credit-limit">Credit Limit (BDT)</Label>
                <Input
                  id="credit-limit"
                  name="creditLimit"
                  type="number"
                  min="0"
                  value={customerForm.creditLimit}
                  onChange={handleCustomerFormChange}
                  placeholder="0"
                />
              </div>

              <Button type="submit" className="w-full" disabled={createCustomerMutation.isPending}>
                <UserPlus className="mr-2 h-4 w-4" />
                {createCustomerMutation.isPending ? 'Adding...' : 'Add Customer'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Customers</CardTitle>
            <CardDescription>
              Customers with highest purchase values
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCustomers.length > 0 ? topCustomers.map((customer, index) => (
                <div key={customer._id} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <div className="font-medium">{customer.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Due: {formatCurrency(customer.dueAmount)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{formatCurrency(customer.totalPurchases)}</div>
                    <div className="text-sm text-green-600">
                      Top {index + 1} customer
                    </div>
                  </div>
                </div>
              )) : (
                <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                  No customer purchase data yet
                </div>
              )}
            </div>

            <div className="mt-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
              <h4 className="mb-2 font-medium">Due Management Tips</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>Keep credit limits realistic for each customer.</li>
                <li>Collect due in partial payments when needed.</li>
                <li>Use due history before giving more credit.</li>
                <li>Review overdue balances every day.</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={collectOpen} onOpenChange={setCollectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Collect Due Payment</DialogTitle>
            <DialogDescription>
              Record a due payment from {selectedCustomer?.name || 'this customer'}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/40 p-4">
              <div className="text-sm text-muted-foreground">Current Due</div>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(selectedCustomer?.dueAmount)}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="collect-amount">Amount</Label>
              <Input
                id="collect-amount"
                type="number"
                min="1"
                value={collectionForm.amount}
                onChange={(e) => setCollectionForm((prev) => ({ ...prev, amount: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="collect-method">Payment Method</Label>
              <select
                id="collect-method"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={collectionForm.paymentMethod}
                onChange={(e) => setCollectionForm((prev) => ({ ...prev, paymentMethod: e.target.value }))}
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="mobile_banking">Mobile Banking</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="collect-transaction-id">Transaction ID</Label>
              <Input
                id="collect-transaction-id"
                value={collectionForm.transactionId}
                onChange={(e) => setCollectionForm((prev) => ({ ...prev, transactionId: e.target.value }))}
                placeholder="Optional"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="collect-note">Note</Label>
              <Input
                id="collect-note"
                value={collectionForm.note}
                onChange={(e) => setCollectionForm((prev) => ({ ...prev, note: e.target.value }))}
                placeholder="Optional note"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCollectOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCollectDue} disabled={collectDueMutation.isPending}>
              {collectDueMutation.isPending ? 'Collecting...' : 'Collect Payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Due Payment History</DialogTitle>
            <DialogDescription>
              Payment history for {selectedCustomer?.name || 'this customer'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/40 p-4">
              <div className="text-sm text-muted-foreground">Current Due</div>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(selectedCustomer?.dueAmount)}
              </div>
            </div>

            {dueHistoryLoading ? (
              <div className="py-8 text-center text-muted-foreground">Loading due history...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Collected By</TableHead>
                    <TableHead>Note</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(dueHistoryData?.history || []).map((item) => (
                    <TableRow key={item._id}>
                      <TableCell>{new Date(item.date || item.createdAt).toLocaleString()}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(item.amount)}</TableCell>
                      <TableCell>{String(item.paymentMethod || '-').replace(/_/g, ' ')}</TableCell>
                      <TableCell>{item.performedBy?.name || '-'}</TableCell>
                      <TableCell>{item.description || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {!dueHistoryLoading && (dueHistoryData?.history || []).length === 0 && (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                No due payment history yet
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Customers

