import React, { useState, useEffect, useCallback } from 'react'
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
  Copy
} from 'lucide-react'
import { format } from 'date-fns'

const Workers = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [openAddDialog, setOpenAddDialog] = useState(false)
  const [openInviteDialog, setOpenInviteDialog] = useState(false)
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [selectedRole, setSelectedRole] = useState('all')
  const [selectedWorker, setSelectedWorker] = useState(null)
  const [nextEmployeeId, setNextEmployeeId] = useState('001')
  const [isEmployeeIdCalculated, setIsEmployeeIdCalculated] = useState(false)
  
  const { user: currentUser, currentCompany } = useAuth()
  const { showSuccess, showError } = useToast()
  const queryClient = useQueryClient()

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

  // Inline form errors for add/invite
  const [addErrors, setAddErrors] = useState({})
  const [inviteErrors, setInviteErrors] = useState({})

  // Get user's allowed roles based on hierarchy
  const getAllowedRoles = () => {
    const userRole = currentUser?.role || 'worker'
    
    const roleHierarchy = {
      'owner': ['owner', 'manager', 'group_leader', 'worker', 'sales_executive'],
      'manager': ['manager', 'group_leader', 'worker', 'sales_executive'],
      'group_leader': ['worker', 'sales_executive'],
      'worker': []
    }

    return roleHierarchy[userRole] || []
  }

  const allowedRoles = getAllowedRoles()
  const canAddWorker = allowedRoles.length > 0

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

  // Calculate next employee ID - FIXED INFINITE LOOP
  const calculateNextEmployeeId = useCallback(() => {
    if (!workers.length || isEmployeeIdCalculated) return
    
    try {
      const numericIds = workers
        .map(w => {
          const id = w.employeeId || '0'
          // Extract numeric part from employee ID
          const match = id.match(/\d+/)
          return match ? parseInt(match[0]) : 0
        })
        .filter(id => !isNaN(id) && id > 0)
      
      const maxId = numericIds.length > 0 ? Math.max(...numericIds) : 0
      const nextId = maxId + 1
      const paddedId = nextId.toString().padStart(3, '0')
      
      setNextEmployeeId(paddedId)
      
      // Update forms only if they have the default ID
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
    mutationFn: (data) => api.post('/workers', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workers', currentCompany?.id] })
      // Refresh dashboard-related queries so counts update in real-time
      queryClient.invalidateQueries({ queryKey: ['companyStats', currentCompany?.id] })
      queryClient.invalidateQueries({ queryKey: ['salesStats', currentCompany?.id] })
      queryClient.invalidateQueries({ queryKey: ['attendanceToday', currentCompany?.id] })
      queryClient.invalidateQueries({ queryKey: ['salarySummary', currentCompany?.id] })
      showSuccess('Worker added successfully')
      setOpenAddDialog(false)
      setIsEmployeeIdCalculated(false) // Reset for next calculation
      setWorkerForm({
        name: '',
        email: '',
        phone: '',
        employeeId: nextEmployeeId, // Use current next ID
        designation: '',
        customDesignation: '',
        department: '',
        customDepartment: '',
        baseSalary: '',
        role: 'worker',
        joiningDate: new Date().toISOString().split('T')[0]
      })
    },
    onError: (error) => {
      // api wrapper returns error response data object; handle several shapes
      let msg = 'Failed to add worker'
      try {
        if (!error) {
          msg = 'Failed to add worker'
        } else if (typeof error === 'string') {
          msg = error
        } else if (error.message) {
          msg = error.message
        } else if (error.errors) {
          // Joi or mongoose validation
          msg = Array.isArray(error.errors) ? error.errors.join(', ') : JSON.stringify(error.errors)
        } else {
          msg = JSON.stringify(error)
        }
      } catch (err) {
        msg = 'Failed to add worker'
      }

      showError(msg)
    }
  })

  // Invite worker mutation
  const inviteWorkerMutation = useMutation({
    mutationFn: (data) => api.post('/workers/invite', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workers', currentCompany?.id] })
      // Refresh dashboard-related queries so counts update in real-time
      queryClient.invalidateQueries({ queryKey: ['companyStats', currentCompany?.id] })
      queryClient.invalidateQueries({ queryKey: ['salesStats', currentCompany?.id] })
      queryClient.invalidateQueries({ queryKey: ['attendanceToday', currentCompany?.id] })
      queryClient.invalidateQueries({ queryKey: ['salarySummary', currentCompany?.id] })
      showSuccess('Worker invited successfully. An email has been sent.')
      setOpenInviteDialog(false)
      setIsEmployeeIdCalculated(false) // Reset for next calculation
      setInviteForm({
        name: '',
        email: '',
        phone: '',
        employeeId: nextEmployeeId, // Use current next ID
        designation: '',
        customDesignation: '',
        department: '',
        customDepartment: '',
        baseSalary: '',
        role: 'worker',
        joiningDate: new Date().toISOString().split('T')[0]
      })
    },
    onError: (error) => {
      let msg = 'Failed to invite worker'
      try {
        if (!error) {
          msg = 'Failed to invite worker'
        } else if (typeof error === 'string') {
          msg = error
        } else if (error.message) {
          msg = error.message
        } else if (error.errors) {
          msg = Array.isArray(error.errors) ? error.errors.join(', ') : JSON.stringify(error.errors)
        } else {
          msg = JSON.stringify(error)
        }
      } catch (err) {
        msg = 'Failed to invite worker'
      }
      showError(msg)
    }
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
      setIsEmployeeIdCalculated(false) // Reset for recalculation
    },
    onError: (error) => {
      showError(error.message || 'Failed to delete worker')
    }
  })

  // Handle add worker
  const handleAddWorker = (e) => {
    e.preventDefault()
    if (!currentCompany?.id) {
      showError('Please select a company first')
      return
    }
    // Clear previous errors
    setAddErrors({})

    // Client-side availability check via server endpoint
    api.get('/workers/check', { params: { companyId: currentCompany.id, email: workerForm.email, employeeId: workerForm.employeeId } })
      .then((res) => {
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
        
        createWorkerMutation.mutate({
          companyId: currentCompany.id,
          ...workerForm,
          designation: finalDesignation,
          department: finalDepartment,
          baseSalary: parseFloat(workerForm.baseSalary) || 0
        })
      })
      .catch((err) => {
        showError(err?.message || 'Failed to validate worker')
      })
  }

  // Handle invite worker
  const handleInviteWorker = (e) => {
    e.preventDefault()
    if (!currentCompany?.id) {
      showError('Please select a company first')
      return
    }
    setInviteErrors({})
    api.get('/workers/check', { params: { companyId: currentCompany.id, email: inviteForm.email, employeeId: inviteForm.employeeId } })
      .then((res) => {
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
        
        inviteWorkerMutation.mutate({
          companyId: currentCompany.id,
          ...inviteForm,
          designation: finalDesignation,
          department: finalDepartment,
          baseSalary: parseFloat(inviteForm.baseSalary) || 0
        })
      })
      .catch((err) => {
        showError(err?.message || 'Failed to validate invite')
      })
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

  // Handle actions
  const handleViewDetails = (worker) => {
    console.log('View details for:', worker)
    // Navigate to worker details page
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
    console.log('Attendance for:', worker)
    // Navigate to attendance page
  }

  const handleSalary = (worker) => {
    console.log('Salary for:', worker)
    // Navigate to salary page
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
      // Remove any non-digit characters
      const cleanPhone = phone.replace(/\D/g, '')
      window.open(`https://wa.me/${cleanPhone}`, '_blank')
    }
  }

  const handleGenerateReport = (worker) => {
    console.log('Generate report for:', worker)
    // Generate report logic
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

  // Format employee ID for display
  const formatEmployeeId = (employeeId) => {
    if (!employeeId) return '—'
    // If it's already a number, pad it
    if (/^\d+$/.test(employeeId)) {
      return employeeId.padStart(3, '0')
    }
    return employeeId
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Worker Management</h1>
          <p className="text-muted-foreground">
            Manage your workers, track attendance, and handle salaries
          </p>
        </div>
        {canAddWorker && currentCompany && (
          <div className="flex items-center gap-3">
            <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Worker
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Worker</DialogTitle>
                  <DialogDescription>
                    Create a new worker account directly
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddWorker}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={workerForm.name}
                          onChange={(e) => setWorkerForm({...workerForm, name: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={workerForm.email}
                          onChange={(e) => setWorkerForm({...workerForm, email: e.target.value})}
                          required
                        />
                        {addErrors.email && (
                          <p className="text-xs text-red-600 mt-1">{addErrors.email}</p>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={workerForm.phone}
                          onChange={(e) => setWorkerForm({...workerForm, phone: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="employeeId">Employee ID *</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="employeeId"
                            value={workerForm.employeeId}
                            onChange={(e) => setWorkerForm({...workerForm, employeeId: e.target.value})}
                            required
                            className="font-mono flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const nextId = parseInt(nextEmployeeId) || 1
                              setWorkerForm(prev => ({ 
                                ...prev, 
                                employeeId: nextId.toString().padStart(3, '0') 
                              }))
                            }}
                          >
                            Auto
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Next available: {nextEmployeeId}
                        </p>
                        {addErrors.employeeId && (
                          <p className="text-xs text-red-600 mt-1">{addErrors.employeeId}</p>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="designation">Designation</Label>
                        <Select
                          value={workerForm.designation}
                          onValueChange={(value) => setWorkerForm({...workerForm, designation: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select designation" />
                          </SelectTrigger>
                          <SelectContent>
                            {designationOptions.map(option => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {workerForm.designation === 'Other' && (
                          <Input
                            placeholder="Enter custom designation"
                            value={workerForm.customDesignation}
                            onChange={(e) => setWorkerForm({...workerForm, customDesignation: e.target.value})}
                            className="mt-2"
                          />
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <Select
                          value={workerForm.department}
                          onValueChange={(value) => setWorkerForm({...workerForm, department: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            {departmentOptions.map(option => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {workerForm.department === 'Other' && (
                          <Input
                            placeholder="Enter custom department"
                            value={workerForm.customDepartment}
                            onChange={(e) => setWorkerForm({...workerForm, customDepartment: e.target.value})}
                            className="mt-2"
                          />
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="role">Role *</Label>
                        <Select
                          value={workerForm.role}
                          onValueChange={(value) => setWorkerForm({...workerForm, role: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            {allowedRoles.map(role => (
                              <SelectItem key={role} value={role}>
                                {role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="baseSalary">Base Salary</Label>
                        <Input
                          id="baseSalary"
                          type="number"
                          value={workerForm.baseSalary}
                          onChange={(e) => setWorkerForm({...workerForm, baseSalary: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="joiningDate">Joining Date</Label>
                      <Input
                        id="joiningDate"
                        type="date"
                        value={workerForm.joiningDate}
                        onChange={(e) => setWorkerForm({...workerForm, joiningDate: e.target.value})}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="submit"
                      disabled={createWorkerMutation.isPending}
                    >
                      {createWorkerMutation.isPending ? 'Adding...' : 'Add Worker'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={openInviteDialog} onOpenChange={setOpenInviteDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <MailIcon className="mr-2 h-4 w-4" />
                  Invite Worker
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Invite Worker</DialogTitle>
                  <DialogDescription>
                    Send an invitation email to join your company
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleInviteWorker}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="invite-name">Full Name *</Label>
                        <Input
                          id="invite-name"
                          value={inviteForm.name}
                          onChange={(e) => setInviteForm({...inviteForm, name: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="invite-email">Email *</Label>
                        <Input
                          id="invite-email"
                          type="email"
                          value={inviteForm.email}
                          onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})}
                          required
                        />
                          {inviteErrors.email && (
                            <p className="text-xs text-red-600 mt-1">{inviteErrors.email}</p>
                          )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="invite-phone">Phone</Label>
                        <Input
                          id="invite-phone"
                          value={inviteForm.phone}
                          onChange={(e) => setInviteForm({...inviteForm, phone: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="invite-employeeId">Employee ID *</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="invite-employeeId"
                            value={inviteForm.employeeId}
                            onChange={(e) => setInviteForm({...inviteForm, employeeId: e.target.value})}
                            required
                            className="font-mono flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const nextId = parseInt(nextEmployeeId) || 1
                              setInviteForm(prev => ({ 
                                ...prev, 
                                employeeId: nextId.toString().padStart(3, '0') 
                              }))
                            }}
                          >
                            Auto
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Next available: {nextEmployeeId}
                        </p>
                          {inviteErrors.employeeId && (
                            <p className="text-xs text-red-600 mt-1">{inviteErrors.employeeId}</p>
                          )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="invite-designation">Designation</Label>
                        <Select
                          value={inviteForm.designation}
                          onValueChange={(value) => setInviteForm({...inviteForm, designation: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select designation" />
                          </SelectTrigger>
                          <SelectContent>
                            {designationOptions.map(option => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {inviteForm.designation === 'Other' && (
                          <Input
                            placeholder="Enter custom designation"
                            value={inviteForm.customDesignation}
                            onChange={(e) => setInviteForm({...inviteForm, customDesignation: e.target.value})}
                            className="mt-2"
                          />
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="invite-department">Department</Label>
                        <Select
                          value={inviteForm.department}
                          onValueChange={(value) => setInviteForm({...inviteForm, department: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            {departmentOptions.map(option => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {inviteForm.department === 'Other' && (
                          <Input
                            placeholder="Enter custom department"
                            value={inviteForm.customDepartment}
                            onChange={(e) => setInviteForm({...inviteForm, customDepartment: e.target.value})}
                            className="mt-2"
                          />
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="invite-role">Role *</Label>
                        <Select
                          value={inviteForm.role}
                          onValueChange={(value) => setInviteForm({...inviteForm, role: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            {allowedRoles.map(role => (
                              <SelectItem key={role} value={role}>
                                {role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="invite-salary">Base Salary</Label>
                        <Input
                          id="invite-salary"
                          type="number"
                          value={inviteForm.baseSalary}
                          onChange={(e) => setInviteForm({...inviteForm, baseSalary: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="invite-joiningDate">Joining Date</Label>
                      <Input
                        id="invite-joiningDate"
                        type="date"
                        value={inviteForm.joiningDate}
                        onChange={(e) => setInviteForm({...inviteForm, joiningDate: e.target.value})}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="submit"
                      disabled={inviteWorkerMutation.isPending}
                    >
                      {inviteWorkerMutation.isPending ? 'Sending...' : 'Send Invitation'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Workers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
            <p className="text-xs text-muted-foreground">
              {activeWorkers} active workers
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present Today</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{presentToday}</div>
            <p className="text-xs text-muted-foreground">
              {attendanceData?.percentage || 0}% attendance rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Salary</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳{monthlySalary.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              This month's salary payout
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Employee ID</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{nextEmployeeId}</div>
            <p className="text-xs text-muted-foreground">
              Auto-generated serial number
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Workers Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Workers</CardTitle>
              <CardDescription>
                List of all workers in your company
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search workers..."
                  className="w-64 pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-[120px]">
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
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
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
              >
                Retry
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Worker</TableHead>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Role & Department</TableHead>
                    <TableHead>Salary</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
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
                                  Joined {format(new Date(workerJoiningDate), 'MMM dd, yyyy')}
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
                              variant={workerStatus === 'active' ? 'default' : 'secondary'}
                              className={
                                workerStatus === 'active' 
                                  ? 'bg-green-500 hover:bg-green-600' 
                                  : workerStatus === 'inactive'
                                  ? 'bg-yellow-500 hover:bg-yellow-600'
                                  : 'bg-red-500 hover:bg-red-600'
                              }
                            >
                              {workerStatus.charAt(0).toUpperCase() + workerStatus.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
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
                                <DropdownMenuItem onClick={() => handleEdit(worker)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Worker
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleAttendance(worker)}>
                                  <Calendar className="mr-2 h-4 w-4" />
                                  Attendance
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleSalary(worker)}>
                                  <DollarSign className="mr-2 h-4 w-4" />
                                  Salary & Payments
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
                          </TableCell>
                        </TableRow>
                      )
                    })}
                </TableBody>
              </Table>

              {workers.length === 0 && (
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} workers
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
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
                          onClick={() => setPage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Worker Dialog */}
      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Worker</DialogTitle>
            <DialogDescription>
              Update worker information
            </DialogDescription>
          </DialogHeader>
          {selectedWorker && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-designation">Designation</Label>
                  <Select
                    value={editForm.designation}
                    onValueChange={(value) => setEditForm({...editForm, designation: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select designation" />
                    </SelectTrigger>
                    <SelectContent>
                      {designationOptions.map(option => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {editForm.designation === 'Other' && (
                    <Input
                      placeholder="Enter custom designation"
                      value={editForm.customDesignation}
                      onChange={(e) => setEditForm({...editForm, customDesignation: e.target.value})}
                      className="mt-2"
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-department">Department</Label>
                  <Select
                    value={editForm.department}
                    onValueChange={(value) => setEditForm({...editForm, department: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departmentOptions.map(option => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {editForm.department === 'Other' && (
                    <Input
                      placeholder="Enter custom department"
                      value={editForm.customDepartment}
                      onChange={(e) => setEditForm({...editForm, customDepartment: e.target.value})}
                      className="mt-2"
                    />
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-role">Role</Label>
                  <Select
                    value={editForm.role}
                    onValueChange={(value) => setEditForm({...editForm, role: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {allowedRoles.map(role => (
                        <SelectItem key={role} value={role}>
                          {role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-salary">Base Salary</Label>
                  <Input
                    id="edit-salary"
                    type="number"
                    value={editForm.baseSalary}
                    onChange={(e) => setEditForm({...editForm, baseSalary: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={editForm.status}
                  onValueChange={(value) => setEditForm({...editForm, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="on_leave">On Leave</SelectItem>
                    <SelectItem value="terminated">Terminated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenEditDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditWorker}
              disabled={updateWorkerMutation.isPending}
            >
              {updateWorkerMutation.isPending ? 'Updating...' : 'Update Worker'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Worker</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedWorker?.user?.name || selectedWorker?.name || 'this worker'}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteWorker}
              disabled={deleteWorkerMutation.isPending}
            >
              {deleteWorkerMutation.isPending ? 'Deleting...' : 'Delete Worker'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Workers