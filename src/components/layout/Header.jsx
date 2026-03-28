import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { Button } from '../ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Bell, Moon, Sun, User, Settings, LogOut, Home, LayoutDashboardIcon } from 'lucide-react'
import { Badge } from '../ui/badge'

const Header = ({ admin = false, onMobileToggle = () => {} }) => {
  const { user, logout, currentCompany, isAuthenticated } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [notifications] = useState(3)

  const handleLogout = () => {
    logout()
  }

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U'
  }

  return (
    // Hide header completely when user is not authenticated
    !isAuthenticated ? null : (
    <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-gray-800 dark:bg-gray-900/95">
      <div className="flex min-h-16 items-center justify-between gap-3 px-3 py-2 sm:px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-2 sm:gap-4">
          <div className="md:hidden">
            <button onClick={onMobileToggle} className="mr-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Open menu">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
              <span className="sr-only">Open menu</span>
            </button>
          </div>
          {admin ? (
            <h1 className="truncate text-base font-bold sm:text-xl">Admin Dashboard</h1>
          ) : (
            <Link to="/" className="flex min-w-0 items-center gap-2">
              <Home className="h-5 w-5 shrink-0 sm:h-6 sm:w-6" />
              <span className="truncate text-base font-bold sm:text-xl">Karkhana.shop</span>
            </Link>
          )}
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative hidden sm:inline-flex">
                <Bell className="h-5 w-5" />
                {notifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center">
                    {notifications}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-60 overflow-auto">
                <DropdownMenuItem>New worker registered</DropdownMenuItem>
                <DropdownMenuItem>Low stock alert</DropdownMenuItem>
                <DropdownMenuItem>Salary payment due</DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full sm:h-9 sm:w-9">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                  {user?.role && (
                    <Badge variant="outline" className="mt-1 w-fit">
                      {user.role}
                    </Badge>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => {
                const cid = currentCompany?._id || currentCompany?.id || user?.company?._id || user?.company?.id
                navigate(cid ? `/dashboard/profile` : '/dashboard/profile')
              }}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/dashboard/')}>
                <LayoutDashboardIcon className="mr-2 h-4 w-4" />
                Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/dashboard/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
    )
  )
}

export default Header
