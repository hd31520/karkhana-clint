import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'
import { Progress } from '../../components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { useAuth } from '../../contexts/AuthContext'
import { canAccessAdmin } from '../../lib/roleUtils'
import {
  Activity,
  AlertTriangle,
  Bell,
  Building2,
  CircleDollarSign,
  Clock3,
  Filter,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  Users,
} from 'lucide-react'

const monitoredCompanies = [
  {
    id: 1,
    name: 'Karim Furniture',
    type: 'Wood Factory',
    owner: 'Abdul Karim',
    plan: 'Premium',
    status: 'active',
    workers: 25,
    monthlyRevenue: 1250000,
    activityScore: 92,
    lastActivity: '2 hours ago',
    risk: 'low',
    billing: 'paid',
    issue: 'No issues detected',
  },
  {
    id: 2,
    name: 'Textile Mart',
    type: 'Textile Shop',
    owner: 'Fatima Begum',
    plan: 'Standard',
    status: 'active',
    workers: 12,
    monthlyRevenue: 850000,
    activityScore: 74,
    lastActivity: '5 hours ago',
    risk: 'medium',
    billing: 'due soon',
    issue: 'Billing renewal due in 3 days',
  },
  {
    id: 3,
    name: 'Metal Works Inc',
    type: 'Iron Factory',
    owner: 'Kamal Hossain',
    plan: 'Basic',
    status: 'active',
    workers: 8,
    monthlyRevenue: 650000,
    activityScore: 61,
    lastActivity: '1 day ago',
    risk: 'medium',
    billing: 'paid',
    issue: 'Sales activity dropped this week',
  },
  {
    id: 4,
    name: 'Food Processing',
    type: 'Food Factory',
    owner: 'Raju Ahmed',
    plan: 'Premium',
    status: 'pending',
    workers: 18,
    monthlyRevenue: 950000,
    activityScore: 43,
    lastActivity: '2 days ago',
    risk: 'high',
    billing: 'pending',
    issue: 'Pending verification and payment setup',
  },
  {
    id: 5,
    name: 'Plastic Products',
    type: 'Plastic Factory',
    owner: 'Sharmin Akter',
    plan: 'Basic',
    status: 'suspended',
    workers: 6,
    monthlyRevenue: 450000,
    activityScore: 22,
    lastActivity: '5 days ago',
    risk: 'high',
    billing: 'overdue',
    issue: 'Subscription overdue and account suspended',
  },
  {
    id: 6,
    name: 'Chemical Factory',
    type: 'Chemical',
    owner: 'Abdul Malik',
    plan: 'Standard',
    status: 'active',
    workers: 15,
    monthlyRevenue: 750000,
    activityScore: 88,
    lastActivity: '1 hour ago',
    risk: 'low',
    billing: 'paid',
    issue: 'No issues detected',
  },
]

const monitoringAlerts = [
  {
    title: '1 company suspended',
    description: 'Plastic Products needs admin review before account reactivation.',
    severity: 'high',
  },
  {
    title: '2 billing actions pending',
    description: 'Food Processing and Textile Mart need subscription follow-up.',
    severity: 'medium',
  },
  {
    title: 'Low activity detected',
    description: 'Metal Works Inc has lower sales activity than last week.',
    severity: 'medium',
  },
]

const getStatusBadgeClass = (status) => {
  const styles = {
    active: 'bg-green-100 text-green-800 hover:bg-green-100',
    pending: 'bg-amber-100 text-amber-800 hover:bg-amber-100',
    suspended: 'bg-red-100 text-red-800 hover:bg-red-100',
  }

  return styles[status] || 'bg-slate-100 text-slate-800 hover:bg-slate-100'
}

const getRiskBadgeClass = (risk) => {
  const styles = {
    low: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100',
    medium: 'bg-orange-100 text-orange-800 hover:bg-orange-100',
    high: 'bg-rose-100 text-rose-800 hover:bg-rose-100',
  }

  return styles[risk] || 'bg-slate-100 text-slate-800 hover:bg-slate-100'
}

const getBillingBadgeClass = (billing) => {
  const styles = {
    paid: 'bg-green-100 text-green-800 hover:bg-green-100',
    'due soon': 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
    pending: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
    overdue: 'bg-red-100 text-red-800 hover:bg-red-100',
  }

  return styles[billing] || 'bg-slate-100 text-slate-800 hover:bg-slate-100'
}

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    maximumFractionDigits: 0,
  }).format(amount)

