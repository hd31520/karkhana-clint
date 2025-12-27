// Application constants
export const APP_NAME = 'Karkhana.shop'
export const APP_VERSION = '1.0.0'
export const COMPANY_TYPES = [
  { value: 'factory', label: 'Factory' },
  { value: 'shop', label: 'Shop' },
  { value: 'showroom', label: 'Showroom' },
  { value: 'other', label: 'Other' },
]

export const FACTORY_CATEGORIES = [
  { value: 'wood', label: 'Wood Factory' },
  { value: 'iron', label: 'Iron/Steel Factory' },
  { value: 'textile', label: 'Textile Factory' },
  { value: 'plastic', label: 'Plastic Factory' },
  { value: 'food', label: 'Food Processing' },
  { value: 'chemical', label: 'Chemical Factory' },
  { value: 'other', label: 'Other Factory' },
]

export const WORKER_TYPES = [
  { value: 'permanent', label: 'Permanent' },
  { value: 'contract', label: 'Contract' },
  { value: 'temporary', label: 'Temporary' },
  { value: 'daily', label: 'Daily Wage' },
]

export const SKILL_LEVELS = [
  { value: 'trainee', label: 'Trainee' },
  { value: 'junior', label: 'Junior' },
  { value: 'senior', label: 'Senior' },
  { value: 'expert', label: 'Expert' },
]

export const ATTENDANCE_STATUS = [
  { value: 'present', label: 'Present', color: 'green' },
  { value: 'absent', label: 'Absent', color: 'red' },
  { value: 'late', label: 'Late', color: 'orange' },
  { value: 'leave', label: 'Leave', color: 'blue' },
  { value: 'holiday', label: 'Holiday', color: 'purple' },
]

export const LEAVE_TYPES = [
  { value: 'sick', label: 'Sick Leave' },
  { value: 'casual', label: 'Casual Leave' },
  { value: 'earned', label: 'Earned Leave' },
  { value: 'maternity', label: 'Maternity Leave' },
  { value: 'paternity', label: 'Paternity Leave' },
  { value: 'unpaid', label: 'Unpaid Leave' },
]

export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank', label: 'Bank Transfer' },
  { value: 'mobile', label: 'Mobile Banking' },
  { value: 'card', label: 'Credit/Debit Card' },
  { value: 'check', label: 'Check' },
]

export const SALARY_STATUS = [
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'paid', label: 'Paid', color: 'green' },
  { value: 'partial', label: 'Partial', color: 'blue' },
  { value: 'hold', label: 'Hold', color: 'red' },
]

export const ORDER_STATUS = [
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'confirmed', label: 'Confirmed', color: 'blue' },
  { value: 'processing', label: 'Processing', color: 'orange' },
  { value: 'completed', label: 'Completed', color: 'green' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' },
]

export const DELIVERY_STATUS = [
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'packed', label: 'Packed', color: 'blue' },
  { value: 'shipped', label: 'Shipped', color: 'orange' },
  { value: 'delivered', label: 'Delivered', color: 'green' },
  { value: 'returned', label: 'Returned', color: 'red' },
]

export const CUSTOMER_TYPES = [
  { value: 'retail', label: 'Retail' },
  { value: 'wholesale', label: 'Wholesale' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'regular', label: 'Regular' },
]

export const PRODUCT_CATEGORIES = [
  { value: 'furniture', label: 'Furniture' },
  { value: 'construction', label: 'Construction' },
  { value: 'textile', label: 'Textile' },
  { value: 'metal', label: 'Metal Products' },
  { value: 'plastic', label: 'Plastic Products' },
  { value: 'food', label: 'Food Items' },
  { value: 'chemical', label: 'Chemical Products' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'other', label: 'Other' },
]

export const UNITS = [
  { value: 'pcs', label: 'Pieces' },
  { value: 'kg', label: 'Kilogram' },
  { value: 'g', label: 'Gram' },
  { value: 'l', label: 'Liter' },
  { value: 'ml', label: 'Milliliter' },
  { value: 'm', label: 'Meter' },
  { value: 'cm', label: 'Centimeter' },
  { value: 'box', label: 'Box' },
  { value: 'packet', label: 'Packet' },
  { value: 'dozen', label: 'Dozen' },
]

