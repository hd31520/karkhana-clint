/**
 * Role-based access control utilities
 * Defines role hierarchy and available roles for each user role
 */

// Role hierarchy - defines what roles can be assigned by each role
export const ROLE_HIERARCHY = {
  'owner': ['manager', 'group_leader', 'sales_executive', 'worker'],
  'manager': ['group_leader', 'sales_executive', 'worker'],
  'group_leader': ['sales_executive', 'worker'],
  'sales_executive': ['worker'],
  'worker': [],
  'admin': ['owner', 'manager', 'group_leader', 'sales_executive', 'worker']
}

// Role levels - for comparing roles
export const ROLE_LEVELS = {
  'owner': 5,
  'manager': 4,
  'group_leader': 3,
  'sales_executive': 2,
  'worker': 1,
  'admin': 10
}

// Role labels for display
export const ROLE_LABELS = {
  'owner': 'Owner',
  'manager': 'Manager',
  'group_leader': 'Group Leader',
  'sales_executive': 'Sales Executive',
  'worker': 'Worker',
  'admin': 'Admin'
}

/**
 * Get allowed roles that a user can assign to others
 * @param {string} userRole - Current user's role
 * @returns {array} Array of roles that can be assigned
 */
export const getAllowedRoles = (userRole) => {
  return ROLE_HIERARCHY[userRole] || []
}

/**
 * Check if a user can assign a specific role
 * @param {string} userRole - Current user's role
 * @param {string} targetRole - Role to be assigned
 * @returns {boolean}
 */
export const canAssignRole = (userRole, targetRole) => {
  if (userRole === 'admin') return true
  const allowed = getAllowedRoles(userRole)
  return allowed.includes(targetRole)
}

/**
 * Check if a user can view/manage a specific role
 * @param {string} userRole - Current user's role
 * @param {string} targetRole - Role to check
 * @returns {boolean}
 */
export const canViewRole = (userRole, targetRole) => {
  const userLevel = ROLE_LEVELS[userRole] || 0
  const targetLevel = ROLE_LEVELS[targetRole] || 0
  
  // Can view roles below their level, and their own level
  return targetLevel <= userLevel
}

/**
 * Get filterable roles - roles that a user can filter/view
 * @param {string} userRole - Current user's role
 * @returns {array} Array of roles that can be viewed
 */
export const getViewableRoles = (userRole) => {
  const userLevel = ROLE_LEVELS[userRole] || 0
  return Object.keys(ROLE_LEVELS).filter(role => {
    const level = ROLE_LEVELS[role]
    return level <= userLevel && role !== 'admin'
  })
}

/**
 * Check if user can add a new worker
 * @param {string} userRole - Current user's role
 * @returns {boolean}
 */
export const canAddWorker = (userRole) => {
  return userRole !== 'worker'
}

/**
 * Check if user can edit worker
 * @param {string} userRole - Current user's role
 * @param {string} workerRole - Worker's role to be edited
 * @returns {boolean}
 */
export const canEditWorker = (userRole, workerRole) => {
  const userLevel = ROLE_LEVELS[userRole] || 0
  const workerLevel = ROLE_LEVELS[workerRole] || 0
  return userRole === 'admin' || workerLevel < userLevel
}

/**
 * Check if user can delete worker
 * @param {string} userRole - Current user's role
 * @param {string} workerRole - Worker's role to be deleted
 * @returns {boolean}
 */
export const canDeleteWorker = (userRole, workerRole) => {
  return canEditWorker(userRole, workerRole)
}

/**
 * Check if user can access a specific page
 * @param {string} userRole - Current user's role
 * @param {string} pageName - Page name (e.g., 'workers', 'roles', 'products')
 * @returns {boolean}
 */
export const canAccessPage = (userRole, pageName) => {
  const pagePermissions = {
    'dashboard': true,
    'company-select': true,
    'workers': userRole !== 'worker',
    'roles': userRole !== 'worker',
    'products': true,
    'inventory': true,
    'due-management': true,
    'sales': true,
    'customers': true,
    'salary': userRole === 'owner' || userRole === 'manager',
    'reports': true,
    'settings': userRole === 'owner' || userRole === 'manager'
  }

  return pagePermissions[pageName] !== false
}

/**
 * Filter workers by viewable roles
 * @param {array} workers - Array of worker objects
 * @param {string} userRole - Current user's role
 * @returns {array} Filtered workers
 */
export const filterWorkersByRole = (workers, userRole) => {
  const viewableRoles = getViewableRoles(userRole)
  return workers.filter(worker => {
    const workerRole = worker.role || 'worker'
    return viewableRoles.includes(workerRole)
  })
}

/**
 * Check if user can access admin pages
 * @param {string} userRole - Current user's role
 * @returns {boolean}
 */
export const canAccessAdmin = (userRole) => {
  return userRole === 'admin'
}

/**
 * Get sidebar navigation items based on user role
 * @param {string} userRole - Current user's role
 * @returns {array} Array of navigation items to display
 */
export const getNavItemsByRole = (userRole) => {
  const baseItems = [
    { to: '/dashboard', label: 'Dashboard', show: true },
    { to: '/dashboard/company-select', label: 'Switch Company', show: true },
  ]

  const conditionalItems = [
    { to: '/dashboard/workers', label: 'Workers', show: userRole !== 'worker' },
    { to: '/dashboard/roles', label: 'Roles', show: userRole !== 'worker' },
    { to: '/dashboard/products', label: 'Products', show: true },
    { to: '/dashboard/inventory', label: 'Inventory', show: true },
    { to: '/dashboard/attendance-system', label: 'Attendance', show: true },
    { to: '/dashboard/due-management', label: 'Due Management', show: true },
    { to: '/dashboard/sales', label: 'Sales', show: true },
    { to: '/dashboard/customers', label: 'Customers', show: true },
    { to: '/dashboard/salary', label: 'Salary', show: userRole === 'owner' || userRole === 'manager' },
    { to: '/dashboard/reports', label: 'Reports', show: true },
    { to: '/dashboard/settings', label: 'Settings', show: userRole === 'owner' || userRole === 'manager' },
  ]

  return [...baseItems, ...conditionalItems].filter(item => item.show)
}
