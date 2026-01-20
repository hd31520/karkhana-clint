// import { clsx } from "clsx";
// import { twMerge } from "tailwind-merge"

// export function cn(...inputs) {
//   return twMerge(clsx(inputs));
// }
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Format currency
export const formatCurrency = (amount, currency = 'BDT') => {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

// Format date
export const formatDate = (date, format = 'dd/MM/yyyy') => {
  if (!date) return ''
  
  const d = new Date(date)
  
  if (format === 'dd/MM/yyyy') {
    return d.toLocaleDateString('en-GB')
  }
  
  if (format === 'MM/dd/yyyy') {
    return d.toLocaleDateString('en-US')
  }
  
  if (format === 'yyyy-MM-dd') {
    return d.toISOString().split('T')[0]
  }
  
  return d.toLocaleDateString()
}

// Format time
export const formatTime = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Truncate text
export const truncateText = (text, length = 50) => {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

// Generate random ID
export const generateId = (prefix = '') => {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substr(2, 5)
  return `${prefix}${timestamp}${random}`.toUpperCase()
}

// Calculate percentage
export const calculatePercentage = (value, total) => {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
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

// Validate email
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

// Validate phone number (Bangladeshi)
export const validatePhone = (phone) => {
  const re = /^(?:\+88|88)?(01[3-9]\d{8})$/
  return re.test(phone)
}

// Get file extension
export const getFileExtension = (filename) => {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2)
}

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}