export const SUBSCRIPTION_PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    workerLimit: 10,
    priceMonthly: 200,
    priceYearly: 2000,
    features: [
      'Up to 10 workers',
      'Basic salary management',
      'Product inventory',
      'Sales tracking',
      'Daily reports',
    ],
  },
  {
    id: 'standard',
    name: 'Standard',
    workerLimit: 20,
    priceMonthly: 300,
    priceYearly: 3000,
    features: [
      'Everything in Basic',
      'Up to 20 workers',
      'Group management',
      'Customer database',
      'Memo system',
      'Monthly reports',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    workerLimit: 50,
    priceMonthly: 500,
    priceYearly: 5000,
    features: [
      'Everything in Standard',
      'Up to 50 workers',
      'Advanced analytics',
      'Custom reports',
      'API access',
      'Priority support',
    ],
  },
]

export const ROLES = [
  { value: 'owner', label: 'Company Owner' },
  { value: 'manager', label: 'Manager' },
  { value: 'supervisor', label: 'Supervisor' },
  { value: 'worker', label: 'Worker' },
  { value: 'sales', label: 'Sales Executive' },
  { value: 'accountant', label: 'Accountant' },
]

export const PERMISSIONS = {
  // Company Level
  COMPANY_READ: 'company:read',
  COMPANY_UPDATE: 'company:update',
  COMPANY_DELETE: 'company:delete',
  
  // Worker Management
  WORKER_CREATE: 'worker:create',
  WORKER_READ: 'worker:read',
  WORKER_UPDATE: 'worker:update',
  WORKER_DELETE: 'worker:delete',
  
  // Salary
  SALARY_CALCULATE: 'salary:calculate',
  SALARY_PAY: 'salary:pay',
  SALARY_READ: 'salary:read',
  SALARY_UPDATE: 'salary:update',
  
  // Sales
  SALE_CREATE: 'sale:create',
  SALE_READ: 'sale:read',
  SALE_UPDATE: 'sale:update',
  SALE_DELETE: 'sale:delete',
  
  // Inventory
  PRODUCT_CREATE: 'product:create',
  PRODUCT_READ: 'product:read',
  PRODUCT_UPDATE: 'product:update',
  PRODUCT_DELETE: 'product:delete',
  
  // Reports
  REPORT_GENERATE: 'report:generate',
  REPORT_READ: 'report:read',
  REPORT_EXPORT: 'report:export',
  
  // Settings
  SETTINGS_UPDATE: 'settings:update',
  ROLE_MANAGE: 'role:manage',
  USER_MANAGE: 'user:manage',
}

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export const DAYS_OF_WEEK = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
]

export const CURRENCIES = [
  { value: 'BDT', label: 'Bangladeshi Taka (৳)' },
  { value: 'USD', label: 'US Dollar ($)' },
  { value: 'EUR', label: 'Euro (€)' },
  { value: 'GBP', label: 'British Pound (£)' },
  { value: 'INR', label: 'Indian Rupee (₹)' },
]

export const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'bn', label: 'বাংলা (Bengali)' },
]

export const DATE_FORMATS = [
  { value: 'dd/MM/yyyy', label: 'DD/MM/YYYY' },
  { value: 'MM/dd/yyyy', label: 'MM/DD/YYYY' },
  { value: 'yyyy-MM-dd', label: 'YYYY-MM-DD' },
  { value: 'dd MMM yyyy', label: 'DD Mon YYYY' },
]

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
  },
  USERS: {
    BASE: '/users',
    PROFILE: '/users/profile',
    CHANGE_PASSWORD: '/users/change-password',
  },
  COMPANIES: {
    BASE: '/companies',
    MY_COMPANIES: '/companies/my',
    WORKERS: '/companies/:id/workers',
    PRODUCTS: '/companies/:id/products',
    SALES: '/companies/:id/sales',
    REPORTS: '/companies/:id/reports',
  },
  WORKERS: {
    BASE: '/workers',
    ATTENDANCE: '/workers/:id/attendance',
    SALARY: '/workers/:id/salary',
  },
  PRODUCTS: {
    BASE: '/products',
    CATEGORIES: '/products/categories',
    INVENTORY: '/products/:id/inventory',
  },
  SALES: {
    BASE: '/sales',
    ORDERS: '/sales/orders',
    MEMOS: '/sales/memos',
    CUSTOMERS: '/sales/customers',
  },
  REPORTS: {
    BASE: '/reports',
    DAILY: '/reports/daily',
    MONTHLY: '/reports/monthly',
    SALARY: '/reports/salary',
    SALES: '/reports/sales',
    INVENTORY: '/reports/inventory',
  },
  SETTINGS: {
    BASE: '/settings',
    SUBSCRIPTION: '/settings/subscription',
    ROLES: '/settings/roles',
    PERMISSIONS: '/settings/permissions',
  },
}