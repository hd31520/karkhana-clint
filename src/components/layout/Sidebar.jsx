import React, { useEffect, useState, useMemo } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { getNavigation } from '../../services/navigationService'
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
  Menu,
} from 'lucide-react'
import { cn } from '../../lib/utils'

// Icon mapping for dynamic icons
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
}

const Sidebar = ({ admin = false, mobileOpen, setMobileOpen }) => {
  const { user, currentCompany } = useAuth()
  const navigate = useNavigate()
  const [isMobile, setIsMobile] = useState(false)

  // Admin navigation (static)
  const adminNavItems = useMemo(() => [
    { to: '/admin', label: 'Dashboard', icon: Home },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/companies', label: 'Companies', icon: Building },
    { to: '/admin/settings', label: 'Settings', icon: Settings },
  ], [])

  // All default dashboard routes
  const allDashboardRoutes = useMemo(() => [
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
  ], [])

  // Check for mobile on mount and resize
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkIfMobile()
    window.addEventListener('resize', checkIfMobile)

    return () => {
      window.removeEventListener('resize', checkIfMobile)
    }
  }, [])

  // Fetch navigation for company users - but DON'T wait for it to show routes
  const companyId = currentCompany?._id || currentCompany?.id
  const { data: navigationData } = useQuery({
    queryKey: ['navigation', companyId],
    queryFn: () => getNavigation(companyId),
    enabled: !admin && !!user && !!companyId,
    refetchOnWindowFocus: false,
    // Don't refetch too often
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Process navigation items - SIMPLIFIED: Always show all routes first
  const { navItems, quickActions } = useMemo(() => {
    console.log('=== SIDEBAR NAVIGATION DEBUG ===')
    console.log('Admin mode:', admin)
    console.log('Current company:', currentCompany)
    console.log('Company ID:', companyId)
    console.log('Navigation API data:', navigationData)
    console.log('Navigation items from API:', navigationData?.navigation?.items)
    console.log('API items length:', navigationData?.navigation?.items?.length || 0)

    if (admin) {
      console.log('Using admin navigation')
      return {
        navItems: adminNavItems,
        quickActions: []
      }
    }

    // START WITH ALL DEFAULT ROUTES
    let finalNavItems = [...allDashboardRoutes]
    
    // If API returns valid navigation items, MERGE them with defaults
    // But only replace if API returns meaningful data (not empty)
    const apiItems = navigationData?.navigation?.items
    if (apiItems && Array.isArray(apiItems) && apiItems.length > 0) {
      console.log('API returned navigation items, using them')
      const customItems = apiItems.map(item => ({
        ...item,
        icon: iconMap[item.icon] || Home
      }))
      // Use API items INSTEAD of defaults
      finalNavItems = customItems
    } else {
      console.log('Using default navigation items')
    }

    console.log('Final navigation items count:', finalNavItems.length)
    console.log('Final navigation items:', finalNavItems)

    // Get quick actions from API if available
    const apiQuickActions = navigationData?.navigation?.quickActions?.map(action => ({
      ...action,
      icon: iconMap[action.icon] || Tag
    })) || []

    return {
      navItems: finalNavItems,
      quickActions: apiQuickActions
    }
  }, [admin, currentCompany, navigationData, adminNavItems, allDashboardRoutes, companyId])

  // Handle quick action clicks
  const handleQuickAction = (action) => {
    if (action.to) {
      navigate(action.to)
      setMobileOpen(false)
    }
  }

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.classList.add('overflow-hidden')
    } else {
      document.body.classList.remove('overflow-hidden')
    }
    return () => document.body.classList.remove('overflow-hidden')
  }, [mobileOpen])

  // Mobile menu button
  const MobileMenuButton = () => (
    <button
      className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-primary text-white shadow-lg"
      onClick={() => setMobileOpen(true)}
      aria-label="Open menu"
    >
      <Menu className="h-5 w-5" />
    </button>
  )

  // Desktop sidebar
  const DesktopSidebar = () => (
    <aside className="hidden md:block border-r bg-white dark:bg-gray-900 w-64 lg:w-72">
      <div className="flex h-full flex-col">
        <div className="border-b p-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Building className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Karkhana.shop</h2>
              <p className="text-xs text-muted-foreground">
                {admin ? 'Admin Panel' : currentCompany?.name || user?.company?.name || 'Company'}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-auto p-4">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon || Home
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
                      <Icon className="h-4 w-4" />
                      {action.label}
                    </button>
                  )
                })}
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

  // Mobile drawer
  const MobileDrawer = () => (
    <div
      aria-hidden={!mobileOpen}
      role="dialog"
      aria-modal={mobileOpen}
      className={cn('fixed inset-0 z-50 md:hidden', mobileOpen ? 'block' : 'pointer-events-none')}
    >
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-black/50 transition-opacity duration-300',
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setMobileOpen(false)}
      />

      {/* Sliding panel */}
      <div
        className={cn(
          'fixed left-0 top-0 bottom-0 w-72 h-full bg-white dark:bg-gray-900 shadow-lg overflow-auto transform transition-transform duration-300 ease-in-out',
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
                <p className="text-xs text-muted-foreground">
                  {currentCompany?.name || user?.company?.name || 'Company'}
                </p>
              </div>
            </div>
            <button
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
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
              const Icon = item.icon || Home
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
                      <Icon className="h-4 w-4" />
                      {action.label}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <div className="border-t mt-8 pt-4">
            <div className="text-xs text-muted-foreground">
              <p>© {new Date().getFullYear()} Karkhana.shop</p>
              <p className="mt-1">v1.0.0</p>
            </div>
          </div>
        </nav>
      </div>
    </div>
  )

  return (
    <>
      {isMobile && <MobileMenuButton />}
      <DesktopSidebar />
      <MobileDrawer />
    </>
  )
}

export default Sidebar