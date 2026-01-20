import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { 
  Users, 
  DollarSign, 
  Package, 
  TrendingUp, 
  ShoppingCart,
  Calendar,
  AlertCircle
} from 'lucide-react'
import { cn } from '../../lib/utils'

const StatsCards = ({ data = {}, items = null }) => {
  const stats = items || [
    {
      title: 'Total Workers',
      value: data.totalWorkers || 0,
      icon: Users,
      change: null,
      trend: null,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      title: 'Total Sales',
      value: `৳${(data.totalSales || 0).toLocaleString()}`,
      icon: ShoppingCart,
      change: null,
      trend: null,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    },
    {
      title: 'Monthly Salary',
      value: `৳${(data.monthlySalary || 0).toLocaleString()}`,
      icon: DollarSign,
      change: null,
      trend: null,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    },
    {
      title: 'Total Products',
      value: data.totalProducts || 0,
      icon: Package,
      change: null,
      trend: null,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    },
    {
      title: 'Active Orders',
      value: data.activeOrders || 0,
      icon: TrendingUp,
      change: null,
      trend: null,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
    },
    {
      title: 'Today Attendance',
      value: `${data.todayAttendance || 0}%`,
      icon: Calendar,
      change: null,
      trend: null,
      color: 'text-cyan-600 dark:text-cyan-400',
      bgColor: 'bg-cyan-100 dark:bg-cyan-900/30',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <div className={cn('rounded-full p-2', stat.bgColor)}>
              {stat.icon ? <stat.icon className={cn('h-4 w-4', stat.color)} /> : null}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            {stat.change ? (
              <div className="flex items-center text-xs text-muted-foreground">
                <span
                  className={cn(
                    'mr-1 flex items-center',
                    stat.trend === 'up'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  )}
                >
                  {stat.trend === 'up' ? '↗' : '↘'} {stat.change}
                </span>
                from last month
              </div>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default StatsCards