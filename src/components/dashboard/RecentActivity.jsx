import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { 
  UserPlus, 
  Package, 
  ShoppingCart, 
  DollarSign,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import { formatDate, formatTime } from '../../lib/utils'
import { useQuery } from '@tanstack/react-query'
import api from '../../utils/api'
import { useAuth } from '../../contexts/AuthContext'

const RecentActivity = () => {
  const { currentCompany } = useAuth()

  const { data: ordersRes, isLoading: ordersLoading } = useQuery({
    queryKey: ['recentOrders', currentCompany?.id],
    queryFn: async () => {
      const res = await api.get('/sales/orders', { params: { companyId: currentCompany?.id, limit: 5 } })
      return res.data ? res.data : res
    },
    enabled: !!currentCompany,
  })

  const { data: txRes, isLoading: txLoading } = useQuery({
    queryKey: ['recentTransactions', currentCompany?.id],
    queryFn: async () => {
      const res = await api.get('/payments/transactions', { params: { companyId: currentCompany?.id, limit: 8 } })
      return res.data ? res.data : res
    },
    enabled: !!currentCompany,
  })

  const { data: workersRes, isLoading: workersLoading } = useQuery({
    queryKey: ['recentWorkers', currentCompany?.id],
    queryFn: async () => {
      const res = await api.get('/workers', { params: { companyId: currentCompany?.id, limit: 5 } })
      return res.data ? res.data : res
    },
    enabled: !!currentCompany,
  })

  const orders = ordersRes?.orders || []
  const transactions = txRes?.transactions || []
  const workers = workersRes?.workers || []

  const loading = ordersLoading && txLoading && workersLoading

  const activities = [
    // map workers (new hires)
    ...workers.map(w => ({
      id: `worker-${w._id}`,
      type: 'worker_added',
      user: w.user?.name || 'Unknown',
      action: 'added new worker',
      target: w.user?.name || w.employeeId || 'Worker',
      timestamp: w.createdAt || w.joiningDate || new Date(),
      icon: UserPlus,
      color: 'text-blue-600 dark:text-blue-400'
    })),
    // map recent orders
    ...orders.map(o => ({
      id: `order-${o._id}`,
      type: 'sale_completed',
      user: o.createdBy?.name || o.salesPerson || 'Unknown',
      action: 'completed sale',
      target: o.orderNumber ? `Order #${o.orderNumber}` : (o._id || '').slice(-8),
      amount: o.total ? `৳${o.total.toLocaleString()}` : null,
      timestamp: o.createdAt || o.date || new Date(),
      icon: ShoppingCart,
      color: 'text-green-600 dark:text-green-400'
    })),
    // map transactions (salary or expenses)
    ...transactions.map(t => ({
      id: `tx-${t._id}`,
      type: t.description && t.description.toLowerCase().includes('salary') ? 'salary_paid' : 'transaction',
      user: t.performedBy?.name || t.createdBy?.name || 'System',
      action: t.description || (t.type === 'income' ? 'payment received' : 'payment processed'),
      target: t.reference || '',
      amount: t.amount ? `৳${t.amount.toLocaleString()}` : null,
      timestamp: t.date || t.createdAt || new Date(),
      icon: t.description && t.description.toLowerCase().includes('salary') ? DollarSign : DollarSign,
      color: 'text-amber-600 dark:text-amber-400'
    }))
  ].sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp))

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000)
    
    let interval = seconds / 31536000
    if (interval > 1) {
      return Math.floor(interval) + ' years ago'
    }
    
    interval = seconds / 2592000
    if (interval > 1) {
      return Math.floor(interval) + ' months ago'
    }
    
    interval = seconds / 86400
    if (interval > 1) {
      return Math.floor(interval) + ' days ago'
    }
    
    interval = seconds / 3600
    if (interval > 1) {
      return Math.floor(interval) + ' hours ago'
    }
    
    interval = seconds / 60
    if (interval > 1) {
      return Math.floor(interval) + ' minutes ago'
    }
    
    return 'just now'
  }

  const getStatusBadge = (type, status) => {
    switch (type) {
      case 'product_low_stock':
        return (
          <Badge variant="destructive" className="ml-2">
            Critical
          </Badge>
        )
      case 'attendance_marked':
        return (
          <Badge variant="outline" className="ml-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            Present
          </Badge>
        )
      case 'sale_completed':
        return (
          <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
            Completed
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center p-6">Loading activity...</div>
          ) : activities.length === 0 ? (
            <div className="flex items-center justify-center p-6">No recent activity</div>
          ) : (
            activities.map((activity) => {
              const Icon = activity.icon
              return (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                    <Icon className={`h-4 w-4 ${activity.color}`} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center">
                      <span className="font-medium">{activity.user}</span>
                      <span className="mx-1 text-muted-foreground">
                        {activity.action}
                      </span>
                      <span className="font-medium">{activity.target}</span>
                      {activity.amount && (
                        <span className="ml-1 font-semibold text-green-600 dark:text-green-400">
                          {activity.amount}
                        </span>
                      )}
                      {getStatusBadge(activity.type, activity.status)}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-1 h-3 w-3" />
                      {getTimeAgo(new Date(activity.timestamp))}
                      <span className="mx-2">•</span>
                      {formatDate(activity.timestamp, 'dd MMM yyyy')}
                      <span className="mx-2">•</span>
                      {formatTime(activity.timestamp)}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
        <div className="mt-4 text-center">
          <button className="text-sm font-medium text-primary hover:underline">
            View All Activity →
          </button>
        </div>
      </CardContent>
    </Card>
  )
}

export default RecentActivity