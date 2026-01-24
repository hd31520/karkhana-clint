import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Badge } from '../../components/ui/badge'
import { 
  Building,
  Building2,
  Search,
  Filter,
  Download,
  MoreVertical,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Eye,
  Edit,
  Trash2,
  Mail,
  Phone,
  Calendar,
  Check,
  X,
  AlertCircle
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar'
import { Textarea } from '../../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'

const AdminCompanies = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCompany, setSelectedCompany] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  
  const companies = [
    {
      id: 1,
      name: 'Karim Furniture',
      type: 'Wood Factory',
      owner: 'Abdul Karim',
      email: 'karim@example.com',
      phone: '+8801712345678',
      workers: 25,
      plan: 'Premium',
      revenue: '৳1,250,000',
      status: 'active',
      joinDate: '2023-01-15',
      address: '123 Factory Road, Dhaka',
      subscription: {
        plan: 'Premium',
        price: '৳500/month',
        nextBilling: '2024-01-15',
        paymentMethod: 'Bank Transfer',
        status: 'active'
      },
      stats: {
        totalSales: 456,
        activeOrders: 12,
        inventoryItems: 125,
        pendingPayments: '৳25,000'
      }
    },
    {
      id: 2,
      name: 'Textile Mart',
      type: 'Textile Shop',
      owner: 'Fatima Begum',
      email: 'fatima@example.com',
      phone: '+8801812345678',
      workers: 12,
      plan: 'Standard',
      revenue: '৳850,000',
      status: 'active',
      joinDate: '2023-02-20',
      address: '456 Market Street, Chittagong',
      subscription: {
        plan: 'Standard',
        price: '৳300/month',
        nextBilling: '2024-02-20',
        paymentMethod: 'Credit Card',
        status: 'active'
      },
      stats: {
        totalSales: 312,
        activeOrders: 8,
        inventoryItems: 89,
        pendingPayments: '৳15,000'
      }
    },
    {
      id: 3,
      name: 'Metal Works Inc',
      type: 'Iron Factory',
      owner: 'Kamal Hossain',
      email: 'kamal@example.com',
      phone: '+8801912345678',
      workers: 8,
      plan: 'Basic',
      revenue: '৳650,000',
      status: 'active',
      joinDate: '2023-03-10',
      address: '789 Industrial Zone, Narayanganj',
      subscription: {
        plan: 'Basic',
        price: '৳200/month',
        nextBilling: '2024-03-10',
        paymentMethod: 'Mobile Banking',
        status: 'active'
      },
      stats: {
        totalSales: 234,
        activeOrders: 5,
        inventoryItems: 67,
        pendingPayments: '৳10,000'
      }
    },
    {
      id: 4,
      name: 'Food Processing',
      type: 'Food Factory',
      owner: 'Raju Ahmed',
      email: 'raju@example.com',
      phone: '+8801612345678',
      workers: 18,
      plan: 'Premium',
      revenue: '৳950,000',
      status: 'pending',
      joinDate: '2023-04-05',
      address: '101 Food Street, Gazipur',
      subscription: {
        plan: 'Premium',
        price: '৳500/month',
        nextBilling: '2024-04-05',
        paymentMethod: 'Pending',
        status: 'pending'
      },
      stats: {
        totalSales: 189,
        activeOrders: 15,
        inventoryItems: 92,
        pendingPayments: '৳35,000'
      }
    },
    {
      id: 5,
      name: 'Plastic Products',
      type: 'Plastic Factory',
      owner: 'Sharmin Akter',
      email: 'sharmin@example.com',
      phone: '+8801512345678',
      workers: 6,
      plan: 'Basic',
      revenue: '৳450,000',
      status: 'suspended',
      joinDate: '2023-05-12',
      address: '222 Plastic Road, Savar',
      subscription: {
        plan: 'Basic',
        price: '৳200/month',
        nextBilling: '2024-05-12',
        paymentMethod: 'Bank Transfer',
        status: 'suspended'
      },
      stats: {
        totalSales: 156,
        activeOrders: 3,
        inventoryItems: 45,
        pendingPayments: '৳8,000'
      }
    },
    {
      id: 6,
      name: 'Chemical Factory',
      type: 'Chemical',
      owner: 'Abdul Malik',
      email: 'malik@example.com',
      phone: '+8801412345678',
      workers: 15,
      plan: 'Standard',
      revenue: '৳750,000',
      status: 'active',
      joinDate: '2023-06-08',
      address: '333 Chemical Zone, Tongi',
      subscription: {
        plan: 'Standard',
        price: '৳300/month',
        nextBilling: '2024-06-08',
        paymentMethod: 'Credit Card',
        status: 'active'
      },
      stats: {
        totalSales: 278,
        activeOrders: 10,
        inventoryItems: 78,
        pendingPayments: '৳18,000'
      }
    },
  ]

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getPlanColor = (plan) => {
    const colors = {
      'Premium': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'Standard': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'Basic': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    }
    return colors[plan] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }

  const getStatusColor = (status) => {
    const colors = {
      'active': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'pending': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
      'suspended': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    }
    return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }

  const handleViewDetails = (company) => {
    setSelectedCompany(company)
    setIsDialogOpen(true)
  }

  const handleUpdateStatus = (companyId, newStatus) => {
    // Here you would typically make an API call
    console.log(`Updating company ${companyId} status to ${newStatus}`)
    alert(`Company status updated to ${newStatus}`)
  }

  const handleSendEmail = (company) => {
    window.open(`mailto:${company.email}?subject=Karkhana.shop Support`, '_blank')
  }

  const handleExportData = () => {
    // Here you would typically generate and download CSV/Excel
    console.log('Exporting company data...')
    alert('Exporting company data...')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Company Management</h1>
          <p className="text-muted-foreground">
            Manage all companies on the platform
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleExportData}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => handleViewDetails({})}>
            <Building2 className="mr-2 h-4 w-4" />
            Add Company
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
              +8 this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Companies</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">148</div>
            <p className="text-xs text-muted-foreground">
              94.9% active rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Workers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,485</div>
            <p className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
              +156 this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳78,500</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Companies</CardTitle>
              <CardDescription>
                Manage company accounts and subscriptions
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search companies..."
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
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Workers</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompanies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {(company.name || '').split(' ').map(n => n[0]).join('') || 'C'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{company.name || 'Unnamed Company'}</div>
                          <div className="text-sm text-muted-foreground">
                            ID: COMP-{company.id.toString().padStart(3, '0')}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{company.type}</TableCell>
                    <TableCell className="font-medium">{company.owner}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {company.workers}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPlanColor(company.plan)}>
                        {company.plan}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{company.revenue}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(company.status)}>
                        {company.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{company.joinDate}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleViewDetails(company)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSendEmail(company)}>
                            <Mail className="mr-2 h-4 w-4" />
                            Send Email
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {company.status === 'active' ? (
                            <DropdownMenuItem onClick={() => handleUpdateStatus(company.id, 'suspended')}>
                              <X className="mr-2 h-4 w-4" />
                              Suspend Account
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleUpdateStatus(company.id, 'active')}>
                              <Check className="mr-2 h-4 w-4" />
                              Activate Account
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Company
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Company Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedCompany && selectedCompany.id ? (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle>{selectedCompany.name}</DialogTitle>
                    <DialogDescription>
                      ID: COMP-{selectedCompany.id.toString().padStart(3, '0')}
                    </DialogDescription>
                  </div>
                  <Badge className={getStatusColor(selectedCompany.status)}>
                    {selectedCompany.status}
                  </Badge>
                </div>
              </DialogHeader>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="subscription">Subscription</TabsTrigger>
                  <TabsTrigger value="stats">Statistics</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Company Information</Label>
                      <div className="rounded-lg border p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Company Name:</span>
                            <span className="font-medium">{selectedCompany.name}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Business Type:</span>
                            <span>{selectedCompany.type}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Address:</span>
                            <span className="text-right">{selectedCompany.address}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Owner Information</Label>
                      <div className="rounded-lg border p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Owner Name:</span>
                            <span className="font-medium">{selectedCompany.owner}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Email:</span>
                            <div className="flex items-center gap-2">
                              <Mail className="h-3 w-3" />
                              <span>{selectedCompany.email}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Phone:</span>
                            <div className="flex items-center gap-2">
                              <Phone className="h-3 w-3" />
                              <span>{selectedCompany.phone}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Quick Stats</Label>
                    <div className="grid gap-3 md:grid-cols-4">
                      <Card>
                        <CardContent className="pt-6 text-center">
                          <div className="text-2xl font-bold">{selectedCompany.workers}</div>
                          <div className="text-sm text-muted-foreground">Workers</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6 text-center">
                          <div className="text-2xl font-bold">{selectedCompany.stats.totalSales}</div>
                          <div className="text-sm text-muted-foreground">Total Sales</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6 text-center">
                          <div className="text-2xl font-bold">{selectedCompany.stats.inventoryItems}</div>
                          <div className="text-sm text-muted-foreground">Products</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6 text-center">
                          <div className="text-2xl font-bold">{selectedCompany.revenue}</div>
                          <div className="text-sm text-muted-foreground">Revenue</div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="subscription" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Subscription Details</Label>
                    <div className="rounded-lg border p-4">
                      <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Plan:</span>
                              <Badge className={getPlanColor(selectedCompany.subscription.plan)}>
                                {selectedCompany.subscription.plan}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Price:</span>
                              <span className="font-medium">{selectedCompany.subscription.price}</span>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Next Billing:</span>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-3 w-3" />
                                <span>{selectedCompany.subscription.nextBilling}</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Payment Method:</span>
                              <span>{selectedCompany.subscription.paymentMethod}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Subscription Status:</span>
                          <Badge className={getStatusColor(selectedCompany.subscription.status)}>
                            {selectedCompany.subscription.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Change Subscription Plan</Label>
                    <div className="flex items-center gap-3">
                      <Select defaultValue={selectedCompany.subscription.plan.toLowerCase()}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select plan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="basic">Basic (৳200/month)</SelectItem>
                          <SelectItem value="standard">Standard (৳300/month)</SelectItem>
                          <SelectItem value="premium">Premium (৳500/month)</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button>Update Plan</Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="stats" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Company Statistics</Label>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Sales Overview</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Total Sales:</span>
                              <span className="font-medium">{selectedCompany.stats.totalSales}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Active Orders:</span>
                              <span className="font-medium">{selectedCompany.stats.activeOrders}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Pending Payments:</span>
                              <span className="font-medium text-amber-600">{selectedCompany.stats.pendingPayments}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Inventory Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Total Products:</span>
                              <span className="font-medium">{selectedCompany.stats.inventoryItems}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Low Stock Items:</span>
                              <span className="font-medium text-red-600">12</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Out of Stock:</span>
                              <span className="font-medium text-red-600">3</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="settings" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Account Settings</Label>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="status">Account Status</Label>
                        <Select defaultValue={selectedCompany.status}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="suspended">Suspended</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="notes">Admin Notes</Label>
                        <Textarea
                          id="notes"
                          placeholder="Add notes about this company..."
                          rows={4}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="support">Support Level</Label>
                        <Select defaultValue="standard">
                          <SelectTrigger>
                            <SelectValue placeholder="Select support level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="basic">Basic Support</SelectItem>
                            <SelectItem value="standard">Standard Support</SelectItem>
                            <SelectItem value="priority">Priority Support</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Close
                </Button>
                <Button>Save Changes</Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Add New Company</DialogTitle>
                <DialogDescription>
                  Register a new company on the platform
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Company Name *</Label>
                    <Input id="company-name" placeholder="Enter company name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company-type">Business Type *</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="factory">Factory</SelectItem>
                        <SelectItem value="shop">Shop</SelectItem>
                        <SelectItem value="showroom">Showroom</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="owner-name">Owner Name *</Label>
                  <Input id="owner-name" placeholder="Enter owner's name" />
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" type="email" placeholder="owner@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone *</Label>
                    <Input id="phone" placeholder="+8801XXXXXXXXX" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" placeholder="Enter company address" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="initial-plan">Initial Subscription Plan</Label>
                  <Select defaultValue="basic">
                    <SelectTrigger>
                      <SelectValue placeholder="Select plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic (৳200/month)</SelectItem>
                      <SelectItem value="standard">Standard (৳300/month)</SelectItem>
                      <SelectItem value="premium">Premium (৳500/month)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button>Create Company</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AdminCompanies