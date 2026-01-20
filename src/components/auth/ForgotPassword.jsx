import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { Mail, CheckCircle } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card'
import LoadingSpinner from '../shared/LoadingSpinner'
import { validateEmail } from '../../utils/validators'

const ForgotPassword = () => {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setIsSubmitted(true)
    }, 1500)
  }

  if (isSubmitted) {
    return (
      <Card className="mx-auto w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            We've sent a password reset link to your email address
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            If you don't see the email, check your spam folder or try again.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button asChild className="w-full">
            <Link to="/login">Back to Login</Link>
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link to="/">Go to Homepage</Link>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Forgot Password</CardTitle>
        <CardDescription>
          Enter your email address and we'll send you a link to reset your password
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="pl-10"
                {...register('email', {
                  required: 'Email is required',
                  validate: (value) => validateEmail(value),
                })}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.email.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <LoadingSpinner size="sm" className="mr-2" />
            ) : null}
            Send Reset Link
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col">
        <div className="text-center text-sm">
          <Link
            to="/login"
            className="font-medium text-primary hover:underline"
          >
            Back to login
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}

export default ForgotPassword