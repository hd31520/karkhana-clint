import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../utils/api'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from 'react-hot-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar'
import { Badge } from '../../components/ui/badge'
import { Separator } from '../../components/ui/separator'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  CreditCard, 
  Bell,
  Camera,
  Save,
  Edit,
  Eye,
  EyeOff,
  Users,
  Check,
  Upload,
  Loader2,
  AlertCircle,
  Zap,
  Star,
  Crown,
  ChevronRight,
  ExternalLink
} from 'lucide-react'

const Profile = () => {
  const [activeTab, setActiveTab] = useState('personal')
  const [showPassword, setShowPassword] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  
  // Get route parameters and auth context
  const params = useParams()
  const routeCompanyId = params.companyId
  const { currentCompany } = useAuth()
  const queryClient = useQueryClient()
  const fileInputRef = useRef(null)

  // Fetch user profile
  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => api.get('/users/me'),
    staleTime: 0,
    refetchOnWindowFocus: true,
  })

  const userData = profileData?.user || {}

  // Fetch subscription data
  const { data: subscriptionResp, isLoading: subscriptionLoading } = useQuery({
    queryKey: ['subscription', routeCompanyId || currentCompany?.id || currentCompany?._id],
    queryFn: async () => {
      try {
        const cid = routeCompanyId || currentCompany?.id || currentCompany?._id
        if (!cid) {
          // Return empty subscription if no company is selected
          return { subscription: null }
        }
        const response = await api.get(`/subscriptions/company/${cid}`)
        return response.data
      } catch (error) {
        console.error('Subscription fetch error:', error)
        // Return empty subscription on error
        return { subscription: null }
      }
    },
    enabled: !!(routeCompanyId || currentCompany),
    retry: 1,
  })

  // Get subscription data with fallback
  const subscriptionData = subscriptionResp?.subscription || subscriptionResp || {}

  // Fetch available plans from server
  const { data: plansResp, isLoading: plansLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      try {
        const response = await api.get('/subscriptions/plans')
        return response.data
      } catch (error) {
        console.error('Plans fetch error:', error)
        // Return default plans if API fails
        return {
          plans: {
            free: {
              name: 'Free',
              monthlyFee: 0,
              workerLimit: 5,
              features: [
                'Up to 5 workers',
                'Basic analytics',
                'Email support',
                '1 company'
              ]
            },
            pro: {
              name: 'Pro',
              monthlyFee: 299,
              workerLimit: 50,
              features: [
                'Up to 50 workers',
                'Advanced analytics',
                'Priority support',
                'Multiple companies',
                'Custom reports'
              ]
            },
            enterprise: {
              name: 'Enterprise',
              monthlyFee: 999,
              workerLimit: Infinity,
              features: [
                'Unlimited workers',
                'All Pro features',
                '24/7 phone support',
                'Custom integrations',
                'Dedicated account manager'
              ]
            }
          }
        }
      }
    },
  })

  const plans = plansResp?.plans || {}

  // Fetch notification settings
  const { data: notificationsResp } = useQuery({ 
    queryKey: ['notifications'], 
    queryFn: () => api.get('/users/me/notifications').then(res => res.data),
    enabled: false 
  })
  
  const notificationSettings = notificationsResp?.settings || { 
    email: { newOrders: true, promotions: true, security: true }, 
    push: { newOrders: true, promotions: false, security: true } 
  }

  // Local form state for editable fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    bio: '',
    nid: '',
    profileImage: ''
  })

  // Use useCallback to memoize the initialization function
  const initializeFormData = useCallback((data) => {
    return {
      name: data.name || '',
      email: data.email || '',
      phone: data.phone || '',
      address: data.address || '',
      bio: data.bio || '',
      nid: data.nid || '',
      profileImage: data.profileImage || data.avatar || ''
    }
  }, [])

  // Fixed useEffect - only update when userData changes significantly
  useEffect(() => {
    if (userData && Object.keys(userData).length > 0) {
      // Only update if data has actually changed
      const newFormData = initializeFormData(userData)
      
      // Check if any field has actually changed
      const hasChanged = Object.keys(newFormData).some(
        key => newFormData[key] !== formData[key]
      )
      
      if (hasChanged && !isEditing) {
        setFormData(newFormData)
      }
    }
  }, [userData, initializeFormData, isEditing, formData])

  // Get ImgBB API key from environment
  const getImgBBApiKey = useCallback(() => {
    // Check different possible locations for the API key
    const apiKey = 
      import.meta.env?.VITE_IMGBB_API_KEY || 
      process.env.REACT_APP_IMGBB_API_KEY ||
      window.env?.REACT_APP_IMGBB_API_KEY ||
      localStorage.getItem('imgbb_api_key') ||
      'your_imgbb_api_key_here' // Replace with your actual key
    
    return apiKey
  }, [])

  // Upload image to ImgBB (Client-side only)
  const uploadImageToImgBB = useCallback(async (file) => {
    console.log('Starting image upload...', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    })

    // Convert file to base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = async (event) => {
        try {
          const base64String = event.target.result.split(',')[1] // Get base64 data only
          
          const apiKey = getImgBBApiKey()
          console.log('API Key being used:', apiKey ? `${apiKey.substring(0, 10)}...` : 'No key found')

          if (!apiKey || apiKey === 'your_imgbb_api_key_here') {
            toast.error(
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">ImgBB API Key Missing</p>
                  <p className="text-sm">Please add your ImgBB API key to .env file</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add: VITE_IMGBB_API_KEY=your_key_here
                  </p>
                </div>
              </div>
            )
            reject(new Error('API key not configured'))
            return
          }

          const formData = new FormData()
          formData.append('image', base64String)
          
          console.log('Sending request to ImgBB...')
          
          const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
            method: 'POST',
            body: formData,
            headers: {
              'Accept': 'application/json'
            }
          })
          
          console.log('Response status:', response.status)
          
          if (!response.ok) {
            const errorText = await response.text()
            console.error('Response error:', errorText)
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          
          const data = await response.json()
          console.log('ImgBB response:', data)
          
          if (data.success) {
            console.log('Upload successful, image URL:', data.data.url)
            resolve(data.data.url)
          } else {
            console.error('ImgBB API error:', data.error)
            throw new Error(data.error?.message || 'Upload failed')
          }
        } catch (error) {
          console.error('Upload error:', error)
          reject(error)
        }
      }
      
      reader.onerror = (error) => {
        console.error('FileReader error:', error)
        reject(new Error('Failed to read file'))
      }
      
      // Read file as data URL
      reader.readAsDataURL(file)
    })
  }, [getImgBBApiKey])

  // Update profile mutation
  const updateMutation = useMutation({
    mutationFn: (payload) => api.put('/users/me', payload),
    onSuccess: (data) => {
      toast.success('Profile updated successfully')
      queryClient.invalidateQueries(['profile'])
      setIsEditing(false)
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    }
  })

  // Mutation to change subscription plan
  const changePlanMutation = useMutation({
    mutationFn: ({ companyId, plan }) => api.put(`/subscriptions/company/${companyId}`, { plan }),
    onSuccess: (res) => {
      toast.success('Subscription updated successfully!')
      queryClient.invalidateQueries(['subscription'])
      queryClient.invalidateQueries(['plans'])
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to change plan. Please try again.')
    }
  })

  // Handle image upload
  const handleImageUpload = useCallback(async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, GIF, WebP)')
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      toast.error('Image size should be less than 5MB')
      return
    }

    setIsUploading(true)
    try {
      // Upload to ImgBB
      const imageUrl = await uploadImageToImgBB(file)
      
      // Update local state with new image URL
      setFormData(prev => ({ ...prev, profileImage: imageUrl }))
      
      // Auto-save the profile image
      updateMutation.mutate({ profileImage: imageUrl })
      
    } catch (error) {
      console.error('Upload failed:', error)
      
      // Provide helpful error messages
      if (error.message.includes('API key') || error.message.includes('key')) {
        toast.error(
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">API Key Issue</p>
              <p className="text-sm">Please check your ImgBB API key configuration</p>
            </div>
          </div>
        )
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        toast.error('Network error. Please check your internet connection.')
      } else if (error.message.includes('size') || error.message.includes('large')) {
        toast.error('File is too large. Maximum size is 5MB.')
      } else {
        toast.error(`Upload failed: ${error.message}`)
      }
    } finally {
      setIsUploading(false)
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }, [uploadImageToImgBB, updateMutation])

  // Handle form field changes
  const handleChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  // Handle save profile
  const handleSaveProfile = useCallback(() => {
    // Validate required fields
    if (!formData.name || formData.name.trim() === '') {
      toast.error('Name is required')
      return
    }

    // Validate NID if provided (10-17 digits)
    if (formData.nid && !/^\d{10,17}$/.test(formData.nid)) {
      toast.error('NID must be 10-17 digits')
      return
    }

    // Validate phone if provided
    if (formData.phone && !/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
      toast.error('Please enter a valid phone number')
      return
    }

    const payload = {
      name: formData.name.trim(),
      phone: formData.phone?.trim() || '',
      address: formData.address?.trim() || '',
      bio: formData.bio?.trim() || '',
      nid: formData.nid?.trim() || '',
      profileImage: formData.profileImage || ''
    }

    console.log('Saving profile data:', payload)
    updateMutation.mutate(payload)
  }, [formData, updateMutation])

  // Handle cancel edit
  const handleCancelEdit = useCallback(() => {
    const resetData = {
      name: userData.name || '',
      email: userData.email || '',
      phone: userData.phone || '',
      address: userData.address || '',
      bio: userData.bio || '',
      nid: userData.nid || '',
      profileImage: userData.profileImage || userData.avatar || ''
    }
    setFormData(resetData)
    setIsEditing(false)
  }, [userData])

  // Password update functionality
  const changePasswordMutation = useMutation({
    mutationFn: (passwordData) => api.put('/users/me/password', passwordData),
    onSuccess: () => {
      toast.success('Password updated successfully')
      setShowPassword(false)
      // Clear password fields
      const currentPassEl = document.getElementById('current-password')
      const newPassEl = document.getElementById('new-password')
      const confirmPassEl = document.getElementById('confirm-password')
      
      if (currentPassEl) currentPassEl.value = ''
      if (newPassEl) newPassEl.value = ''
      if (confirmPassEl) confirmPassEl.value = ''
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update password')
    }
  })

  const handlePasswordUpdate = useCallback(() => {
    const currentPassword = document.getElementById('current-password')?.value || ''
    const newPassword = document.getElementById('new-password')?.value || ''
    const confirmPassword = document.getElementById('confirm-password')?.value || ''

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('All password fields are required')
      return
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    changePasswordMutation.mutate({
      currentPassword,
      newPassword
    })
  }, [changePasswordMutation])

  // Handle plan change
  const handlePlanChange = useCallback((planKey) => {
    const companyId = routeCompanyId || currentCompany?._id || currentCompany?.id
    if (!companyId) {
      toast.error('Please select a company first')
      return
    }
    
    if (changePlanMutation.isLoading) return
    
    // Confirm before changing plan
    const plan = plans[planKey]
    if (plan && confirm(`Are you sure you want to change to ${plan.name} plan for ৳${plan.monthlyFee}/month?`)) {
      changePlanMutation.mutate({ companyId, plan: planKey })
    }
  }, [routeCompanyId, currentCompany, changePlanMutation, plans])

  // Format date
  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'N/A'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch (error) {
      return 'Invalid date'
    }
  }, [])

  // Get plan icon
  const getPlanIcon = useCallback((planName) => {
    switch (planName?.toLowerCase()) {
      case 'enterprise':
        return <Crown className="h-5 w-5" />
      case 'pro':
        return <Zap className="h-5 w-5" />
      case 'premium':
        return <Star className="h-5 w-5" />
      default:
        return <Users className="h-5 w-5" />
    }
  }, [])

  // Get plan color
  const getPlanColor = useCallback((planName) => {
    switch (planName?.toLowerCase()) {
      case 'enterprise':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      case 'pro':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'premium':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    }
  }, [])

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={handleCancelEdit}
                disabled={updateMutation.isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveProfile}
                disabled={updateMutation.isLoading || isUploading}
              >
                {updateMutation.isLoading ? (
                  <>
                    <Save className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="subscription">Subscription</TabsTrigger>
            </TabsList>
            
            <TabsContent value="personal" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your personal details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={formData.profileImage} alt={formData.name || 'User'} />
                        <AvatarFallback className="text-2xl">
                          {(formData.name || '').split(' ').map(n => n[0]).join('') || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      {isEditing && (
                        <>
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            accept="image/*"
                            className="hidden"
                            disabled={isUploading}
                          />
                          <button 
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="absolute bottom-0 right-0 rounded-full bg-primary p-2 text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            title="Change profile picture"
                          >
                            {isUploading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Camera className="h-4 w-4" />
                            )}
                          </button>
                        </>
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{formData.name || 'Unnamed User'}</h3>
                      <p className="text-muted-foreground">{userData.role || 'User'}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="outline">{userData.company || 'No Company'}</Badge>
                        <Badge variant="secondary">
                          Member since {userData.joinDate || 'Unknown'}
                        </Badge>
                      </div>
                      {isEditing && (
                        <div className="mt-3 flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                          >
                            {isUploading ? (
                              <>
                                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="mr-2 h-3 w-3" />
                                Change Photo
                              </>
                            )}
                          </Button>
                          {formData.profileImage && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, profileImage: '' }))
                                toast.success('Image removed')
                              }}
                              disabled={isUploading}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        Full Name <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleChange('name', e.target.value)}
                          className="pl-9"
                          disabled={!isEditing}
                          placeholder="Enter your full name"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          className="pl-9"
                          disabled
                          readOnly
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => handleChange('phone', e.target.value)}
                          className="pl-9"
                          disabled={!isEditing}
                          placeholder="+880 1234 567890"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="nid">NID Number</Label>
                      <div className="relative">
                        <Input
                          id="nid"
                          value={formData.nid}
                          onChange={(e) => handleChange('nid', e.target.value.replace(/\D/g, ''))}
                          disabled={!isEditing}
                          placeholder="1234567890123"
                          maxLength={17}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        10-17 digits. Example: 1234567890123
                      </p>
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address">Address</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Textarea
                          id="address"
                          value={formData.address}
                          onChange={(e) => handleChange('address', e.target.value)}
                          className="pl-9"
                          disabled={!isEditing}
                          rows={3}
                          placeholder="Enter your complete address"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => handleChange('bio', e.target.value)}
                        disabled={!isEditing}
                        rows={4}
                        placeholder="Tell us about yourself, your experience, or anything you'd like to share..."
                        maxLength={500}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Brief introduction about yourself</span>
                        <span>{formData.bio.length}/500 characters</span>
                      </div>
                    </div>
                  </div>
                  
                  {isEditing && (
                    <div className="pt-4 border-t">
                      <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                        <AlertCircle className="h-4 w-4" />
                        <span>Note: Image upload requires a valid ImgBB API key</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>
                    Update your password to keep your account secure
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">
                      Current Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="current-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your current password"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="new-password">
                      New Password <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="new-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter new password (minimum 6 characters)"
                      className="pr-10"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">
                      Confirm New Password <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="confirm-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Confirm your new password"
                      className="pr-10"
                    />
                  </div>
                  
                  <Button 
                    onClick={handlePasswordUpdate}
                    disabled={changePasswordMutation.isLoading}
                    className="w-full sm:w-auto"
                  >
                    {changePasswordMutation.isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Update Password'
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Two-Factor Authentication</CardTitle>
                  <CardDescription>
                    Add an extra layer of security to your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium">2FA Status</h4>
                        <p className="text-sm text-muted-foreground">
                          Two-factor authentication is currently disabled
                        </p>
                      </div>
                    </div>
                    <Button variant="outline">Enable 2FA</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Email Notifications</CardTitle>
                  <CardDescription>
                    Choose what email notifications you want to receive
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(notificationSettings.email).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <h4 className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()} Updates</h4>
                        <p className="text-sm text-muted-foreground">
                          Get notified about {key.replace(/([A-Z])/g, ' $1').toLowerCase().trim()} related activities
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked={value}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Push Notifications</CardTitle>
                  <CardDescription>
                    Control push notifications on your devices
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(notificationSettings.push).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <h4 className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()} Alerts</h4>
                        <p className="text-sm text-muted-foreground">
                          Receive push notifications for {key.replace(/([A-Z])/g, ' $1').toLowerCase().trim()}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked={value}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="subscription">
              <Card>
                <CardHeader>
                  <CardTitle>Subscription Details</CardTitle>
                  <CardDescription>
                    Manage your subscription plan and billing information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Current Subscription Status */}
                  <div className="rounded-lg border p-6 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`p-2 rounded-lg ${getPlanColor(subscriptionData.plan)}`}>
                            {getPlanIcon(subscriptionData.plan)}
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold">
                              {subscriptionData.plan ? `${subscriptionData.plan} Plan` : 'No Active Plan'}
                            </h3>
                            <p className="text-muted-foreground">
                              {subscriptionData.plan ? 
                                `৳${plans[subscriptionData.plan]?.monthlyFee || 0}/month` : 
                                'You are currently on the free trial'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">Workers Limit</span>
                            </div>
                            <p className="text-2xl font-bold">
                              {subscriptionData.workerLimit === Infinity ? 
                                'Unlimited' : 
                                subscriptionData.workerLimit || plans[subscriptionData.plan]?.workerLimit || 0}
                            </p>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">Status</span>
                            </div>
                            <div>
                              <Badge 
                                variant={
                                  subscriptionData.status === 'active' ? 'default' :
                                  subscriptionData.status === 'canceled' ? 'destructive' :
                                  subscriptionData.status === 'pending' ? 'secondary' : 'outline'
                                }
                                className="text-lg py-1 px-3"
                              >
                                {subscriptionData.status || 'inactive'}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">Next Billing</span>
                            </div>
                            <p className="text-lg font-semibold">
                              {subscriptionData.nextBillingDate ? 
                                formatDate(subscriptionData.nextBillingDate) : 
                                'No billing scheduled'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-3">
                        <Button 
                          variant="outline" 
                          className="gap-2"
                          onClick={() => toast.info('Billing details page coming soon!')}
                        >
                          <CreditCard className="h-4 w-4" />
                          Billing Details
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => toast.info('Invoice download feature coming soon!')}
                        >
                          Download Invoice
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Plan Features */}
                  {subscriptionData.plan && (
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold">Plan Features</h4>
                      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {(plans[subscriptionData.plan]?.features || []).map((feature, index) => (
                          <div 
                            key={index} 
                            className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
                          >
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                              <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                            </div>
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* Available Plans */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold">Available Plans</h4>
                        <p className="text-sm text-muted-foreground">
                          Choose the plan that best fits your needs
                        </p>
                      </div>
                      <Badge variant="outline" className="gap-1">
                        <Users className="h-3 w-3" />
                        {currentCompany?.name || 'No company selected'}
                      </Badge>
                    </div>

                    {plansLoading ? (
                      <div className="flex items-center justify-center p-8">
                        <div className="text-center">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3" />
                          <p className="text-muted-foreground">Loading plans...</p>
                        </div>
                      </div>
                    ) : Object.keys(plans).length === 0 ? (
                      <div className="text-center p-8 border rounded-lg">
                        <AlertCircle className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                        <h5 className="font-medium mb-2">No plans available</h5>
                        <p className="text-sm text-muted-foreground">
                          Please contact support to set up your subscription
                        </p>
                      </div>
                    ) : (
                      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {Object.entries(plans).map(([key, plan]) => {
                          const isCurrent = subscriptionData.plan === key
                          const isPopular = key === 'pro'
                          
                          return (
                            <div 
                              key={key} 
                              className={`rounded-xl border-2 p-6 relative transition-all hover:shadow-lg ${
                                isCurrent 
                                  ? 'border-primary bg-primary/5' 
                                  : 'border-gray-200 dark:border-gray-800'
                              } ${isPopular ? 'ring-2 ring-primary/20' : ''}`}
                            >
                              {isPopular && (
                                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                  <Badge className="px-3 py-1">Most Popular</Badge>
                                </div>
                              )}
                              
                              <div className="mb-6">
                                <div className="flex items-center justify-between mb-2">
                                  <h5 className="font-bold text-lg">{plan.name}</h5>
                                  {isCurrent && (
                                    <Badge variant="secondary" className="text-xs">
                                      Current
                                    </Badge>
                                  )}
                                </div>
                                
                                <div className="mb-4">
                                  <div className="flex items-baseline">
                                    <span className="text-3xl font-bold">৳{plan.monthlyFee}</span>
                                    <span className="text-muted-foreground ml-2">/month</span>
                                  </div>
                                  {plan.monthlyFee === 0 && (
                                    <p className="text-sm text-green-600 font-medium mt-1">Free forever</p>
                                  )}
                                </div>
                                
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                                  <Users className="h-4 w-4" />
                                  <span>
                                    {plan.workerLimit === Infinity ? 'Unlimited' : plan.workerLimit} workers
                                  </span>
                                </div>
                              </div>
                              
                              <div className="space-y-3 mb-6">
                                {(plan.features || []).map((feature, index) => (
                                  <div key={index} className="flex items-start gap-2">
                                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm">{feature}</span>
                                  </div>
                                ))}
                              </div>
                              
                              <Button
                                className="w-full gap-2"
                                variant={isCurrent ? 'outline' : 'default'}
                                disabled={isCurrent || changePlanMutation.isLoading}
                                onClick={() => handlePlanChange(key)}
                              >
                                {changePlanMutation.isLoading ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Processing...
                                  </>
                                ) : isCurrent ? (
                                  'Current Plan'
                                ) : (
                                  <>
                                    Select Plan
                                    <ChevronRight className="h-4 w-4" />
                                  </>
                                )}
                              </Button>
                              
                              {isCurrent && subscriptionData.nextBillingDate && (
                                <p className="text-xs text-center text-muted-foreground mt-3">
                                  Next billing: {formatDate(subscriptionData.nextBillingDate)}
                                </p>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Billing History */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold">Billing History</h4>
                    <div className="rounded-lg border overflow-hidden">
                      <div className="grid grid-cols-4 gap-4 p-4 bg-muted font-medium text-sm">
                        <div>Date</div>
                        <div>Description</div>
                        <div>Amount</div>
                        <div>Status</div>
                      </div>
                      
                      {/* Mock billing history - replace with real data */}
                      <div className="grid grid-cols-4 gap-4 p-4 border-t hover:bg-accent">
                        <div>{formatDate(new Date().toISOString())}</div>
                        <div>{subscriptionData.plan || 'Free'} Plan</div>
                        <div>৳{plans[subscriptionData.plan]?.monthlyFee || 0}</div>
                        <div>
                          <Badge variant="default">Paid</Badge>
                        </div>
                      </div>
                      
                      {(!subscriptionData.plan || subscriptionData.plan === 'free') && (
                        <div className="p-8 text-center text-muted-foreground">
                          <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p>No billing history available</p>
                          <p className="text-sm mt-1">
                            Your billing history will appear here once you make a payment
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Support Section */}
                  <div className="rounded-lg border p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                      <div>
                        <h4 className="font-semibold text-lg mb-2">Need help with your subscription?</h4>
                        <p className="text-sm text-muted-foreground">
                          Our support team is here to help you with any questions
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <Button variant="outline" onClick={() => window.open('mailto:support@example.com')}>
                          Contact Support
                        </Button>
                        <Button onClick={() => toast.info('Live chat feature coming soon!')}>
                          Live Chat
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right sidebar - Keep your existing code if any */}
      </div>
    </div>
  )
}

export default Profile