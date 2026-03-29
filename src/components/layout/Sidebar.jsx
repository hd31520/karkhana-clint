import React, { useEffect, useMemo } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { getNavigation } from '../../services/navigationService'
import { getNavItemsByRole } from '../../lib/roleUtils'
import {
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  BarChart,
  Settings,
  Calendar,
  Home,
  UserCog,
  Building,
  FileText,
  Layers,
  Tag,
  WalletCards,
  ReceiptText,
  X,
} from 'lucide-react'
import { cn } from '../../lib/utils'

const iconMap = {
  Home,
  Users,
  Building,
  Settings,
  UserCog,
  Package,
  Layers,
  ShoppingCart,
  DollarSign,
  BarChart,
  Tag,
  FileText,
  WalletCards,
  ReceiptText,
  Calendar,
}

const Sidebar = ({ admin = false, mobileOpen, setMobileOpen }) => {
  const { user, currentCompany } = useAuth()
  const navigate = useNavigate()

  const adminNavItems = useMemo(() => [
    { to: '/admin', label: 'Dashboard', icon: Home },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/companies', label: 'Companies', icon: Building },
    { to: '/admin/settings', label: 'Settings', icon: Settings },
  ], [])

  const companyId = currentCompany?._id || currentCompany?.id

  useQuery({
    queryKey: ['navigation', companyId],
    queryFn: () => getNavigation(companyId),
    enabled: !admin && !!user && !!companyId,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  })

  const { navItems, quickActions } = useMemo(() => {
    if (admin) {
      return {
        navItems: adminNavItems,
        quickActions: []
      }
    }

    const roleBasedItems = getNavItemsByRole(user?.role || 'worker').map(item => ({
      ...item,
      icon: iconMap[item.icon] ||
        (item.to.includes('dashboard') && item.label === 'Dashboard' ? Home :
         item.to.includes('workers') ? Users :
         item.to.includes('roles') ? UserCog :
         item.to.includes('company-select') ? Building :
         item.to.includes('products') ? Package :
         item.to.includes('inventory') ? Layers :
         item.to.includes('attendance') ? Calendar :
         item.to.includes('due-management') ? ReceiptText :
         item.to.includes('sales') ? ShoppingCart :
         item.to.includes('customers') ? Users :
         item.to.includes('salary') ? DollarSign :
         item.to.includes('reports') ? BarChart :
         item.to.includes('settings') ? Settings :
         Home)
    }))

    return {
      navItems: roleBasedItems,
      quickActions: []
    }
  }, [admin, adminNavItems, user?.role])

  useEffect(() => {
    if (mobileOpen) {
      document.body.classList.add('overflow-hidden')
    } else {
      document.body.classList.remove('overflow-hidden')
    }

    return () => document.body.classList.remove('overflow-hidden')
  }, [mobileOpen])

  const handleQuickAction = (action) => {
    if (action.to) {
      navigate(action.to)
      setMobileOpen(false)
    }
  }

  const renderLinks = (isMobile = false) => (
    <>
      <div className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon || Home
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => isMobile && setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-gray-100 dark:hover:bg-gray-800',
                  isActive
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'text-muted-foreground hover:text-foreground'
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          )
        })}
      </div>

      {!admin && quickActions.length > 0 && (
        <div className="mt-8">
          <h3 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
            Quick Actions
          </h3>
          <div className="space-y-1">
            {quickActions.map((action) => {
              const Icon = action.icon || Tag
              return (
                <button
                  key={action.label}
                  onClick={() => handleQuickAction(action)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all hover:bg-gray-100 hover:text-foreground dark:hover:bg-gray-800"
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{action.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </>
  )

  return (
    <>
      <aside className="hidden shrink-0 border-r bg-white dark:bg-gray-900 md:block md:w-64 lg:w-72">
        <div className="flex h-full flex-col">
          <div className="border-b p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Building className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-lg font-semibold">Karkhana.shop</h2>
                <p className="truncate text-xs text-muted-foreground">
                  {admin ? 'Admin Panel' : currentCompany?.name || user?.company?.name || 'Company'}
                </p>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-auto p-4">
            {renderLinks()}
          </nav>

          <div className="border-t p-4">
            <div className="text-xs text-muted-foreground">
              <p>© {new Date().getFullYear()} Karkhana.shop</p>
              <p className="mt-1">v1.0.0</p>
            </div>
          </div>
        </div>
      </aside>

      <div
        aria-hidden={!mobileOpen}
        role="dialog"
        aria-modal={mobileOpen}
        className={cn('fixed inset-0 z-50 md:hidden', mobileOpen ? 'block' : 'pointer-events-none')}
      >
        <div
          className={cn(
            'fixed inset-0 bg-black/50 transition-opacity duration-300',
            mobileOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
          )}
          onClick={() => setMobileOpen(false)}
        />

        <div
          className={cn(
            'fixed left-0 top-0 bottom-0 h-full w-[85vw] max-w-xs overflow-auto bg-white shadow-lg transition-transform duration-300 ease-in-out dark:bg-gray-900',
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="border-b p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <Building className="h-5 w-5 text-white" />
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-semibold">Karkhana.shop</h2>
                  <p className="truncate text-xs text-muted-foreground">
                    {currentCompany?.name || user?.company?.name || 'Company'}
                  </p>
                </div>
              </div>
              <button
                className="rounded-md p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <nav className="p-4">
            {renderLinks(true)}

            <div className="mt-8 border-t pt-4">
              <div className="text-xs text-muted-foreground">
                <p>© {new Date().getFullYear()} Karkhana.shop</p>
                <p className="mt-1">v1.0.0</p>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </>
  )
}

export default Sidebar