const AdminSettings = () => {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [riskFilter, setRiskFilter] = useState('all')
  const [defaultPlan, setDefaultPlan] = useState('standard')
  const [alertFrequency, setAlertFrequency] = useState('daily')

  if (!canAccessAdmin(user?.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don&apos;t have permission to access the Settings page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const filteredCompanies = monitoredCompanies.filter((company) => {
    const matchesSearch =
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.type.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || company.status === statusFilter
    const matchesRisk = riskFilter === 'all' || company.risk === riskFilter

    return matchesSearch && matchesStatus && matchesRisk
  })

  const totalRevenue = monitoredCompanies.reduce((sum, company) => sum + company.monthlyRevenue, 0)
  const activeCompanies = monitoredCompanies.filter((company) => company.status === 'active').length
  const flaggedCompanies = monitoredCompanies.filter((company) => company.risk !== 'low').length
  const overdueBilling = monitoredCompanies.filter((company) => company.billing === 'overdue').length
  const averageHealth = Math.round(
    monitoredCompanies.reduce((sum, company) => sum + company.activityScore, 0) / monitoredCompanies.length
  )

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Monitoring Center</h1>
          <p className="text-muted-foreground">
            Monitor all companies, track risk, and manage platform-wide admin controls.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Status
          </Button>
          <Button>
            <Bell className="mr-2 h-4 w-4" />
            Send Alert Summary
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monitoredCompanies.length}</div>
            <p className="text-xs text-muted-foreground">{activeCompanies} currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">Cross-company billing overview</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workers Monitored</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {monitoredCompanies.reduce((sum, company) => sum + company.workers, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Across all company accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged Companies</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{flaggedCompanies}</div>
            <p className="text-xs text-muted-foreground">{overdueBilling} with overdue billing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Health</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-2xl font-bold">{averageHealth}%</div>
            <Progress value={averageHealth} />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="companies" className="space-y-4">
        <TabsList className="grid w-full grid-cols-1 gap-2 md:grid-cols-3">
          <TabsTrigger value="companies">Company Monitor</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="controls">Admin Controls</TabsTrigger>
        </TabsList>

        <TabsContent value="companies" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <CardTitle>Monitor All Companies</CardTitle>
                  <CardDescription>
                    Search and review company health, billing, activity, and risk in one place.
                  </CardDescription>
                </div>
                <div className="flex flex-col gap-3 md:flex-row">
                  <div className="relative min-w-[240px]">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      placeholder="Search company or owner"
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-[160px]">
                      <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={riskFilter} onValueChange={setRiskFilter}>
                    <SelectTrigger className="w-full md:w-[160px]">
                      <AlertTriangle className="mr-2 h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="Risk" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All risk</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-3">
                {filteredCompanies.slice(0, 3).map((company) => (
                  <Card key={company.id} className="border-dashed">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <CardTitle className="text-base">{company.name}</CardTitle>
                          <CardDescription>{company.type}</CardDescription>
                        </div>
                        <Badge className={getRiskBadgeClass(company.risk)}>{company.risk} risk</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Owner</span>
                        <span className="font-medium">{company.owner}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Billing</span>
                        <Badge className={getBillingBadgeClass(company.billing)}>{company.billing}</Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Activity score</span>
                          <span className="font-medium">{company.activityScore}%</span>
                        </div>
                        <Progress value={company.activityScore} />
                      </div>
                      <p className="text-sm text-muted-foreground">{company.issue}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Workers</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Activity</TableHead>
                      <TableHead>Billing</TableHead>
                      <TableHead>Last Activity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCompanies.map((company) => (
                      <TableRow key={company.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{company.name}</div>
                            <div className="text-sm text-muted-foreground">{company.owner}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeClass(company.status)}>{company.status}</Badge>
                        </TableCell>
                        <TableCell>{company.plan}</TableCell>
                        <TableCell>{company.workers}</TableCell>
                        <TableCell>{formatCurrency(company.monthlyRevenue)}</TableCell>
                        <TableCell>
                          <div className="flex min-w-[120px] items-center gap-3">
                            <Progress value={company.activityScore} />
                            <span className="text-sm font-medium">{company.activityScore}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getBillingBadgeClass(company.billing)}>{company.billing}</Badge>
                        </TableCell>
                        <TableCell>{company.lastActivity}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <Card>
              <CardHeader>
                <CardTitle>Priority Alerts</CardTitle>
                <CardDescription>Issues that need admin attention across all companies.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {monitoringAlerts.map((alert) => (
                  <div
                    key={alert.title}
                    className="flex items-start justify-between gap-4 rounded-lg border p-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        <p className="font-medium">{alert.title}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">{alert.description}</p>
                    </div>
                    <Badge className={getRiskBadgeClass(alert.severity)}>{alert.severity}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response Queue</CardTitle>
                <CardDescription>Recommended admin actions for faster issue resolution.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Clock3 className="h-4 w-4 text-muted-foreground" />
                    Review overdue subscription
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Plastic Products should be reviewed first because billing is overdue and the account is suspended.
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    Contact low-activity company
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Metal Works Inc may need onboarding help or operational support to restore activity.
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    Send billing reminder
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Textile Mart and Food Processing should receive automated renewal reminders today.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="controls" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Platform Controls</CardTitle>
                <CardDescription>Global defaults that help admins manage new and existing companies.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Default company plan</p>
                  <Select value={defaultPlan} onValueChange={setDefaultPlan}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select default plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Alert summary frequency</p>
                  <Select value={alertFrequency} onValueChange={setAlertFrequency}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select alert frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realtime">Real-time</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center gap-2 font-medium">
                      <Settings2 className="h-4 w-4 text-muted-foreground" />
                      Auto-monitoring
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Keep daily scoring enabled for activity, billing, and account risk review.
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center gap-2 font-medium">
                      <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                      Admin approval
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Require admin approval before reactivating suspended company accounts.
                    </p>
                  </div>
                </div>

                <Button className="w-full">Save Admin Controls</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monitoring Coverage</CardTitle>
                <CardDescription>How well the admin team can currently observe all company activity.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>User activity tracking</span>
                    <span className="font-medium">91%</span>
                  </div>
                  <Progress value={91} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Billing visibility</span>
                    <span className="font-medium">83%</span>
                  </div>
                  <Progress value={83} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Operational health checks</span>
                    <span className="font-medium">76%</span>
                  </div>
                  <Progress value={76} />
                </div>
                <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                  Next improvement: connect this screen to live admin APIs so the monitoring data updates automatically instead of using local demo data.
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AdminSettings
