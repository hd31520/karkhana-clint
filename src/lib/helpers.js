import { formatDate, formatCurrency, truncateText } from './formatters'

// Get status color
export const getStatusColor = (status) => {
  const colors = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    unpaid: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  }
  
  return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
}

// Get user initials
export const getUserInitials = (name) => {
  if (!name) return 'U'
  
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Generate avatar color based on name
export const getAvatarColor = (name) => {
  if (!name) return '#6B7280'
  
  const colors = [
    '#EF4444', // red
    '#F59E0B', // amber
    '#10B981', // emerald
    '#3B82F6', // blue
    '#8B5CF6', // violet
    '#EC4899', // pink
    '#059669', // emerald-600
    '#DC2626', // red-600
    '#EA580C', // orange-600
    '#CA8A04', // yellow-600
  ]
  
  const index = name
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
  
  return colors[index]
}

// Calculate age from birth date
export const calculateAge = (birthDate) => {
  if (!birthDate) return null
  
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  
  return age
}

// Format duration
export const formatDuration = (minutes) => {
  if (!minutes) return '0m'
  
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (hours > 0) {
    return `${hours}h ${mins}m`
  }
  
  return `${mins}m`
}

// Calculate overtime
export const calculateOvertime = (totalHours, regularHours = 8) => {
  if (totalHours <= regularHours) return 0
  return totalHours - regularHours
}

// Calculate salary
export const calculateSalary = (baseSalary, daysWorked, totalDays, overtimeHours, overtimeRate) => {
  const dailySalary = baseSalary / totalDays
  const regularSalary = dailySalary * daysWorked
  const overtimeSalary = overtimeHours * overtimeRate
  
  return regularSalary + overtimeSalary
}

// Get month name
export const getMonthName = (monthNumber) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  
  return months[monthNumber - 1] || ''
}

// Get current financial year
export const getFinancialYear = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  
  if (month >= 7) {
    return `${year}-${year + 1}`
  }
  
  return `${year - 1}-${year}`
}

// Generate unique ID
export const generateUniqueId = (prefix = '') => {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substr(2, 9)
  return `${prefix}${timestamp}${random}`.toUpperCase()
}

// Deep clone object
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj))
}

// Merge objects
export const mergeObjects = (target, source) => {
  return { ...target, ...source }
}

// Check if object is empty
export const isEmpty = (obj) => {
  return Object.keys(obj).length === 0
}

// Debounce function
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Throttle function
export const throttle = (func, limit) => {
  let inThrottle
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Parse query string
export const parseQueryString = (queryString) => {
  const params = new URLSearchParams(queryString)
  const result = {}
  
  for (const [key, value] of params) {
    result[key] = value
  }
  
  return result
}

// Build query string
export const buildQueryString = (params) => {
  const searchParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value)
    }
  })
  
  return searchParams.toString()
}

// Format bytes
export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

// Generate random color
export const generateRandomColor = () => {
  const letters = '0123456789ABCDEF'
  let color = '#'
  
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  
  return color
}

// Check if running on mobile
export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

// Check if running on touch device
export const isTouchDevice = () => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

// Copy to clipboard
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('Failed to copy text: ', err)
    return false
  }
}

// Download file
export const downloadFile = (content, fileName, contentType = 'text/plain') => {
  const blob = new Blob([content], { type: contentType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}