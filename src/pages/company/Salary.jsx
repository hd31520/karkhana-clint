import { useState, useMemo } from 'react'
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
  DollarSign,
  CreditCard,
  Download,
  Filter,
  Search,
  Calendar,
  Users,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  MoreVertical,
  Eye,
  Edit,
  Printer,
  Mail
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu'

const Salary = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('payroll')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [salaryMonth, setSalaryMonth] = useState(() => {
    const d = new Date()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    return `${d.getFullYear()}-${mm}`
  })
  const [selectedEmployees, setSelectedEmployees] = useState([])
  const { currentCompany } = useAuth()

  const toggleEmployee = (id) => {
    setSelectedEmployees((prev) => {
      if (!id) return prev
      return prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    })
  }


  const { data, isLoading, error } = useQuery(
    { queryKey: ['salaries', currentCompany?.id, page, limit],
      queryFn: () => api.get('/salary', { params: { companyId: currentCompany?.id, page, limit } }),
      enabled: !!currentCompany }
  )

  const salaryData = data?.salaries || []
  const salariesTotal = data?.total ?? salaryData.length

  const { data: workersData } = useQuery({
    queryKey: ['workers', currentCompany?.id],
    queryFn: () => api.get('/workers', { params: { companyId: currentCompany?.id } }),
    enabled: !!currentCompany,
  })

  const workers = workersData?.workers || []

  const totalSelectedAmount = useMemo(() => {
    if (!workers || workers.length === 0) return 0
    return workers.reduce((sum, w) => {
      const id = w._id || w.id
      if (!id) return sum
      if (!selectedEmployees.includes(id)) return sum
      const base = Number(w.salary?.baseSalary || w.baseSalary || 0)
      return sum + base
    }, 0)
  }, [workers, selectedEmployees])

  const filteredSalary = (salaryData || []).filter(item => {
    const name = (item.worker?.user?.name || item.employee || '').toString().toLowerCase()
    const empId = (item.worker?.employeeId || item.employeeId || '').toString().toLowerCase()
    const q = searchTerm.toLowerCase()
    return name.includes(q) || empId.includes(q)
  })

  const getStatusColor = (status) => {
    const colors = {
      'Paid': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'Pending': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
      'Hold': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    }
    return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }

  // Derived metrics from salaries
  const monthlyTotal = useMemo(() => (salaryData || []).reduce((s, r) => s + (Number(r.netSalary || 0)), 0), [salaryData])
  const paidTotal = useMemo(() => (salaryData || []).reduce((s, r) => s + (Number(r.payment?.paidAmount || 0)), 0), [salaryData])
  const pendingTotal = monthlyTotal - paidTotal
  const overtimeAmount = useMemo(() => (salaryData || []).reduce((s, r) => s + (Number(r.earnings?.overtime?.amount || 0)), 0), [salaryData])
  const overtimeHours = useMemo(() => (salaryData || []).reduce((s, r) => s + (Number(r.earnings?.overtime?.hours || 0)), 0), [salaryData])
  const bonusTotal = useMemo(() => (salaryData || []).reduce((s, r) => s + (Number(r.earnings?.bonus || 0)), 0), [salaryData])
  const deductionsTotal = useMemo(() => (salaryData || []).reduce((s, r) => s + (Number(r.deductions?.total || 0)), 0), [salaryData])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Salary Management</h1>
          <p className="text-muted-foreground">
            Process salaries, track payments, and manage deductions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <CreditCard className="mr-2 h-4 w-4" />
            Process Salary
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Salary</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(monthlyTotal || 0)}</div>
            <p className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
              {salaryData.length ? `${salaryData.length} records` : 'No records'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid This Month</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(paidTotal || 0)}</div>
            <p className="text-xs text-muted-foreground">
              For {salaryData.filter(s => (s.payment?.status === 'paid' || s.payment?.status === 'partial')).length} employees
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Salary</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(pendingTotal || 0)}</div>
            <p className="text-xs text-muted-foreground">
              {salaryData.filter(s => s.payment?.status === 'pending').length} employees pending
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overtime Amount</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(overtimeAmount || 0)}</div>
            <p className="text-xs text-muted-foreground">
              {overtimeHours} overtime hours
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="payroll" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{new Date(`${salaryMonth}-01`).toLocaleString(undefined, { month: 'long', year: 'numeric' })} Payroll</CardTitle>
                  <CardDescription>
                    Salary details for all employees
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search employees..."
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
                    <TableHead>Employee</TableHead>
                    <TableHead>Base Salary</TableHead>
                    <TableHead>Overtime</TableHead>
                    <TableHead>Bonus</TableHead>
                    <TableHead>Deductions</TableHead>
                    <TableHead>Net Salary</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSalary.map((salary) => (
                    <TableRow key={salary._id || salary.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{salary.worker?.user?.name || salary.worker?.employeeId || 'Employee'}</div>
                          <div className="text-sm text-muted-foreground">
                            {salary.worker?.employeeId || '-'} • {salary.worker?.designation || '-'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(salary.baseSalary || 0)}</TableCell>
                      <TableCell className="text-amber-600">{`${salary.earnings?.overtime?.hours || 0}h • ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(salary.earnings?.overtime?.amount || 0)}`}</TableCell>
                      <TableCell className="text-green-600">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(salary.earnings?.bonus || 0)}</TableCell>
                      <TableCell className="text-red-600">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(salary.deductions?.total || 0)}</TableCell>
                      <TableCell className="font-bold">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(salary.netSalary || 0)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor((salary.payment?.status || '').toString().toLowerCase() === 'paid' ? 'Paid' : (salary.payment?.status || '').toString())}>
                          {(salary.payment?.status || 'pending').toString().charAt(0).toUpperCase() + (salary.payment?.status || 'pending').toString().slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{salary.payment?.paidDate ? new Date(salary.payment.paidDate).toLocaleDateString() : (salary.payment?.paidDate === null ? '-' : '-')}</TableCell>
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
                              Edit Salary
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Printer className="mr-2 h-4 w-4" />
                              Print Slip
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="mr-2 h-4 w-4" />
                              Send Slip
                            </DropdownMenuItem>
                            {!(salary.payment?.status === 'paid') && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-green-600">
                                  <CreditCard className="mr-2 h-4 w-4" />
                                  Mark as Paid
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredSalary.length === 0 && (
                <div className="py-12 text-center">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No salary records found</h3>
                  <p className="mt-2 text-muted-foreground">
                    No records match your search criteria.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Salary Summary</CardTitle>
                <CardDescription>
                  Breakdown of salary components
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { component: 'Base Salary', amount: (salaryData || []).reduce((s, r) => s + (Number(r.baseSalary || 0)), 0), color: 'bg-blue-500' },
                    { component: 'Overtime', amount: overtimeAmount, color: 'bg-amber-500' },
                    { component: 'Bonus', amount: bonusTotal, color: 'bg-green-500' },
                    { component: 'Deductions', amount: deductionsTotal, color: 'bg-red-500' },
                  ].map((item) => {
                    const percent = monthlyTotal > 0 ? Math.round((item.amount / (monthlyTotal || 1)) * 100) : 0
                    return (
                      <div key={item.component} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{item.component}</span>
                          <span className="text-sm text-muted-foreground">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(item.amount || 0)}</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                          <div
                            className={`h-full rounded-full ${item.color}`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <span className="font-bold">Net Salary</span>
                      <span className="text-xl font-bold">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(monthlyTotal || 0)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common salary operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="h-auto flex-col items-center justify-center p-4">
                    <CreditCard className="mb-2 h-5 w-5" />
                    <span className="text-sm">Bulk Payment</span>
                  </Button>
                  <Button variant="outline" className="h-auto flex-col items-center justify-center p-4">
                    <Download className="mb-2 h-5 w-5" />
                    <span className="text-sm">Export Payroll</span>
                  </Button>
                  <Button variant="outline" className="h-auto flex-col items-center justify-center p-4">
                    <Printer className="mb-2 h-5 w-5" />
                    <span className="text-sm">Print All Slips</span>
                  </Button>
                  <Button variant="outline" className="h-auto flex-col items-center justify-center p-4">
                    <Calendar className="mb-2 h-5 w-5" />
                    <span className="text-sm">Salary Schedule</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="processing">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Process Monthly Salary</CardTitle>
                <CardDescription>
                  Calculate and process salary for selected month
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="salary-month">Select Month</Label>
                      <Input id="salary-month" type="month" value={salaryMonth} onChange={(e) => setSalaryMonth(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="payment-date">Payment Date</Label>
                      <Input id="payment-date" type="date" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Salary Components</Label>
                    <div className="rounded-lg border p-4">
                      <div className="grid grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="ot-rate">Overtime Rate</Label>
                          <Input id="ot-rate" placeholder="৳350" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bonus-rate">Bonus %</Label>
                          <Input id="bonus-rate" placeholder="5%" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="advance-ded">Advance Deduction</Label>
                          <Input id="advance-ded" placeholder="৳0" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tax-rate">Tax Rate</Label>
                          <Input id="tax-rate" placeholder="10%" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Select Employees</Label>
                    <div className="rounded-lg border">
                      <div className="max-h-60 overflow-y-auto p-4">
                        {workers.map((employee) => {
                          const id = employee._id || employee.id
                          const checked = selectedEmployees.includes(id)
                          return (
                            <div key={id} className="flex items-center justify-between py-2">
                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  id={`emp-${id}`}
                                  checked={checked}
                                  onChange={() => toggleEmployee(id)}
                                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <Label htmlFor={`emp-${id}`}>{employee.user?.name || employee.name}</Label>
                              </div>
                              <Badge variant="outline">{employee.salary?.baseSalary ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(employee.salary.baseSalary) : '৳0'}</Badge>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">Total Amount</h4>
                        <p className="text-sm text-muted-foreground">For {selectedEmployees.length} selected employees</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(totalSelectedAmount || 0)}</div>
                        <div className="text-sm text-muted-foreground">Net payable amount</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button variant="outline">Calculate Only</Button>
                    <Button>Process Payment</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Salary Reports</CardTitle>
                <CardDescription>
                  Generate and download salary reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">Monthly Salary Report</h4>
                        <p className="text-sm text-muted-foreground">Detailed salary breakdown</p>
                      </div>
                      <Button size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">Overtime Report</h4>
                        <p className="text-sm text-muted-foreground">Overtime hours and payments</p>
                      </div>
                      <Button size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">Bonus Report</h4>
                        <p className="text-sm text-muted-foreground">Bonus distribution</p>
                      </div>
                      <Button size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">Tax Report</h4>
                        <p className="text-sm text-muted-foreground">Tax deductions and calculations</p>
                      </div>
                      <Button size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Salary