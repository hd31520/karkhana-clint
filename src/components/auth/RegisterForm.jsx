import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Eye, EyeOff, User, Mail, Phone, Building } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import LoadingSpinner from '../shared/LoadingSpinner'
import { validateEmail, validatePhone, validatePassword } from '../../utils/validators'
import { COMPANY_TYPES, FACTORY_CATEGORIES } from '../../utils/constants'

const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [companyType, setCompanyType] = useState('factory')
  const { register: registerUser, registerLoading, error } = useAuth()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      companyName: '',
      companyType: 'factory',
      factoryCategory: '',
      initialWorkerCount: 1,
      role: 'owner', // Added role field
    },
  })

  const password = watch('password')

  // Update form value when companyType changes
  useEffect(() => {
    setValue('companyType', companyType)
  }, [companyType, setValue])

  const onSubmit = (data) => {
    // Send registration data including company info
    const registrationData = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: data.password,
      role: data.role || 'owner',
      companyName: data.companyName || undefined,
      companyType: data.companyType || undefined,
    }

    registerUser(registrationData)
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Create your account
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Start managing your business efficiently
        </p>
      </div>

      {/* Display auth errors if any */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Personal Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Personal Information
            </h3>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  id="name"
                  placeholder="John Doe"
                  className="pl-10"
                  disabled={registerLoading}
                  {...register('name', {
                    required: 'Full name is required',
                    minLength: {
                      value: 3,
                      message: 'Name must be at least 3 characters',
                    },
                    maxLength: {
                      value: 50,
                      message: 'Name must be less than 50 characters',
                    },
                  })}
                />
              </div>
              {errors.name && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10"
                  disabled={registerLoading}
                  {...register('email', {
                    required: 'Email is required',
                    validate: {
                      emailFormat: (value) => 
                        validateEmail(value) || 'Please enter a valid email address',
                    },
                  })}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="01XXXXXXXXX"
                  className="pl-10"
                  disabled={registerLoading}
                  {...register('phone', {
                    required: 'Phone number is required',
                    validate: {
                      phoneFormat: (value) => 
                        validatePhone(value) || 'Please enter a valid phone number',
                    },
                    pattern: {
                      value: /^[0-9+-\s()]*$/,
                      message: 'Please enter a valid phone number',
                    },
                  })}
                />
              </div>
              {errors.phone && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.phone.message}
                </p>
              )}
            </div>
          </div>

          {/* Company Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Company Information
            </h3>

            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name *</Label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  id="companyName"
                  placeholder="Your Company Name"
                  className="pl-10"
                  disabled={registerLoading}
                  {...register('companyName', {
                    required: 'Company name is required',
                    minLength: {
                      value: 2,
                      message: 'Company name must be at least 2 characters',
                    },
                  })}
                />
              </div>
              {errors.companyName && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.companyName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyType">Business Type *</Label>
              <Select
                value={companyType}
                onValueChange={setCompanyType}
                disabled={registerLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  {COMPANY_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* Hidden input to store the value in react-hook-form */}
              <input type="hidden" {...register('companyType')} />
            </div>

            {companyType === 'factory' && (
              <div className="space-y-2">
                <Label htmlFor="factoryCategory">Factory Category *</Label>
                <Select 
                  disabled={registerLoading}
                  onValueChange={(value) => setValue('factoryCategory', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select factory category" />
                  </SelectTrigger>
                  <SelectContent>
                    {FACTORY_CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {/* Hidden input to store the value in react-hook-form */}
                <input type="hidden" {...register('factoryCategory')} />
                {errors.factoryCategory && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.factoryCategory.message}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="initialWorkerCount">Initial Number of Workers</Label>
              <Input
                id="initialWorkerCount"
                type="number"
                min="1"
                max="100"
                disabled={registerLoading}
                {...register('initialWorkerCount', {
                  required: 'Worker count is required',
                  min: { 
                    value: 1, 
                    message: 'Minimum 1 worker required' 
                  },
                  max: { 
                    value: 100, 
                    message: 'Maximum 100 workers allowed' 
                  },
                  valueAsNumber: true,
                })}
              />
              {errors.initialWorkerCount && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.initialWorkerCount.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Password Section */}
        <div className="space-y-6 border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Security
          </h3>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pr-10"
                  disabled={registerLoading}
                  {...register('password', {
                    required: 'Password is required',
                    validate: {
                      passwordStrength: (value) => 
                        validatePassword(value) || 'Password must be at least 6 characters with one uppercase letter and one number',
                    },
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  disabled={registerLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.password.message}
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Password must be at least 6 characters with one uppercase letter and one number
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pr-10"
                  disabled={registerLoading}
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value) =>
                      value === password || 'Passwords do not match',
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  disabled={registerLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-start space-x-2">
            <input
              type="checkbox"
              id="terms"
              className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600"
              required
              disabled={registerLoading}
            />
            <Label htmlFor="terms" className="text-sm">
              I agree to the{' '}
              <Link to="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </Label>
          </div>

          <div className="flex items-start space-x-2">
            <input
              type="checkbox"
              id="newsletter"
              className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600"
              disabled={registerLoading}
              {...register('newsletter')}
            />
            <Label htmlFor="newsletter" className="text-sm">
              I want to receive updates, tips, and special offers via email
            </Label>
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full" 
          disabled={registerLoading}
        >
          {registerLoading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Creating Account...
            </>
          ) : (
            'Create Account'
          )}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600 dark:text-gray-300">
          Already have an account?{' '}
          <Link 
            to="/login" 
            className="font-medium text-primary hover:underline"
            onClick={(e) => registerLoading && e.preventDefault()}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterForm