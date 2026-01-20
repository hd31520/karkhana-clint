import { Button } from '../ui/button'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import {
  UserPlus,
  PackagePlus,
  ShoppingCart,
  FileText,
  CreditCard,
  Download,
  Settings,
  Bell,
} from 'lucide-react'

const QuickActions = () => {
  const actions = [
    {
      icon: UserPlus,
      label: 'Add Worker',
      description: 'Add new worker to your team',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      href: '/dashboard/workers',
    },
    {
      icon: PackagePlus,
      label: 'Add Product',
      description: 'Add new product to inventory',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      href: '/dashboard/products',
    },
    {
      icon: ShoppingCart,
      label: 'New Sale',
      description: 'Create new sales order',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
      href: '/dashboard/sales',
    },
    {
      icon: FileText,
      label: 'Generate Report',
      description: 'Create detailed reports',
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-100 dark:bg-amber-900/30',
      href: '/dashboard/reports',
    },
    {
      icon: CreditCard,
      label: 'Pay Salary',
      description: 'Process salary payments',
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
      href: '/dashboard/salary',
    },
    {
      icon: Download,
      label: 'Export Data',
      description: 'Export data to Excel/PDF',
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      href: '/dashboard/settings',
    },
    {
      icon: Settings,
      label: 'Settings',
      description: 'Manage account settings',
      color: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-gray-100 dark:bg-gray-900/30',
      href: '/dashboard/settings',
    },
    {
      icon: Bell,
      label: 'Notifications',
      description: 'View all notifications',
      color: 'text-cyan-600 dark:text-cyan-400',
      bgColor: 'bg-cyan-100 dark:bg-cyan-900/30',
      href: '/dashboard/settings',
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {actions.map((action) => {
            const Icon = action.icon
            return (
              <Button
                key={action.label}
                variant="outline"
                className="h-auto flex-col items-center justify-center p-4"
                asChild
              >
                <Link to={action.href}>
                  <div
                    className={`mb-2 rounded-full p-3 ${action.bgColor}`}
                  >
                    <Icon className={`h-5 w-5 ${action.color}`} />
                  </div>
                  <span className="text-sm font-medium">{action.label}</span>
                  <span className="mt-1 text-xs text-muted-foreground">
                    {action.description}
                  </span>
                </Link>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

export default QuickActions