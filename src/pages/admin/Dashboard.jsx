import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Badge } from '../../components/ui/badge'
import {
  Users,
  Building,
  DollarSign,
  TrendingUp,
  Activity,
  Download,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { canAccessAdmin } from '../../lib/roleUtils'
import adminService from '../../services/adminService'
import useApiQuery from '../../hooks/useApiQuery'

const AdminDashboard = () => {
  const { user } = useAuth()

  if (!canAccessAdmin(user?.role)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don&apos;t have permission to access the Admin Dashboard.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const { data: statsData } = useApiQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => adminService.getStats(),
  })

  const { data: companiesData } = useApiQuery({
    queryKey: ['admin', 'companies', 'dashboard'],
    queryFn: () => adminService.getCompanies({ limit: 5 }),
  })

  const { data: usersData } = useApiQuery({
    queryKey: ['admin', 'users', 'dashboard'],
    queryFn: () => adminService.getUsers({ limit: 5 }),
  })

  const stats = [
    { title: 'Total Users', value: statsData?.stats?.totalUsers ?? '-', icon: Users },
    { title: 'Active Companies', value: statsData?.stats?.totalCompanies ?? '-', icon: Building },
    { title: 'Monthly Revenue', value: `BDT ${Number(statsData?.stats?.totalRevenue ?? 0).toLocaleString()}`, icon: DollarSign },
    { title: 'Active Subscriptions', value: statsData?.stats?.activeSubscriptions ?? '-', icon: Activity },
  ]

  const recentCompanies = companiesData?.companies ?? []
  const recentUsers = usersData?.users ?? []

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Overview of platform statistics and activities</p>
        </div>
        <Button variant="outline" className="w-full sm:w-auto">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Companies</CardTitle>
            <CardDescription>Latest companies registered on the platform</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table className="min-w-[720px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Company Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentCompanies.map((company) => (
                  <TableRow key={company._id || company.id}>
                    <TableCell className="font-medium">{company.name}</TableCell>
                    <TableCell>{company.businessType || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{company.subscription?.plan || '-'}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          company.subscription?.status === 'active'
                            ? 'default'
                            : company.subscription?.status === 'pending'
                              ? 'secondary'
                              : 'destructive'
                        }
                      >
                        {company.subscription?.status || 'unknown'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
            <CardDescription>Latest user registrations</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table className="min-w-[720px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentUsers.map((account) => (
                  <TableRow key={account._id || account.id}>
                    <TableCell className="font-medium">{account.name}</TableCell>
                    <TableCell>{account.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{account.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={account.isActive ? 'default' : 'secondary'}>
                        {account.isActive ? 'active' : 'inactive'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Platform Health</CardTitle>
            <CardDescription>System performance and status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Server Status</div>
                  <div className="text-sm text-muted-foreground">All systems operational</div>
                </div>
                <Badge variant="default">Online</Badge>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Authentication</div>
                  <div className="text-sm text-muted-foreground">Interceptor-based session handling enabled</div>
                </div>
                <Badge variant="outline">Protected</Badge>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">API Client</div>
                  <div className="text-sm text-muted-foreground">Single shared axios instance</div>
                </div>
                <Badge variant="outline">Standardized</Badge>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Admin Monitoring</div>
                  <div className="text-sm text-muted-foreground">Live platform summary</div>
                </div>
                <Badge variant="outline">Ready</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-auto flex-col items-center justify-center p-4">
                <Users className="mb-2 h-5 w-5" />
                <span className="text-sm">Manage Users</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col items-center justify-center p-4">
                <Building className="mb-2 h-5 w-5" />
                <span className="text-sm">Manage Companies</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col items-center justify-center p-4">
                <DollarSign className="mb-2 h-5 w-5" />
                <span className="text-sm">View Revenue</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col items-center justify-center p-4">
                <TrendingUp className="mb-2 h-5 w-5" />
                <span className="text-sm">Analytics</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AdminDashboard
