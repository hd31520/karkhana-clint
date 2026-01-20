import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import pkg from '../../../package.json'
import api from '../../utils/api'
import { useAuth } from '../../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Badge } from '../../components/ui/badge'
import { 
  Settings as SettingsIcon,
  Building,
  Users,
  CreditCard,
  Bell,
  Globe,
  Shield,
  Database,
  Download,
  Save,
  Upload,
  CheckCircle
} from 'lucide-react'

const Settings = () => {
  const [activeTab, setActiveTab] = useState('company')
  const { currentCompany } = useAuth()

  const { data: companyResp } = useQuery(
    { queryKey: ['company', currentCompany?.id],
      queryFn: () => api.get(`/companies/${currentCompany?.id}`).then(res => res.data),
      enabled: !!currentCompany }
  )

  const [companySettings, setCompanySettings] = useState({})

  useEffect(() => {
    if (companyResp?.company) {
      setCompanySettings(companyResp.company)
    }
  }, [companyResp])

  const { data: subscriptionResp, isLoading: subscriptionLoading, error: subscriptionError } = useQuery(
    { queryKey: ['subscription', currentCompany?.id],
      queryFn: () => api.get(`/subscriptions/${currentCompany?.id}`).then(res => res.data),
      enabled: !!currentCompany }
  )

  const subscription = subscriptionResp?.subscription || null

  const { data: workersResp } = useQuery(
    { queryKey: ['workers', currentCompany?.id],
      queryFn: () => api.get('/workers', { params: { companyId: currentCompany?.id } }).then(res => res.data),
      enabled: !!currentCompany }
  )

  const companyUsers = workersResp?.workers || []

  // Company-level stats (workers, products, today's sales)
  const { data: statsResp, isLoading: statsLoading } = useQuery(
    { queryKey: ['companyStats', currentCompany?.id],
      queryFn: () => api.get(`/companies/${currentCompany?.id}/stats`).then(r => r.data),
      enabled: !!currentCompany }
  )

  const companyStats = statsResp?.stats || {}

  const { data: usersCountResp, isLoading: usersCountLoading } = useQuery(
    { queryKey: ['companyUsersCount', currentCompany?.id],
      queryFn: () => api.get(`/companies/${currentCompany?.id}/users-count`).then(r => r.data),
      enabled: !!currentCompany }
  )

  const activeUsersCount = usersCountResp?.count ?? companyUsers.length

  const defaultBusinessHours = [
    { day: 'Monday', open: '09:00', close: '18:00', closed: false },
    { day: 'Tuesday', open: '09:00', close: '18:00', closed: false },
    { day: 'Wednesday', open: '09:00', close: '18:00', closed: false },
    { day: 'Thursday', open: '09:00', close: '18:00', closed: false },
    { day: 'Friday', open: '09:00', close: '17:00', closed: false },
    { day: 'Saturday', open: '10:00', close: '16:00', closed: false },
    { day: 'Sunday', open: '', close: '', closed: true },
  ]

  const businessHours = companySettings.businessHours || defaultBusinessHours

  const handleSaveSettings = () => {
    // Save settings to backend
    if (!currentCompany?.id) return
    ;(async () => {
      try {
        const res = await api.put(`/companies/${currentCompany.id}`, companySettings)
        const updated = res.data?.company || res.data
        if (updated) setCompanySettings(updated)
        // minimal feedback
        window.alert('Settings saved successfully')
      } catch (err) {
        console.error('Failed to save settings', err)
        window.alert('Failed to save settings')
      }
    })()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your company settings and preferences
          </p>
        </div>
        <Button onClick={handleSaveSettings}>
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        
        <TabsContent value="company" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>
                  Update your company details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input
                    id="company-name"
                    value={companySettings.name || ''}
                    onChange={(e) => setCompanySettings({...companySettings, name: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company-type">Business Type</Label>
                  <Input
                    id="company-type"
                    value={companySettings.type || ''}
                    onChange={(e) => setCompanySettings({...companySettings, type: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company-email">Email</Label>
                    <Input
                      id="company-email"
                      type="email"
                      value={companySettings.email || ''}
                      onChange={(e) => setCompanySettings({...companySettings, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company-phone">Phone</Label>
                    <Input
                      id="company-phone"
                      value={companySettings.phone || ''}
                      onChange={(e) => setCompanySettings({...companySettings, phone: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company-website">Website</Label>
                  <Input
                    id="company-website"
                    value={companySettings.website || ''}
                    onChange={(e) => setCompanySettings({...companySettings, website: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company-address">Address</Label>
                  <Textarea
                    id="company-address"
                    value={companySettings.address || ''}
                    onChange={(e) => setCompanySettings({...companySettings, address: e.target.value})}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Regional Settings</CardTitle>
                <CardDescription>
                  Configure regional preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <select
                    id="currency"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={companySettings.currency || ''}
                    onChange={(e) => setCompanySettings({...companySettings, currency: e.target.value})}
                  >
                    <option value="BDT">Bangladeshi Taka (BDT)</option>
                    <option value="USD">US Dollar (USD)</option>
                    <option value="EUR">Euro (EUR)</option>
                    <option value="GBP">British Pound (GBP)</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <select
                    id="language"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={companySettings.language || ''}
                    onChange={(e) => setCompanySettings({...companySettings, language: e.target.value})}
                  >
                    <option value="English">English</option>
                    <option value="Bangla">Bangla</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <select
                    id="timezone"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={companySettings.timezone || ''}
                    onChange={(e) => setCompanySettings({...companySettings, timezone: e.target.value})}
                  >
                    <option value="Asia/Dhaka">Asia/Dhaka (GMT+6)</option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">America/New York</option>
                    <option value="Europe/London">Europe/London</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="date-format">Date Format</Label>
                  <select
                    id="date-format"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={companySettings.dateFormat || ''}
                    onChange={(e) => setCompanySettings({...companySettings, dateFormat: e.target.value})}
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Business Hours</CardTitle>
              <CardDescription>
                Set your company's operating hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {businessHours.map((schedule) => (
                  <div key={schedule.day} className="flex items-center justify-between">
                    <div className="font-medium">{schedule.day}</div>
                    {schedule.closed ? (
                      <Badge variant="destructive">Closed</Badge>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Input className="w-24" defaultValue={schedule.open || ''} />
                        <span>to</span>
                        <Input className="w-24" defaultValue={schedule.close || ''} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Subscription</CardTitle>
              <CardDescription>
                Manage your subscription plan and billing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="rounded-lg border p-6">
                  {subscriptionLoading ? (
                    <div>Loading subscription...</div>
                  ) : subscription ? (
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-2xl font-bold">{subscription.plan} Plan</h3>
                        <p className="text-muted-foreground">{subscription.price}</p>
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>Workers: {subscription.workers}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                            <span>Payment Method: {subscription.paymentMethod}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                            <span>Renewal Date: {subscription.renewal}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={subscription.status === 'active' ? 'default' : 'destructive'}>
                              {subscription.status}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              Auto-renew: {subscription.autoRenew ? 'On' : 'Off'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline">
                        <CreditCard className="mr-2 h-4 w-4" />
                        Update Payment
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-2xl font-bold">No Active Subscription</h3>
                        <p className="text-muted-foreground">You are currently on the free plan.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button>Choose Plan</Button>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="mb-4 font-semibold">Plan Features</h4>
                  <div className="grid gap-3 md:grid-cols-2">
                    {(subscription?.features || [
                      'Up to 50 workers',
                      'Advanced analytics',
                      'Custom reports',
                      'API access',
                      'Multi-company support',
                      '24/7 priority support',
                      'Data backup & recovery',
                      'Unlimited products',
                    ]).map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                          <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                        </div>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="mb-4 font-semibold">Upgrade Plan</h4>
                  {(() => {
                    const plans = [
                      { key: 'Basic', price: '৳200', range: '1-10 Workers' },
                      { key: 'Standard', price: '৳300', range: '11-20 Workers' },
                      { key: 'Premium', price: '৳500', range: '21-50 Workers' },
                    ]
                    return (
                      <div className="grid gap-4 md:grid-cols-3">
                        {plans.map((p) => {
                          const isCurrent = subscription?.plan === p.key
                          return (
                            <div key={p.key} className={`rounded-lg border p-4 ${isCurrent ? 'border-2 border-primary' : ''}`}>
                              <h5 className="font-medium">{p.key}</h5>
                              <p className="text-2xl font-bold">{p.price}<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                              <p className="text-sm text-muted-foreground">{p.range}</p>
                              <Button size="sm" className="mt-3 w-full" variant={isCurrent ? 'outline' : 'default'}>
                                {isCurrent ? 'Current' : (subscription ? 'Upgrade' : 'Choose')}
                              </Button>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })()}
                </div>

                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                  <h4 className="mb-2 font-medium">Billing Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Next billing date</span>
                      <span className="font-medium">{subscriptionLoading ? 'Loading...' : (subscription?.renewal ?? 'N/A')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Billing cycle</span>
                      <span className="font-medium">Monthly</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment history</span>
                      <Button size="sm" variant="link">
                        View All
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage users and their permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Current Users</h4>
                  <Button size="sm">
                    <Users className="mr-2 h-4 w-4" />
                    Add User
                  </Button>
                </div>

                <div className="rounded-lg border">
                  <div className="grid grid-cols-5 gap-4 p-4 border-b">
                    <div className="font-medium">Name</div>
                    <div className="font-medium">Email</div>
                    <div className="font-medium">Role</div>
                    <div className="font-medium">Status</div>
                    <div className="font-medium">Actions</div>
                  </div>
                  
                  {companyUsers && companyUsers.length > 0 ? (
                    companyUsers.map((user) => {
                      const id = user._id || user.id
                      const name = user.user?.name || user.name || 'User'
                      const email = user.user?.email || user.email || '-'
                      const role = user.role || user.designation || (user.user?.role) || 'Worker'
                      const status = (user.active === false || user.status === 'inactive') ? 'inactive' : 'active'
                      return (
                        <div key={id} className="grid grid-cols-5 gap-4 p-4 border-b last:border-b-0">
                          <div className="font-medium">{name}</div>
                          <div className="text-sm text-muted-foreground">{email}</div>
                          <div>
                            <Badge variant="outline">{role}</Badge>
                          </div>
                          <div>
                            <Badge variant={status === 'active' ? 'default' : 'secondary'}>
                              {status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline">Edit</Button>
                            <Button size="sm" variant="destructive">Remove</Button>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="p-6 text-center text-sm text-muted-foreground">No users found for this company.</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Email Notifications</h4>
                {[
                  { label: 'Sales notifications', description: 'Get notified about new sales', enabled: true },
                  { label: 'Salary alerts', description: 'Salary processing updates', enabled: true },
                  { label: 'Inventory alerts', description: 'Low stock notifications', enabled: false },
                  { label: 'Report generation', description: 'When reports are ready', enabled: true },
                  { label: 'System updates', description: 'Platform updates and news', enabled: true },
                ].map((setting, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{setting.label}</div>
                      <div className="text-sm text-muted-foreground">{setting.description}</div>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked={setting.enabled}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">SMS Notifications</h4>
                {[
                  { label: 'Payment reminders', description: 'Send SMS for due payments', enabled: false },
                  { label: 'Order updates', description: 'Order status updates via SMS', enabled: true },
                  { label: 'Emergency alerts', description: 'Critical system alerts', enabled: true },
                ].map((setting, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{setting.label}</div>
                      <div className="text-sm text-muted-foreground">{setting.description}</div>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked={setting.enabled}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
                <CardDescription>
                  Backup and restore your data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Backup Data</h4>
                      <p className="text-sm text-muted-foreground">
                        Create a backup of all your data
                      </p>
                    </div>
                    <Button variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Backup Now
                    </Button>
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Restore Data</h4>
                      <p className="text-sm text-muted-foreground">
                        Restore from a previous backup
                      </p>
                    </div>
                    <Button variant="outline">
                      <Upload className="mr-2 h-4 w-4" />
                      Restore
                    </Button>
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Export Data</h4>
                      <p className="text-sm text-muted-foreground">
                        Export data in various formats
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">Excel</Button>
                      <Button size="sm" variant="outline">PDF</Button>
                      <Button size="sm" variant="outline">CSV</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
                <CardDescription>
                  Platform details and version information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Platform Version</span>
                    <span className="font-medium">{pkg?.version ? `v${pkg.version}` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Last Updated</span>
                    <span className="font-medium">{companySettings?.updatedAt ? new Date(companySettings.updatedAt).toLocaleDateString() : (companyResp?.company?.updatedAt ? new Date(companyResp.company.updatedAt).toLocaleDateString() : 'N/A')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Database Size</span>
                    <span className="font-medium">{/* not available from API */}N/A</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Active Users</span>
                    <span className="font-medium">{usersCountLoading ? 'Loading...' : (activeUsersCount ?? 'N/A')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Uptime</span>
                    <span className="font-medium">{/* not available from API */}N/A</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Workers</span>
                    <span className="font-medium">{statsLoading ? 'Loading...' : (companyStats?.workers ?? 'N/A')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Products</span>
                    <span className="font-medium">{statsLoading ? 'Loading...' : (companyStats?.products ?? 'N/A')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Today's Sales</span>
                    <span className="font-medium">{statsLoading ? 'Loading...' : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(companyStats?.todaySales || 0)}</span>
                  </div>
                </div>

                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                  <h4 className="mb-2 font-medium">Maintenance</h4>
                  <div className="space-y-2 text-sm">
                    <p className="text-muted-foreground">
                      System maintenance is scheduled for the first Sunday of every month from 2:00 AM to 4:00 AM.
                    </p>
                    <Button size="sm" variant="outline">
                      Schedule Maintenance
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
              <CardDescription>
                Critical actions that cannot be undone
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg border border-red-200 p-4 dark:border-red-900">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-red-600">Reset Company Data</h4>
                      <p className="text-sm text-muted-foreground">
                        Delete all data and start fresh. This action cannot be undone.
                      </p>
                    </div>
                    <Button variant="destructive">Reset Data</Button>
                  </div>
                </div>

                <div className="rounded-lg border border-red-200 p-4 dark:border-red-900">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-red-600">Delete Company</h4>
                      <p className="text-sm text-muted-foreground">
                        Permanently delete your company and all associated data.
                      </p>
                    </div>
                    <Button variant="destructive">Delete Company</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Settings