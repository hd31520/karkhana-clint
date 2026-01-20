import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import api from '../../utils/api'
import { useToast } from '../../contexts/ToastContext'
import { useAuth } from '../../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react'

const CompleteRegistration = () => {
  const { token } = useParams()
  const navigate = useNavigate()
  const { updateUser } = useAuth()
  const { showSuccess, showError } = useToast()
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const completeRegistrationMutation = useMutation({
    mutationFn: (data) => 
      api.post(`/workers/complete-registration/${token}`, data),
    onSuccess: (data) => {
      // Set auth tokens
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      
      // Update auth context
      updateUser(data.user)
      
      showSuccess('Registration completed successfully!')
      setCompleted(true)
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/dashboard')
      }, 2000)
    },
    onError: (error) => {
      showError(error.message || 'Failed to complete registration')
      
      // Handle specific errors
      if (error.message?.includes('expired')) {
        setErrors({
          general: 'This invitation link has expired. Please contact your administrator for a new invitation.'
        })
      } else if (error.message?.includes('Invalid')) {
        setErrors({
          general: 'Invalid invitation link. Please check the link or contact your administrator.'
        })
      }
    }
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (validateForm()) {
      completeRegistrationMutation.mutate({ password: formData.password })
    }
  }

  if (completed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto mb-4">
              <div className="relative">
                <CheckCircle className="h-20 w-20 text-green-500 mx-auto" />
                <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20"></div>
              </div>
            </div>
            <CardTitle className="text-2xl">Registration Complete!</CardTitle>
            <CardDescription className="text-lg">
              Your account has been successfully created
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                <p className="text-green-800">
                  You will be redirected to your dashboard in a moment...
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-center">
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')}
              className="mt-4"
            >
              Go to Dashboard Now
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Complete Your Registration</CardTitle>
          <CardDescription>
            Set your password to complete your account setup
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {errors.general && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                <p className="text-red-800">
                  {errors.general}
                </p>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className={`pr-10 ${errors.password ? 'border-red-500' : ''}`}
                    disabled={completeRegistrationMutation.isPending}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Must be at least 6 characters long
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    className={`pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                    disabled={completeRegistrationMutation.isPending}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">{errors.confirmPassword}</p>
                )}
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-11"
              disabled={completeRegistrationMutation.isPending}
            >
              {completeRegistrationMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Completing Registration...
                </>
              ) : (
                'Complete Registration'
              )}
            </Button>
          </form>
        </CardContent>
        
        <CardFooter className="flex-col space-y-2">
          <p className="text-sm text-muted-foreground text-center">
            By completing registration, you agree to our Terms of Service and Privacy Policy
          </p>
          <Button
            variant="link"
            size="sm"
            onClick={() => navigate('/login')}
            className="text-sm"
          >
            Already have an account? Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default CompleteRegistration