import { Link } from 'react-router-dom'
import { Home, Search } from 'lucide-react'
import { Button } from '../ui/button'

const NotFound = ({ message = 'Page not found', showHomeButton = true }) => {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-4 text-center">
      <div className="mb-6 rounded-full bg-gray-100 p-4 dark:bg-gray-800">
        <Search className="h-16 w-16 text-gray-400 dark:text-gray-500" />
      </div>
      
      <h1 className="mb-2 text-4xl font-bold text-gray-900 dark:text-white">404</h1>
      
      <h2 className="mb-4 text-2xl font-semibold text-gray-700 dark:text-gray-300">
        {message}
      </h2>
      
      <p className="mb-8 max-w-md text-gray-600 dark:text-gray-400">
        The page you are looking for might have been removed, had its name changed, 
        or is temporarily unavailable.
      </p>
      
      <div className="flex flex-col gap-3 sm:flex-row">
        {showHomeButton && (
          <Button asChild>
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Go to Homepage
            </Link>
          </Button>
        )}
        
        <Button variant="outline" onClick={() => window.history.back()}>
          Go Back
        </Button>
        
        <Button variant="ghost" onClick={() => window.location.reload()}>
          Refresh Page
        </Button>
      </div>
      
      <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
        <p>If you believe this is an error, please contact support.</p>
        <p className="mt-1">Error Code: 404_NOT_FOUND</p>
      </div>
    </div>
  )
}

export default NotFound