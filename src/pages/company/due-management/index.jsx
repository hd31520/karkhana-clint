import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertCircle,
  DollarSign,
  Eye,
  ReceiptText,
  Search,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react'

import { useAuth } from '../../../contexts/AuthContext'
import { useToast } from '../../../contexts/ToastContext'
import dueManagementService from '../../../services/dueManagementService'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table'
import { Badge } from '../../../components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog'

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'BDT',
  maximumFractionDigits: 0,
})

const formatCurrency = (value) => currencyFormatter.format(Number(value || 0))

const emptyCollectionForm = {
  amount: '',
  paymentMethod: 'cash',
  note: '',
  transactionId: '',
}

const paymentMethods = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'mobile_banking', label: 'Mobile Banking' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'cheque', label: 'Cheque' },
]

const DueManagement = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [collectOpen, setCollectOpen] = useState(false)
  const [collectionForm, setCollectionForm] = useState(emptyCollectionForm)
  const { currentCompany } = useAuth()
  const { showSuccess, showError } = useToast()
  const queryClient = useQueryClient()

  const companyId = currentCompany?._id || currentCompany?.id

  const { data: dueSummaryData, isLoading: dueSummaryLoading } = useQuery({
    queryKey: ['due-management-summary', companyId],
    queryFn: () => dueManagementService.getDueSummary(companyId),
    enabled: !!companyId,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  })

  const { data: dueMemosData, isLoading: dueMemosLoading } = useQuery({
    queryKey: ['due-management-memos', companyId],
    queryFn: () => dueManagementService.getDueMemos(companyId),
    enabled: !!companyId,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  })

  const { data: dueHistoryData, isLoading: dueHistoryLoading } = useQuery({
    queryKey: ['due-management-history', selectedCustomer?._id],
    queryFn: () => dueManagementService.getCustomerDueHistory(selectedCustomer?._id),
    enabled: historyOpen && !!selectedCustomer?._id,
  })

  const collectDueMutation = useMutation({
    mutationFn: ({ customerId, payload }) => dueManagementService.collectDue(customerId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['due-management-summary', companyId] })
      queryClient.invalidateQueries({ queryKey: ['due-management-history', selectedCustomer?._id] })
      queryClient.invalidateQueries({ queryKey: ['customers', companyId] })
      setCollectionForm(emptyCollectionForm)
      setCollectOpen(false)
      showSuccess('Due payment collected successfully')
    },
    onError: (error) => {
      showError(error?.message || 'Failed to collect due payment')
    },
  })

  const dueSummary = dueSummaryData?.summary || {
    totalDue: 0,
    dueCustomersCount: 0,
    averageDue: 0,
  }

  const dueCustomers = useMemo(() => {
    const customers = dueSummaryData?.customers || []
    const keyword = searchTerm.trim().toLowerCase()

    if (!keyword) {
      return customers
    }

    return customers.filter((customer) =>
      [customer.name, customer.phone, customer.email]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))
    )
  }, [dueSummaryData?.customers, searchTerm])

  const outstandingMemos = useMemo(() => {
    const memos = dueMemosData?.memos || []

    return memos
      .filter((memo) => Number(memo.dueAmount || 0) > 0)
      .sort((a, b) => Number(b.dueAmount || 0) - Number(a.dueAmount || 0))
  }, [dueMemosData?.memos])

  const memoDueTotal = useMemo(
    () => outstandingMemos.reduce((sum, memo) => sum + Number(memo.dueAmount || 0), 0),
    [outstandingMemos]
  )

  const openCollectDialog = (customer) => {
    setSelectedCustomer(customer)
    setCollectionForm({
      ...emptyCollectionForm,
      amount: String(Number(customer?.dueAmount || 0)),
    })
    setCollectOpen(true)
  }

  const openHistoryDialog = (customer) => {
    setSelectedCustomer(customer)
    setHistoryOpen(true)
  }

  const handleCollectDue = () => {
    if (!selectedCustomer?._id) {
      return
    }

    collectDueMutation.mutate({
      customerId: selectedCustomer._id,
      payload: {
        amount: Number(collectionForm.amount),
        paymentMethod: collectionForm.paymentMethod,
        note: collectionForm.note.trim() || undefined,
        transactionId: collectionForm.transactionId.trim() || undefined,
      },
    })
  }

  if (!companyId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Due Management</h1>
          <p className="text-muted-foreground">Review previous dues and collect pending customer balances.</p>
        </div>

        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Select a company first to access the due management system.
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Due Management</h1>
          <p className="text-muted-foreground">
            View previous due records, outstanding memo balances, and collect customer payments from one place.
          </p>
        </div>

        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search due customers..."
            className="pl-9"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Customer Due</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{formatCurrency(dueSummary.totalDue)}</div>
              <Wallet className="h-5 w-5 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Due Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{dueSummary.dueCustomersCount}</div>
              <Users className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Due</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{formatCurrency(dueSummary.averageDue)}</div>
              <TrendingUp className="h-5 w-5 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Memos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{formatCurrency(memoDueTotal)}</div>
                <div className="text-xs text-muted-foreground">{outstandingMemos.length} memos with due</div>
              </div>
              <ReceiptText className="h-5 w-5 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr,1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Previous Due Customers</CardTitle>
            <CardDescription>
              Existing due balances already stored in the current customer system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dueSummaryLoading ? (
              <div className="py-8 text-center text-muted-foreground">Loading due customers...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Credit Limit</TableHead>
                    <TableHead>Due</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dueCustomers.map((customer) => (
                    <TableRow key={customer._id}>
                      <TableCell>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-xs text-muted-foreground">
                          Last purchase:{' '}
                          {customer.lastPurchaseDate ? new Date(customer.lastPurchaseDate).toLocaleDateString() : 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>{customer.phone || '-'}</TableCell>
                      <TableCell>{formatCurrency(customer.creditLimit)}</TableCell>
                      <TableCell className="font-medium text-red-600">{formatCurrency(customer.dueAmount)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => openHistoryDialog(customer)}>
                            <Eye className="mr-2 h-4 w-4" />
                            History
                          </Button>
                          <Button size="sm" onClick={() => openCollectDialog(customer)}>
                            <DollarSign className="mr-2 h-4 w-4" />
                            Collect
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {!dueSummaryLoading && dueCustomers.length === 0 && (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                No due customers found.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Outstanding Sales Memos</CardTitle>
            <CardDescription>
              Due values coming from memo sales where payment stayed pending or partial.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {dueMemosLoading ? (
              <div className="py-8 text-center text-muted-foreground">Loading memo dues...</div>
            ) : outstandingMemos.length > 0 ? (
              outstandingMemos.slice(0, 8).map((memo) => (
                <div key={memo._id} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{memo.memoNumber || 'Memo'}</div>
                      <div className="text-sm text-muted-foreground">
                        {memo.customer?.name || memo.customerName || 'Walk-in customer'}
                      </div>
                    </div>
                    <Badge variant="outline">{memo.status || 'pending'}</Badge>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <div className="text-muted-foreground">Total</div>
                      <div className="font-medium">{formatCurrency(memo.total)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Paid</div>
                      <div className="font-medium text-emerald-600">{formatCurrency(memo.paidAmount)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Due</div>
                      <div className="font-medium text-red-600">{formatCurrency(memo.dueAmount)}</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                No outstanding memo dues right now.
              </div>
            )}

            <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
              <div className="mb-2 flex items-center gap-2 font-medium">
                <AlertCircle className="h-4 w-4" />
                Due Management Notes
              </div>
              <ul className="space-y-1 text-xs sm:text-sm">
                <li>Review previous due history before giving more credit.</li>
                <li>Collect partial payments and keep transaction references.</li>
                <li>Track memo dues separately from customer credit exposure.</li>
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
              <div className="text-2xl font-bold text-red-600">{formatCurrency(selectedCustomer?.dueAmount)}</div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="due-amount">Amount</Label>
              <Input
                id="due-amount"
                type="number"
                min="1"
                value={collectionForm.amount}
                onChange={(event) => setCollectionForm((prev) => ({ ...prev, amount: event.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="due-payment-method">Payment Method</Label>
              <select
                id="due-payment-method"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={collectionForm.paymentMethod}
                onChange={(event) => setCollectionForm((prev) => ({ ...prev, paymentMethod: event.target.value }))}
              >
                {paymentMethods.map((method) => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="due-transaction-id">Transaction ID</Label>
              <Input
                id="due-transaction-id"
                value={collectionForm.transactionId}
                onChange={(event) => setCollectionForm((prev) => ({ ...prev, transactionId: event.target.value }))}
                placeholder="Optional"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="due-note">Note</Label>
              <Input
                id="due-note"
                value={collectionForm.note}
                onChange={(event) => setCollectionForm((prev) => ({ ...prev, note: event.target.value }))}
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
            <DialogTitle>Previous Due History</DialogTitle>
            <DialogDescription>
              Collection history for {selectedCustomer?.name || 'this customer'}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/40 p-4">
              <div className="text-sm text-muted-foreground">Current Due</div>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(selectedCustomer?.dueAmount)}</div>
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
                No previous due collection history yet.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default DueManagement
