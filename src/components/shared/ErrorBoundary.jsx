import { Component } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '../ui/button'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
    
    // Log error to error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-red-100 p-3 dark:bg-red-900/30">
                <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-400" />
              </div>
              
              <h2 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                Something went wrong
              </h2>
              
              <p className="mb-6 text-gray-600 dark:text-gray-300">
                An unexpected error occurred. Please try again or contact support if the problem persists.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mb-4 w-full overflow-auto rounded bg-gray-100 p-3 text-left text-sm dark:bg-gray-700">
                  <p className="font-medium text-red-600 dark:text-red-400">
                    {this.state.error.toString()}
                  </p>
                  <pre className="mt-2 whitespace-pre-wrap text-xs">
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </div>
              )}
              
              <div className="flex gap-3">
                <Button onClick={this.handleReset} variant="default">
                  Reload Page
                </Button>
                <Button
                  onClick={() => window.location.href = '/'}
                  variant="outline"
                >
                  Go to Home
                </Button>
              </div>
              
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                Error ID: {Date.now()}
              </p>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary