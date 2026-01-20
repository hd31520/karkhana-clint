import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../../utils/api'
import { useAuth } from '../../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { formatDate } from '../../lib/utils'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Badge } from '../../components/ui/badge'
import { 
  UserCog,
  UserPlus,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Users,
  CheckCircle,
  XCircle
} from 'lucide-react'
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
  DialogTrigger,
} from '../../components/ui/dialog'

const Roles = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const { currentCompany } = useAuth()

  const { data, isLoading, error } = useQuery({
    queryKey: ['roles', currentCompany?.id],
    queryFn: () => api.get('/roles', { params: { companyId: currentCompany?.id } }),
    enabled: !!currentCompany,
  })

  const roles = data?.roles || []

  const { data: usersCountData } = useQuery({
    queryKey: ['company-users-count', currentCompany?.id],
    queryFn: () => api.get(`/companies/${currentCompany?.id}/users-count`),
    enabled: !!currentCompany?.id,
  })

  const activeUsersCount = usersCountData?.count ?? 0

  const permissionModuleMap = {
    Company: 'settings',
    Workers: 'workers',
    Salary: 'salary',
    Sales: 'sales',
    Inventory: 'inventory',
    Reports: 'reports',
    Settings: 'settings',
    Products: 'products',
    Customers: 'customers'
  }

  const countPermissions = (permObj) => {
    if (!permObj) return 0
    return Object.values(permObj).reduce((sum, v) => {
      if (v && typeof v === 'object') {
        // nested object (module) - count truthy fields
        return sum + Object.values(v).filter(Boolean).length
      }
      return sum
    }, 0)
  }

  const [permissions] = useState([
    { module: 'Company', actions: ['read', 'update'] },
    { module: 'Workers', actions: ['create', 'read', 'update', 'delete'] },
    { module: 'Salary', actions: ['calculate', 'pay', 'read'] },
    { module: 'Sales', actions: ['create', 'read', 'update', 'delete'] },
    { module: 'Inventory', actions: ['create', 'read', 'update', 'delete'] },
    { module: 'Reports', actions: ['generate', 'read', 'export'] },
    { module: 'Settings', actions: ['update', 'role:manage', 'user:manage'] },
  ])

  const filteredRoles = roles.filter(role =>
    (role.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (role.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Role Management</h1>
          <p className="text-muted-foreground">
            Define roles and permissions for your team members
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Create Role
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Create New Role</DialogTitle>
              <DialogDescription>
                Define a new role with specific permissions
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-6 py-4">
              <div className="grid gap-3">
                <Label htmlFor="role-name">Role Name</Label>
                <Input id="role-name" placeholder="e.g., Quality Manager" />
              </div>
              
              <div className="grid gap-3">
                <Label htmlFor="role-description">Description</Label>
                <Input id="role-description" placeholder="Brief description of the role" />
              </div>
              
              <div>
                <Label className="mb-4 block">Permissions</Label>
                <div className="space-y-4">
                  {permissions.map((permission) => (
                    <div key={permission.module} className="rounded-lg border p-4">
                      <div className="mb-3 font-medium">{permission.module}</div>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {['create', 'read', 'update', 'delete'].map((action) => (
                          <div key={action} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`${permission.module}-${action}`}
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <Label
                              htmlFor={`${permission.module}-${action}`}
                              className="text-sm font-normal capitalize"
                            >
                              {action}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button>Create Role</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
            <UserCog className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roles.length}</div>
            <p className="text-xs text-muted-foreground">
              {roles.filter(r => r.isDefault).length} default roles
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeUsersCount}</div>
            <p className="text-xs text-muted-foreground">
              Across all roles
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custom Roles</CardTitle>
            <UserCog className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roles.filter(r => !r.isDefault).length}</div>
            <p className="text-xs text-muted-foreground">
              User-defined roles
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Roles</CardTitle>
              <CardDescription>
                Manage roles and their permissions
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search roles..."
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
                <TableHead>Role Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRoles.map((role) => (
                <TableRow key={role._id || role.id}>
                  <TableCell>
                    <div className="font-medium">{role.name}</div>
                    {role.isDefault && (
                      <Badge className="mt-1" variant="secondary">
                        Default
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="max-w-md text-sm text-muted-foreground">
                      {role.description}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{role.users}</span>
                      <span className="text-sm text-muted-foreground">users</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-medium">{countPermissions(role.permissions)}</span>
                      <span className="text-sm text-muted-foreground">permissions</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={role.isDefault ? 'default' : 'outline'}>
                      {role.isDefault ? 'System' : 'Custom'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {role.createdAt ? formatDate(role.createdAt, 'dd MMM yyyy') : '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      {!role.isDefault && (
                        <Button size="sm" variant="outline" className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredRoles.length === 0 && (
            <div className="py-12 text-center">
              <UserCog className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No roles found</h3>
              <p className="mt-2 text-muted-foreground">
                No roles match your search criteria.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Permission Matrix</CardTitle>
            <CardDescription>
              Overview of permissions by role
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left text-sm font-medium">Permission</th>
                    {roles.slice(0, 4).map((role) => (
                      <th key={role.id} className="px-4 py-3 text-center text-sm font-medium">
                        {role.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {permissions.map((permission) => (
                    <tr key={permission.module} className="border-b">
                      <td className="px-4 py-3 text-sm font-medium">
                        {permission.module}
                      </td>
                          {roles.slice(0, 4).map((role) => {
                            const key = permissionModuleMap[permission.module] || permission.module.toLowerCase()
                            const perms = role.permissions?.[key] || {}
                            const hasAny = Object.values(perms).some(Boolean)
                            return (
                              <td key={role._id || role.id} className="px-4 py-3 text-center">
                                {hasAny ? (
                                  <CheckCircle className="mx-auto h-5 w-5 text-green-600" />
                                ) : (
                                  <XCircle className="mx-auto h-5 w-5 text-red-600" />
                                )}
                              </td>
                            )
                          })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Role Usage Statistics</CardTitle>
            <CardDescription>
              Distribution of users across roles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {roles.map((role) => (
                <div key={role.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{role.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {role.users} users
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${(role.users / (activeUsersCount || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
              <h4 className="mb-2 font-medium">Tips</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Default roles cannot be deleted</li>
                <li>• Custom roles can be modified as needed</li>
                <li>• Assign permissions based on job requirements</li>
                <li>• Regularly review role assignments</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Roles