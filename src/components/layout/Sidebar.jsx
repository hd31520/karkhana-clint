import React, { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  BarChart,
  Settings,
  Home,
  UserCog,
  Building,
  FileText,
  Layers,
  Tag,
  WalletCards,
  X,
} from 'lucide-react'
import { cn } from '../../lib/utils'

const Sidebar = ({ admin = false, mobileOpen = false, setMobileOpen = () => {} }) => {
  const { user } = useAuth()

  const adminNavItems = [
    { to: '/admin', label: 'Dashboard', icon: Home },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/companies', label: 'Companies', icon: Building },
    { to: '/admin/settings', label: 'Settings', icon: Settings },
  ]

  const companyNavItems = [
    { to: '/dashboard', label: 'Dashboard', icon: Home },
    { to: '/dashboard/company-select', label: 'Switch Company', icon: Building },
    { to: '/dashboard/workers', label: 'Workers', icon: Users },
    { to: '/dashboard/roles', label: 'Roles', icon: UserCog },
    { to: '/dashboard/products', label: 'Products', icon: Package },
    { to: '/dashboard/inventory', label: 'Inventory', icon: Layers },
    { to: '/dashboard/sales', label: 'Sales', icon: ShoppingCart },
    { to: '/dashboard/customers', label: 'Customers', icon: Users },
    { to: '/dashboard/salary', label: 'Salary', icon: DollarSign },
    { to: '/dashboard/reports', label: 'Reports', icon: BarChart },
    { to: '/dashboard/settings', label: 'Settings', icon: Settings },
  ]

  const navItems = admin ? adminNavItems : companyNavItems

  // Desktop sidebar
  const desktop = (
    <aside className="hidden border-r bg-white dark:bg-gray-900 md:block md:w-64 lg:w-72">
      <div className="flex h-full flex-col">
        <div className="border-b p-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Building className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Karkhana.shop</h2>
              <p className="text-xs text-muted-foreground">
                {admin ? 'Admin Panel' : user?.company?.name || 'Company'}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-auto p-4">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-gray-100 dark:hover:bg-gray-800',
                      isActive
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'text-muted-foreground hover:text-foreground'
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              )
            })}
          </div>

          {!admin && (
            <div className="mt-8">
              <h3 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                Quick Actions
              </h3>
              <div className="space-y-1">
                <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all hover:bg-gray-100 hover:text-foreground dark:hover:bg-gray-800">
                  <Tag className="h-4 w-4" />
                  New Sale
                </button>
                <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all hover:bg-gray-100 hover:text-foreground dark:hover:bg-gray-800">
                  <FileText className="h-4 w-4" />
                  Generate Report
                </button>
                <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all hover:bg-gray-100 hover:text-foreground dark:hover:bg-gray-800">
                  <WalletCards className="h-4 w-4" />
                  Pay Salary
                </button>
              </div>
            </div>
          )}

          <div className="border-t p-4">
            <div className="text-xs text-muted-foreground">
              <p>© {new Date().getFullYear()} Karkhana.shop</p>
              <p className="mt-1">v1.0.0</p>
            </div>
          </div>
        </nav>
      </div>
    </aside>
  )

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.classList.add('overflow-hidden')
    } else {
      document.body.classList.remove('overflow-hidden')
    }
    return () => document.body.classList.remove('overflow-hidden')
  }, [mobileOpen])

  // Mobile drawer with slide animation
  const mobile = (
    <div
      aria-hidden={!mobileOpen}
      role="dialog"
      aria-modal={mobileOpen}
      className={cn('fixed inset-0 z-60 md:hidden', mobileOpen ? 'block' : 'pointer-events-none')}
    >
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-black/40 transition-opacity duration-300',
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setMobileOpen(false)}
      />

      {/* Sliding panel */}
      <div
        className={cn(
          'fixed left-0 top-0 bottom-0 w-72 h-full bg-white dark:bg-gray-900 shadow-lg overflow-auto transform transition-transform duration-300 z-60',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Building className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Karkhana.shop</h2>
                <p className="text-xs text-muted-foreground">{user?.company?.name || 'Company'}</p>
              </div>
            </div>
            <button
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <nav className="p-4">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-gray-100 dark:hover:bg-gray-800',
                      isActive
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'text-muted-foreground hover:text-foreground'
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
  )

  return (
    <>
      {desktop}
      {mobile}
    </>
  )
}

export default Sidebar
