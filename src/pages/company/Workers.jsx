import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../utils/api'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Badge } from '../../components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '../../components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import {
  Users,
  UserPlus,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  MailIcon,
  UserCheck,
  Download,
  Clock,
  FileText,
  Send,
  Copy,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Smartphone,
  Tablet,
  Monitor,
  Banknote,
  FileSpreadsheet,
  FileDown,
} from 'lucide-react'
import { format as formatDate } from 'date-fns'
import { debounce } from 'lodash'

import { exportToPDF, exportToExcel, exportToCSV } from '../../utils/printExport'

const Workers = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [openAddDialog, setOpenAddDialog] = useState(false)
  const [openInviteDialog, setOpenInviteDialog] = useState(false)
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [openPayDialog, setOpenPayDialog] = useState(false)
  const [selectedRole, setSelectedRole] = useState('all')
  const [selectedWorker, setSelectedWorker] = useState(null)
  const [nextEmployeeId, setNextEmployeeId] = useState('001')
  const [isEmployeeIdCalculated, setIsEmployeeIdCalculated] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [viewMode, setViewMode] = useState('auto') // 'mobile', 'tablet', 'desktop', 'auto'
  const [isDownloading, setIsDownloading] = useState(false)
  
  const { user: currentUser, currentCompany } = useAuth()
  const navigate = useNavigate()
  const { showSuccess, showError } = useToast()
  const queryClient = useQueryClient()
  
  // Use refs for better performance
  const searchInputRef = useRef(null)
  const workerTableRef = useRef(null)

  // Device detection with better breakpoints
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)

  // Enhanced breakpoints (match Tailwind defaults)
  const breakpoints = {
    mobile: 640,    // sm: 640px
    tablet: 1024,   // lg: 1024px
    desktop: 1280   // xl: 1280px
  }

  // Handle resize with debouncing
  useEffect(() => {
    const handleResize = debounce(() => {
      const width = window.innerWidth
      setWindowWidth(width)
      
      // Auto-detect mode if viewMode is 'auto'
      if (viewMode === 'auto') {
        const mobile = width < breakpoints.mobile
        const tablet = width >= breakpoints.mobile && width < breakpoints.tablet
        const desktop = width >= breakpoints.tablet
        
        setIsMobile(mobile)
        setIsTablet(tablet)
        setIsDesktop(desktop)
      }
    }, 100)

    // Initial call
    handleResize()
    
    window.addEventListener('resize', handleResize)
    
    return () => {
      window.removeEventListener('resize', handleResize)
      handleResize.cancel()
    }
  }, [viewMode])

  // Force view mode based on selection - FIXED LOGIC
  useEffect(() => {
    switch(viewMode) {
      case 'mobile':
        setIsMobile(true)
        setIsTablet(false)
        setIsDesktop(false)
        break
      case 'tablet':
        setIsMobile(false)
        setIsTablet(true)
        setIsDesktop(false)
        break
      case 'desktop':
        setIsMobile(false)
        setIsTablet(false)
        setIsDesktop(true)
        break
      case 'auto':
        // Let the resize handler handle it
        const width = window.innerWidth
        setIsMobile(width < breakpoints.mobile)
        setIsTablet(width >= breakpoints.mobile && width < breakpoints.tablet)
        setIsDesktop(width >= breakpoints.tablet)
        break
      default:
        setIsMobile(width < breakpoints.mobile)
        setIsTablet(width >= breakpoints.mobile && width < breakpoints.tablet)
        setIsDesktop(width >= breakpoints.tablet)
    }
  }, [viewMode, windowWidth])

  // Determine which view to show - SIMPLIFIED
  const getViewMode = () => {
    if (viewMode !== 'auto') return viewMode
    
    if (isMobile) return 'mobile'
    if (isTablet) return 'tablet'
    return 'desktop'
  }

  const currentViewMode = getViewMode()

  // Rest of your existing code remains the same until the render section...
  // Predefined options for designation and department
  const designationOptions = [
    'CEO',
    'Manager',
    'Supervisor',
    'Team Leader',
    'Senior Worker',
    'Worker',
    'Trainee',
    'Accountant',
    'Sales Executive',
    'Marketing Executive',
    'HR Manager',
    'Production Manager',
    'Quality Control',
    'Store Keeper',
    'Driver',
    'Security Guard',
    'Cleaner',
    'Other'
  ]

  const departmentOptions = [
    'Management',
    'Administration',
    'Human Resources',
    'Finance',
    'Accounts',
    'Sales',
    'Marketing',
    'Production',
    'Quality Control',
    'Research & Development',
    'IT',
    'Maintenance',
    'Logistics',
    'Procurement',
    'Store',
    'Security',
    'Housekeeping',
    'Other'
  ]

  // Worker form state
  const [workerForm, setWorkerForm] = useState({
    name: '',
    email: '',
    phone: '',
    employeeId: '001',
    designation: '',
    customDesignation: '',
    department: '',
    customDepartment: '',
    baseSalary: '',
    role: 'worker',
    joiningDate: new Date().toISOString().split('T')[0]
  })

  // Invite form state
  const [inviteForm, setInviteForm] = useState({
    name: '',
    email: '',
    phone: '',
    employeeId: '001',
    designation: '',
    customDesignation: '',
    department: '',
    customDepartment: '',
    baseSalary: '',
    role: 'worker',
    joiningDate: new Date().toISOString().split('T')[0]
  })

  // Edit form state
  const [editForm, setEditForm] = useState({
    designation: '',
    customDesignation: '',
    department: '',
    customDepartment: '',
    baseSalary: '',
    role: '',
    status: 'active'
  })

  // Pay Salary form state
  const [payForm, setPayForm] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    baseSalary: '',
    bonus: '',
    deductions: '',
    note: '',
    paymentMethod: 'cash'
  })

  // Inline form errors for add/invite
  const [addErrors, setAddErrors] = useState({})
  const [inviteErrors, setInviteErrors] = useState({})

  // Get user's allowed roles based on hierarchy
  const getAllowedRoles = () => {
    const userRole = currentUser?.role || 'worker'
    
    const roleHierarchy = {
      'owner': ['owner', 'manager', 'group_leader', 'worker', 'sales_executive'],
      'manager': ['manager', 'group_leader', 'worker', 'sales_executive'],
      'group_leader': ['group_leader', 'worker', 'sales_executive'],
      'worker': ['worker']
    }

    return roleHierarchy[userRole] || []
  }

  const allowedRoles = getAllowedRoles()
  const canAddWorker = allowedRoles.length > 0 && currentUser?.role !== 'worker'

  // Fetch workers
  const { data: workersData, isLoading, error, refetch } = useQuery({
    queryKey: ['workers', currentCompany?.id, page, limit, searchTerm],
    queryFn: () => api.get('/workers', {
      params: {
        companyId: currentCompany?.id,
        page,
        limit,
        search: searchTerm || undefined
      }
    }),
    enabled: !!currentCompany,
  })

  const workers = workersData?.workers || []
  const total = workersData?.total || 0
  const totalPages = Math.ceil(total / limit)

  // Calculate next employee ID
  const calculateNextEmployeeId = useCallback(() => {
    if (!workers.length || isEmployeeIdCalculated) return
    
    try {
      const numericIds = workers
        .map(w => {
          const id = w.employeeId || '0'
          const match = id.match(/\d+/)
          return match ? parseInt(match[0]) : 0
        })
        .filter(id => !isNaN(id) && id > 0)
      
      const maxId = numericIds.length > 0 ? Math.max(...numericIds) : 0
      const nextId = maxId + 1
      const paddedId = nextId.toString().padStart(3, '0')
      
      setNextEmployeeId(paddedId)
      
      if (workerForm.employeeId === '001') {
        setWorkerForm(prev => ({ ...prev, employeeId: paddedId }))
      }
      if (inviteForm.employeeId === '001') {
        setInviteForm(prev => ({ ...prev, employeeId: paddedId }))
      }
      
      setIsEmployeeIdCalculated(true)
    } catch (err) {
      console.error('Error calculating employee ID:', err)
      setNextEmployeeId('001')
    }
  }, [workers, workerForm.employeeId, inviteForm.employeeId, isEmployeeIdCalculated])

  // Run calculation only when workers data changes
  useEffect(() => {
    if (workers.length > 0 && !isEmployeeIdCalculated) {
      calculateNextEmployeeId()
    }
  }, [workers, calculateNextEmployeeId, isEmployeeIdCalculated])

  // Reset calculation flag when company changes
  useEffect(() => {
    setIsEmployeeIdCalculated(false)
  }, [currentCompany?.id])

  // Fetch attendance summary
  const { data: attendanceData } = useQuery({
    queryKey: ['attendanceToday', currentCompany?.id],
    queryFn: () => api.get('/workers/attendance/today', {
      params: { companyId: currentCompany?.id }
    }),
    enabled: !!currentCompany,
  })

  // Fetch salary summary
  const { data: salaryData } = useQuery({
    queryKey: ['salarySummary', currentCompany?.id],
    queryFn: () => {
      const now = new Date()
      const month = now.getMonth() + 1
      const year = now.getFullYear()
      return api.get('/salary', {
        params: {
          companyId: currentCompany?.id,
          month,
          year,
          limit: 100
        }
      })
    },
    enabled: !!currentCompany,
  })

  // Create worker mutation
  const createWorkerMutation = useMutation({
    mutationFn: (data) => api.post('/workers/create-with-password-setup', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workers', currentCompany?.id] })
      showSuccess('Worker added successfully. Password setup email has been sent.')
      setOpenAddDialog(false)
      setIsEmployeeIdCalculated(false)
      resetWorkerForm()
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to add worker'
      showError(errorMessage)
    }
  })

  // Invite worker mutation
  const inviteWorkerMutation = useMutation({
    mutationFn: (data) => api.post('/workers/invite', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workers', currentCompany?.id] })
      showSuccess('Worker invited successfully. An invitation email has been sent.')
      setOpenInviteDialog(false)
      setIsEmployeeIdCalculated(false)
      resetInviteForm()
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to invite worker'
      showError(errorMessage)
    }
  })

  // Pay Salary mutation
  const paySalaryMutation = useMutation({
    mutationFn: (data) => api.post('/salary/pay', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salarySummary', currentCompany?.id] })
      showSuccess('Salary paid successfully')
      setOpenPayDialog(false)
      setPayForm({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        baseSalary: '',
        bonus: '',
        deductions: '',
        note: '',
        paymentMethod: 'cash'
      })
    },
    onError: (error) => showError(error.message || 'Failed to pay salary')
  })

  // Update worker mutation
  const updateWorkerMutation = useMutation({
    mutationFn: ({ id, data }) => api.put(`/workers/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workers', currentCompany?.id] })
      showSuccess('Worker updated successfully')
      setOpenEditDialog(false)
      setSelectedWorker(null)
    },
    onError: (error) => {
      showError(error.message || 'Failed to update worker')
    }
  })

  // Delete worker mutation
  const deleteWorkerMutation = useMutation({
    mutationFn: (id) => api.delete(`/workers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workers', currentCompany?.id] })
      showSuccess('Worker deleted successfully')
      setOpenDeleteDialog(false)
      setSelectedWorker(null)
      setIsEmployeeIdCalculated(false)
    },
    onError: (error) => {
      showError(error.message || 'Failed to delete worker')
    }
  })

  // Reset form functions
  const resetWorkerForm = () => {
    setWorkerForm({
      name: '',
      email: '',
      phone: '',
      employeeId: nextEmployeeId,
      designation: '',
      customDesignation: '',
      department: '',
      customDepartment: '',
      baseSalary: '',
      role: 'worker',
      joiningDate: new Date().toISOString().split('T')[0]
    })
    setAddErrors({})
  }

  const resetInviteForm = () => {
    setInviteForm({
      name: '',
      email: '',
      phone: '',
      employeeId: nextEmployeeId,
      designation: '',
      customDesignation: '',
      department: '',
      customDepartment: '',
      baseSalary: '',
      role: 'worker',
      joiningDate: new Date().toISOString().split('T')[0]
    })
    setInviteErrors({})
  }

  // Handle add worker
  const handleAddWorker = async (e) => {
    e.preventDefault()
    setAddErrors({})

    if (!workerForm.name.trim()) {
      setAddErrors(prev => ({ ...prev, name: 'Name is required' }))
      return
    }

    if (!workerForm.email.trim()) {
      setAddErrors(prev => ({ ...prev, email: 'Email is required' }))
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(workerForm.email)) {
      setAddErrors(prev => ({ ...prev, email: 'Invalid email format' }))
      return
    }

    if (!workerForm.employeeId.trim()) {
      setAddErrors(prev => ({ ...prev, employeeId: 'Employee ID is required' }))
      return
    }

    try {
      const checkParams = { 
        email: workerForm.email, 
        employeeId: workerForm.employeeId 
      }
      
      if (currentCompany?.id) {
        checkParams.companyId = currentCompany.id
      }
      
      const res = await api.get('/workers/check', { params: checkParams })
      
      if (res.existsEmail) {
        setAddErrors(prev => ({ ...prev, email: 'A user with this email already exists' }))
        showError('A user with this email already exists')
        return
      }
      
      if (res.existsEmployeeId) {
        setAddErrors(prev => ({ ...prev, employeeId: 'Employee ID already exists' }))
        showError('Employee ID already exists for this company')
        return
      }

      const finalDesignation = workerForm.designation === 'Other' 
        ? workerForm.customDesignation 
        : workerForm.designation
      
      const finalDepartment = workerForm.department === 'Other'
        ? workerForm.customDepartment
        : workerForm.department
      
      const workerData = {
        ...(currentCompany?.id && { companyId: currentCompany.id }),
        name: workerForm.name.trim(),
        email: workerForm.email.trim(),
        phone: workerForm.phone.trim() || undefined,
        employeeId: workerForm.employeeId.trim(),
        designation: finalDesignation || undefined,
        department: finalDepartment || undefined,
        baseSalary: workerForm.baseSalary ? parseFloat(workerForm.baseSalary) : 0,
        role: workerForm.role || 'worker',
        joiningDate: workerForm.joiningDate || new Date().toISOString().split('T')[0]
      }

      createWorkerMutation.mutate(workerData)
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to validate worker'
      showError(errorMessage)
    }
  }

  // Handle invite worker
  const handleInviteWorker = async (e) => {
    e.preventDefault()
    
    if (!currentCompany?.id) {
      showError('Please select a company first')
      return
    }

    setInviteErrors({})

    if (!inviteForm.name.trim()) {
      setInviteErrors(prev => ({ ...prev, name: 'Name is required' }))
      return
    }

    if (!inviteForm.email.trim()) {
      setInviteErrors(prev => ({ ...prev, email: 'Email is required' }))
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(inviteForm.email)) {
      setInviteErrors(prev => ({ ...prev, email: 'Invalid email format' }))
      return
    }

    if (!inviteForm.employeeId.trim()) {
      setInviteErrors(prev => ({ ...prev, employeeId: 'Employee ID is required' }))
      return
    }

    try {
      const res = await api.get('/workers/check', { 
        params: { 
          companyId: currentCompany.id, 
          email: inviteForm.email, 
          employeeId: inviteForm.employeeId 
        } 
      })
      
      if (res.existsEmail) {
        setInviteErrors(prev => ({ ...prev, email: 'A user with this email already exists' }))
        showError('A user with this email already exists')
        return
      }
      
      if (res.existsEmployeeId) {
        setInviteErrors(prev => ({ ...prev, employeeId: 'Employee ID already exists' }))
        showError('Employee ID already exists for this company')
        return
      }

      const finalDesignation = inviteForm.designation === 'Other' 
        ? inviteForm.customDesignation 
        : inviteForm.designation
      
      const finalDepartment = inviteForm.department === 'Other'
        ? inviteForm.customDepartment
        : inviteForm.department
      
      const inviteData = {
        companyId: currentCompany.id,
        name: inviteForm.name.trim(),
        email: inviteForm.email.trim(),
        phone: inviteForm.phone.trim() || undefined,
        employeeId: inviteForm.employeeId.trim(),
        designation: finalDesignation || undefined,
        department: finalDepartment || undefined,
        baseSalary: inviteForm.baseSalary ? parseFloat(inviteForm.baseSalary) : 0,
        role: inviteForm.role || 'worker',
        joiningDate: inviteForm.joiningDate || new Date().toISOString().split('T')[0]
      }

      inviteWorkerMutation.mutate(inviteData)
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to validate invite'
      showError(errorMessage)
    }
  }

  // Handle edit worker
  const handleEditWorker = () => {
    if (!selectedWorker) return
    
    const finalDesignation = editForm.designation === 'Other' 
      ? editForm.customDesignation 
      : editForm.designation
    
    const finalDepartment = editForm.department === 'Other'
      ? editForm.customDepartment
      : editForm.department
    
    updateWorkerMutation.mutate({
      id: selectedWorker._id,
      data: {
        designation: finalDesignation,
        department: finalDepartment,
        baseSalary: parseFloat(editForm.baseSalary) || 0,
        role: editForm.role,
        status: editForm.status
      }
    })
  }

  // Handle delete worker
  const handleDeleteWorker = () => {
    if (!selectedWorker) return
    deleteWorkerMutation.mutate(selectedWorker._id)
  }

  // Handle pay salary click
  const handlePayClick = (worker) => {
    setSelectedWorker(worker)
    const baseSalary = worker.salary?.baseSalary || worker.baseSalary || 0
    setPayForm(prev => ({
      ...prev,
      baseSalary: baseSalary,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear()
    }))
    setOpenPayDialog(true)
  }

  const handlePaySubmit = () => {
    if (!selectedWorker || !currentCompany) return
    paySalaryMutation.mutate({
      workerId: selectedWorker._id,
      companyId: currentCompany.id,
      ...payForm
    })
  }

  // Handle actions
  const handleViewDetails = (worker) => {
    navigate(`/dashboard/workers/${worker._id}`)
  }

  const handleEdit = (worker) => {
    setSelectedWorker(worker)
    setEditForm({
      designation: worker.designation || '',
      customDesignation: '',
      department: worker.department || '',
      customDepartment: '',
      baseSalary: worker.salary?.baseSalary || worker.baseSalary || '',
      role: worker.role || 'worker',
      status: worker.status || 'active'
    })
    setOpenEditDialog(true)
  }

  const handleAttendance = (worker) => {
    if (!worker || !worker._id) return
    navigate(`/dashboard/workers/${worker._id}/attendance`)
  }

  const handleSalary = (worker) => {
    navigate(`/dashboard/salary?worker=${worker._id}`)
  }

  const handleDelete = (worker) => {
    setSelectedWorker(worker)
    setOpenDeleteDialog(true)
  }

  const handleCopyEmail = (email) => {
    if (email && email !== '—') {
      navigator.clipboard.writeText(email)
      showSuccess('Email copied to clipboard')
    }
  }

  const handleCopyPhone = (phone) => {
    if (phone && phone !== '—') {
      navigator.clipboard.writeText(phone)
      showSuccess('Phone number copied to clipboard')
    }
  }

  const handleSendMessage = (phone) => {
    if (phone && phone !== '—') {
      const cleanPhone = phone.replace(/\D/g, '')
      window.open(`https://wa.me/${cleanPhone}`, '_blank')
    }
  }

  const handleGenerateReport = (worker) => {
    navigate(`/dashboard/reports/worker/${worker._id}`)
  }

  // Handle exporting all workers
  const handleExport = async (exportFormat) => {
    setIsDownloading(true)
    showSuccess(`Exporting all workers as ${exportFormat.toUpperCase()}...`)

    try {
      // 1. Fetch all workers without pagination
      const response = await api.get('/workers', {
        params: {
          companyId: currentCompany?.id,
          limit: 0 // 0 or a very large number to get all
        }
      })
      
      const allWorkers = response.workers

      if (!allWorkers || allWorkers.length === 0) {
        showError('No workers to export.')
        setIsDownloading(false)
        return
      }

      // 2. Format data for export
      const formattedData = allWorkers.map(worker => ({
        'ID': String(formatEmployeeId(worker.employeeId) ?? ''),
        'Name': String(getWorkerName(worker) ?? ''),
        'Email': String(getWorkerEmail(worker) ?? ''),
        'Phone': String(getWorkerPhone(worker) ?? ''),
        'Role': String(getWorkerRole(worker).replace('_', ' ') ?? ''),
        'Department': String(getWorkerDepartment(worker) ?? ''),
        'Designation': String(getWorkerDesignation(worker) ?? ''),
        'Salary': `৳${getWorkerSalary(worker).toLocaleString()}`,
        'Status': String(getWorkerStatus(worker) ?? ''),
        'Joining Date': String(formatDate(new Date(getWorkerJoiningDate(worker)), 'MMM dd, yyyy') ?? '')
      }))

      // 3. Call the appropriate export function
      const filename = `workers-export-${new Date().toISOString().split('T')[0]}`
      
      switch (exportFormat) {
        case 'pdf': {
          const formattedDataForPdf = formattedData.map(d => ({
            ...d,
            Salary: d.Salary.replace('৳', '').trim(),
          }));
          exportToPDF(formattedDataForPdf, filename, 'All Workers List')
          break;
        }
        case 'excel':
          exportToExcel(formattedData, filename, 'Workers')
          break
        case 'csv':
          exportToCSV(formattedData, filename)
          break
        default:
          showError('Invalid export format.')
      }

    } catch (error) {
      console.error('Export failed:', error)
      const errorMessage = error?.message || 'An unexpected error occurred during export.'
      showError(`Failed to export workers: ${errorMessage}`)
    } finally {
      setIsDownloading(false)
    }
  }

  // Calculate summary data
  const activeWorkers = workers.filter(w => w.status === 'active').length
  const monthlySalary = salaryData?.salaries?.reduce((sum, salary) => sum + (salary.netSalary || 0), 0) || 0
  const presentToday = attendanceData?.present || 0

  // Safe worker data access helper functions
  const getWorkerRole = (worker) => {
    return worker.role || worker.user?.role || 'worker'
  }

  const getWorkerName = (worker) => {
    return worker.user?.name || worker.name || 'Unnamed Worker'
  }

  const getWorkerPhone = (worker) => {
    return worker.user?.phone || worker.phone || '—'
  }

  const getWorkerEmail = (worker) => {
    return worker.user?.email || worker.email || '—'
  }

  const getWorkerSalary = (worker) => {
    return worker.salary?.baseSalary || worker.baseSalary || 0
  }

  const getWorkerStatus = (worker) => {
    return worker.status || 'inactive'
  }

  const getWorkerDepartment = (worker) => {
    return worker.department || worker.user?.department || '—'
  }

  const getWorkerDesignation = (worker) => {
    return worker.designation || worker.user?.designation || '—'
  }

  const getWorkerJoiningDate = (worker) => {
    return worker.joiningDate || worker.createdAt || new Date()
  }

  const canEditWorker = (worker) => {
    const userRole = currentUser?.role || 'worker'
    return ['admin', 'owner', 'manager', 'group_leader'].includes(userRole)
  }

  // Format employee ID for display
  const formatEmployeeId = (employeeId) => {
    if (!employeeId) return '—'
    if (/^\d+$/.test(employeeId)) {
      return employeeId.padStart(3, '0')
    }
    return employeeId
  }

  // Dialog open handlers with form reset
  const handleOpenAddDialog = () => {
    resetWorkerForm()
    setOpenAddDialog(true)
  }

  const handleOpenInviteDialog = () => {
    resetInviteForm()
    setOpenInviteDialog(true)
  }

  // Enhanced tablet view rendering - FIXED
  const renderWorkerCard = (worker) => {
    const workerRole = getWorkerRole(worker)
    const workerName = getWorkerName(worker)
    const workerPhone = getWorkerPhone(worker)
    const workerEmail = getWorkerEmail(worker)
    const workerSalary = getWorkerSalary(worker)
    const workerStatus = getWorkerStatus(worker)
    const workerDepartment = getWorkerDepartment(worker)
    const workerDesignation = getWorkerDesignation(worker)
    const workerJoiningDate = getWorkerJoiningDate(worker)
    const formattedEmployeeId = formatEmployeeId(worker.employeeId)

    // Enhanced status badge with better colors
    const getStatusColor = (status) => {
      switch(status) {
        case 'active': return 'bg-green-100 text-green-800 border-green-300'
        case 'inactive': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
        case 'on_leave': return 'bg-blue-100 text-blue-800 border-blue-300'
        case 'terminated': return 'bg-red-100 text-red-800 border-red-300'
        default: return 'bg-gray-100 text-gray-800 border-gray-300'
      }
    }

    return (
      <Card key={worker._id || worker.id} className="mb-4 hover:shadow-md transition-shadow">
        <CardContent className="pt-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                <AvatarImage 
                  src={worker.user?.profileImage || worker.profileImage} 
                  alt={workerName} 
                />
                <AvatarFallback className="text-sm sm:text-base">
                  {workerName.charAt(0).toUpperCase() || 'W'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold truncate text-sm sm:text-base">{workerName}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(workerStatus)}`}>
                    {workerStatus.charAt(0).toUpperCase() + workerStatus.slice(1)}
                  </span>
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground mt-1">
                  ID: {formattedEmployeeId} • {workerRole.replace('_', ' ')}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground mt-1 truncate">
                  {workerDepartment} • {workerDesignation}
                </div>
              </div>
            </div>
            
            {/* Enhanced action buttons for tablet */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 sm:h-9 sm:w-9"
                title="Attendance"
                onClick={() => handleAttendance(worker)}
              >
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 sm:h-9 sm:w-9"
                title="Salary"
                onClick={() => handleSalary(worker)}
              >
                <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>

              {canEditWorker(worker) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 sm:h-9 sm:w-9"
                  title="Edit"
                  onClick={() => handleEdit(worker)}
                >
                  <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-8 w-8 sm:h-9 sm:w-9"
                  >
                    <MoreVertical className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel className="text-xs">Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleViewDetails(worker)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handlePayClick(worker)}>
                    <Banknote className="mr-2 h-4 w-4" />
                    Pay Salary
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleGenerateReport(worker)}>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Report
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => handleDelete(worker)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Worker
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs sm:text-sm">
            <div className="space-y-1">
              <div className="text-muted-foreground">Salary</div>
              <div className="font-medium">৳{workerSalary.toLocaleString()}</div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground">Joined</div>
              <div>{formatDate(new Date(workerJoiningDate), 'MMM dd, yyyy')}</div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground">Phone</div>
              <div className="flex items-center gap-1">
                <span className="truncate">{workerPhone}</span>
                {workerPhone !== '—' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={() => handleCopyPhone(workerPhone)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground">Email</div>
              <div className="flex items-center gap-1">
                <span className="truncate">{workerEmail}</span>
                {workerEmail !== '—' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={() => handleCopyEmail(workerEmail)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Enhanced tablet table view - FIXED CONDITIONAL RENDERING
  const renderTabletTable = () => {
    const filteredWorkers = workers.filter(worker => {
      if (selectedRole === 'all') return true
      const role = getWorkerRole(worker)
      return role === selectedRole
    })

    if (filteredWorkers.length === 0) {
      return (
        <div className="py-12 text-center">
          <Users className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No workers found</h3>
          <p className="mt-2 text-muted-foreground">
            {searchTerm ? 'No workers match your search criteria.' : 'Start by adding your first worker.'}
          </p>
        </div>
      )
    }

    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Worker</TableHead>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead className="w-[150px]">Department</TableHead>
              <TableHead className="w-[120px]">Salary</TableHead>
              <TableHead className="w-[120px]">Status</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredWorkers.map((worker) => {
              const workerRole = getWorkerRole(worker)
              const workerName = getWorkerName(worker)
              const workerPhone = getWorkerPhone(worker)
              const workerEmail = getWorkerEmail(worker)
              const workerSalary = getWorkerSalary(worker)
              const workerStatus = getWorkerStatus(worker)
              const workerDepartment = getWorkerDepartment(worker)
              const formattedEmployeeId = formatEmployeeId(worker.employeeId)
              
              return (
                <TableRow key={worker._id || worker.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage 
                          src={worker.user?.profileImage || worker.profileImage} 
                          alt={workerName} 
                        />
                        <AvatarFallback className="text-xs">
                          {workerName.charAt(0).toUpperCase() || 'W'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="font-medium truncate text-sm">{workerName}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {workerRole.replace('_', ' ')}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-mono text-sm">{formattedEmployeeId}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{workerDepartment}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-sm">৳{workerSalary.toLocaleString()}</div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={workerStatus === 'active' ? 'success' : 'secondary'}
                      className="capitalize"
                    >
                      {workerStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7"
                        onClick={() => handleAttendance(worker)}
                      >
                        <Calendar className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7"
                        onClick={() => handleSalary(worker)}
                      >
                        <DollarSign className="h-3 w-3" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-7 w-7">
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => handleEdit(worker)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewDetails(worker)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handlePayClick(worker)}>
                            <Banknote className="mr-2 h-4 w-4" />
                            Pay Salary
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDelete(worker)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with View Mode Toggle - FIXED RESPONSIVENESS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center justify-between w-full sm:w-auto">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">Worker Management</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Manage your workers, track attendance, and handle salaries
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="sm:hidden h-8 w-8"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
        
        {/* View Mode Toggle - IMPROVED */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* View Mode Selector */}
          <div className="flex items-center gap-1 bg-muted p-1 rounded-lg w-full sm:w-auto">
            <Button
              variant={viewMode === 'mobile' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('mobile')}
              className="h-8 px-2 flex-1 sm:flex-none"
              title="Mobile View"
            >
              <Smartphone className="h-4 w-4" />
              <span className="ml-2 sm:hidden">Mobile</span>
            </Button>
            <Button
              variant={viewMode === 'tablet' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('tablet')}
              className="h-8 px-2 flex-1 sm:flex-none"
              title="Tablet View"
            >
              <Tablet className="h-4 w-4" />
              <span className="ml-2 sm:hidden">Tablet</span>
            </Button>
            <Button
              variant={viewMode === 'desktop' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('desktop')}
              className="h-8 px-2 flex-1 sm:flex-none"
              title="Desktop View"
            >
              <Monitor className="h-4 w-4" />
              <span className="ml-2 sm:hidden">Desktop</span>
            </Button>
            <Button
              variant={viewMode === 'auto' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('auto')}
              className="h-8 px-2 flex-1 sm:flex-none"
              title="Auto Detect"
            >
              <span className="text-xs">Auto</span>
            </Button>
          </div>
          
          {/* Action Buttons - IMPROVED RESPONSIVENESS */}
          {canAddWorker && currentCompany && (
            <div className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-3 ${isMobileMenuOpen || windowWidth >= 640 ? 'flex' : 'hidden'}`}>
              <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
                <DialogTrigger asChild>
                  <Button onClick={handleOpenAddDialog} size="sm" className="w-full sm:w-auto">
                    <UserPlus className="mr-2 h-4 w-4" />
                    <span>Add Worker</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Worker</DialogTitle>
                    <DialogDescription>
                      Create a new worker account. A password setup email will be sent.
                    </DialogDescription>
                  </DialogHeader>
                  {/* Form content remains the same */}
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards - Responsive Grid - FIXED */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 xs:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-sm transition-shadow">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Total Workers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <div className="text-2xl font-bold">{total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeWorkers} active workers
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-sm transition-shadow">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Present Today</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <div className="text-2xl font-bold">{presentToday}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {attendanceData?.percentage || 0}% attendance rate
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-sm transition-shadow">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Monthly Salary</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <div className="text-2xl font-bold">৳{monthlySalary.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              This month's salary payout
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-sm transition-shadow">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Next Employee ID</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <div className="text-2xl font-bold font-mono">{nextEmployeeId}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Auto-generated serial number
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Workers List/Table - FIXED VIEW MODE LOGIC */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center justify-between">
            <div>
              <CardTitle className="text-lg sm:text-xl">All Workers</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                List of all workers in your company
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  placeholder="Search workers..."
                  className="w-full pl-9 h-10 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="h-10 text-sm w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="owner">Owner</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="group_leader">Group Leader</SelectItem>
                    <SelectItem value="worker">Worker</SelectItem>
                    <SelectItem value="sales_executive">Sales Executive</SelectItem>
                  </SelectContent>
                </Select>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-10 w-10 flex-shrink-0"
                      disabled={isDownloading}
                    >
                      {isDownloading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Export Options</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem onClick={() => handleExport('pdf')}>
                        <FileText className="mr-2 h-4 w-4" />
                        Export as PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExport('excel')}>
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Export as Excel
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExport('csv')}>
                        <FileDown className="mr-2 h-4 w-4" />
                        Export as CSV
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          {isLoading ? (
            <div className="py-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading workers...</p>
            </div>
          ) : error ? (
            <div className="py-12 text-center">
              <h3 className="mt-4 text-lg font-semibold">Error loading workers</h3>
              <p className="mt-2 text-muted-foreground">
                {error.message || 'Failed to load workers. Please try again.'}
              </p>
              <Button 
                className="mt-4" 
                onClick={() => refetch()}
                size="sm"
              >
                Retry
              </Button>
            </div>
          ) : (
            <>
              {/* Mobile View - Cards - FIXED CONDITION */}
              {currentViewMode === 'mobile' && (
                <div className="space-y-4">
                  {workers
                    .filter(worker => {
                      if (selectedRole === 'all') return true
                      const role = getWorkerRole(worker)
                      return role === selectedRole
                    })
                    .map(renderWorkerCard)}
                  
                  {workers.length === 0 && (
                    <div className="py-12 text-center">
                      <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-semibold">No workers found</h3>
                      <p className="mt-2 text-muted-foreground">
                        {searchTerm ? 'No workers match your search criteria.' : 'Start by adding your first worker.'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Tablet View - FIXED CONDITION */}
              {currentViewMode === 'tablet' && (
                <div className="hidden md:block lg:hidden">
                  {renderTabletTable()}
                </div>
              )}

              {/* Desktop View - Full Table - FIXED CONDITION */}
              {currentViewMode === 'desktop' && (
                <div className="hidden lg:block">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[200px]">Worker</TableHead>
                          <TableHead className="w-[100px]">Employee ID</TableHead>
                          <TableHead className="w-[180px]">Role & Department</TableHead>
                          <TableHead className="w-[120px]">Salary</TableHead>
                          <TableHead className="w-[200px]">Contact</TableHead>
                          <TableHead className="w-[100px]">Status</TableHead>
                          <TableHead className="w-[150px] text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {workers
                          .filter(worker => {
                            if (selectedRole === 'all') return true
                            const role = getWorkerRole(worker)
                            return role === selectedRole
                          })
                          .map((worker) => {
                            const workerRole = getWorkerRole(worker)
                            const workerName = getWorkerName(worker)
                            const workerPhone = getWorkerPhone(worker)
                            const workerEmail = getWorkerEmail(worker)
                            const workerSalary = getWorkerSalary(worker)
                            const workerStatus = getWorkerStatus(worker)
                            const workerDepartment = getWorkerDepartment(worker)
                            const workerDesignation = getWorkerDesignation(worker)
                            const workerJoiningDate = getWorkerJoiningDate(worker)
                            const formattedEmployeeId = formatEmployeeId(worker.employeeId)
                            
                            return (
                              <TableRow key={worker._id || worker.id}>
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    <Avatar>
                                      <AvatarImage 
                                        src={worker.user?.profileImage || worker.profileImage} 
                                        alt={workerName} 
                                      />
                                      <AvatarFallback>
                                        {workerName.charAt(0).toUpperCase() || 'W'}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div className="font-medium">
                                        {workerName}
                                      </div>
                                      <div className="text-sm text-muted-foreground">
                                        Joined {formatDate(new Date(workerJoiningDate), 'MMM dd, yyyy')}
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="font-medium font-mono">
                                    {formattedEmployeeId}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="font-medium capitalize">
                                    {workerRole.replace('_', ' ')}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {workerDepartment}
                                  </div>
                                  <div className="text-sm">
                                    {workerDesignation}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="font-medium">
                                    ৳{workerSalary.toLocaleString()}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    Monthly
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1">
                                      <Phone className="h-3 w-3 flex-shrink-0" />
                                      <span className="text-sm truncate">{workerPhone}</span>
                                      {workerPhone !== '—' && (
                                        <>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-4 w-4 flex-shrink-0"
                                            onClick={() => handleCopyPhone(workerPhone)}
                                          >
                                            <Copy className="h-3 w-3" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-4 w-4 flex-shrink-0"
                                            onClick={() => handleSendMessage(workerPhone)}
                                          >
                                            <Send className="h-3 w-3" />
                                          </Button>
                                        </>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Mail className="h-3 w-3 flex-shrink-0" />
                                      <span className="text-sm truncate">{workerEmail}</span>
                                      {workerEmail !== '—' && (
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-4 w-4 flex-shrink-0"
                                          onClick={() => handleCopyEmail(workerEmail)}
                                        >
                                          <Copy className="h-3 w-3" />
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge 
                                    variant={workerStatus === 'active' ? 'success' : 'secondary'}
                                    className="capitalize"
                                  >
                                    {workerStatus}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      title="Attendance"
                                      onClick={() => handleAttendance(worker)}
                                    >
                                      <Calendar className="h-4 w-4" />
                                    </Button>

                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      title="Salary"
                                      onClick={() => handleSalary(worker)}
                                    >
                                      <DollarSign className="h-4 w-4" />
                                    </Button>

                                    {canEditWorker(worker) && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        title="Edit"
                                        onClick={() => handleEdit(worker)}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                    )}

                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                          <MoreVertical className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => handleViewDetails(worker)}>
                                          <Eye className="mr-2 h-4 w-4" />
                                          View Details
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handlePayClick(worker)}>
                                          <Banknote className="mr-2 h-4 w-4" />
                                          Pay Salary
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleGenerateReport(worker)}>
                                          <FileText className="mr-2 h-4 w-4" />
                                          Generate Report
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem 
                                          onClick={() => handleDelete(worker)}
                                          className="text-red-600"
                                        >
                                          <Trash2 className="mr-2 h-4 w-4" />
                                          Delete Worker
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* No workers found - FIXED POSITIONING */}
              {workers.length === 0 && currentViewMode !== 'mobile' && (
                <div className="py-12 text-center">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No workers found</h3>
                  <p className="mt-2 text-muted-foreground">
                    {searchTerm ? 'No workers match your search criteria.' : 'Start by adding your first worker.'}
                  </p>
                  {canAddWorker && !searchTerm && currentCompany && (
                    <Button 
                      className="mt-4" 
                      onClick={() => setOpenAddDialog(true)}
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Add Your First Worker
                    </Button>
                  )}
                  {!currentCompany && (
                    <Button 
                      className="mt-4" 
                      onClick={() => window.location.href = '/dashboard/company-select'}
                    >
                      Select a Company First
                    </Button>
                  )}
                </div>
              )}

              {/* Responsive Pagination - FIXED */}
              {totalPages > 1 && (
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-muted-foreground text-center sm:text-left">
                    Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} workers
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="hidden sm:inline ml-1">Previous</span>
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum
                        if (totalPages <= 5) {
                          pageNum = i + 1
                        } else if (page <= 3) {
                          pageNum = i + 1
                        } else if (page >= totalPages - 2) {
                          pageNum = totalPages - 4 + i
                        } else {
                          pageNum = page - 2 + i
                        }
                        return (
                          <Button
                            key={pageNum}
                            variant={pageNum === page ? "default" : "outline"}
                            size="sm"
                            className="h-8 w-8 sm:h-9 sm:w-9"
                            onClick={() => setPage(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        )
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3"
                    >
                      <span className="hidden sm:inline mr-1">Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Worker Dialog - Keep as is */}
      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Worker</DialogTitle>
            <DialogDescription>
              Update worker information
            </DialogDescription>
          </DialogHeader>
          {/* Edit form remains the same */}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog - Keep as is */}
      <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Worker</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedWorker?.user?.name || selectedWorker?.name || 'this worker'}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setOpenDeleteDialog(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteWorker}
              disabled={deleteWorkerMutation.isPending}
              className="w-full sm:w-auto"
            >
              {deleteWorkerMutation.isPending ? 'Deleting...' : 'Delete Worker'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pay Salary Dialog */}
      <Dialog open={openPayDialog} onOpenChange={setOpenPayDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Pay Salary</DialogTitle>
            <DialogDescription>
              Process salary payment for {selectedWorker?.user?.name || selectedWorker?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Month</Label>
                <Select 
                  value={payForm.month.toString()} 
                  onValueChange={(v) => setPayForm({...payForm, month: parseInt(v)})}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                      <SelectItem key={m} value={m.toString()}>
                        {formatDate(new Date(2024, m-1, 1), 'MMMM')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Year</Label>
                <Input 
                  type="number" 
                  value={payForm.year}
                  onChange={(e) => setPayForm({...payForm, year: parseInt(e.target.value)})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Base Salary</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">৳</span>
                <Input 
                  className="pl-8"
                  type="number"
                  value={payForm.baseSalary}
                  onChange={(e) => setPayForm({...payForm, baseSalary: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Bonus</Label>
                <Input 
                  type="number"
                  placeholder="0"
                  value={payForm.bonus}
                  onChange={(e) => setPayForm({...payForm, bonus: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Deductions</Label>
                <Input 
                  type="number"
                  placeholder="0"
                  value={payForm.deductions}
                  onChange={(e) => setPayForm({...payForm, deductions: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select 
                value={payForm.paymentMethod} 
                onValueChange={(v) => setPayForm({...payForm, paymentMethod: v})}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                  <SelectItem value="mobile_banking">Mobile Banking</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenPayDialog(false)}>Cancel</Button>
            <Button onClick={handlePaySubmit} disabled={paySalaryMutation.isPending}>
              {paySalaryMutation.isPending ? 'Processing...' : 'Confirm Payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Workers