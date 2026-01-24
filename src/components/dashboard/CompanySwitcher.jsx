import { useState, useEffect } from 'react'
import { ChevronDown, Building, Plus, Check, LogOut } from 'lucide-react'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../../utils/api'

const CompanySwitcher = () => {
  const { currentCompany, selectCompany, logout } = useAuth()
  const navigate = useNavigate()
  const [selectedCompany, setSelectedCompany] = useState(currentCompany)

  // Fetch user's companies
  const { data: companiesData, isLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: () => api.get('/companies'),
    enabled: true // Always fetch to keep companies list updated
  })

  const companies = companiesData?.companies || []

  // Update selected company when currentCompany changes
  useEffect(() => {
    setSelectedCompany(currentCompany)
  }, [currentCompany])

  const handleCompanySelect = (company) => {
    // Normalize company object to ensure it has both id and _id
    const normalizedCompany = { ...company, id: company.id || company._id, _id: company._id || company.id }
    setSelectedCompany(normalizedCompany)
    selectCompany(normalizedCompany)
  }

  const handleAddCompany = () => {
    navigate('/dashboard/company-select?tab=create-new')
  }

  const handleManageCompanies = () => {
    navigate('/dashboard/company-select')
  }

  const handleLogout = () => {
    logout()
  }

  if (isLoading) {
    return (
      <Button
        variant="outline"
        className="w-full justify-start gap-2 border-0 px-2 text-left hover:bg-transparent"
        disabled
      >
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        <span className="text-sm">Loading...</span>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start gap-2 border-0 px-2 text-left hover:bg-transparent"
        >
          <Building className="h-4 w-4" />
          <div className="flex-1 overflow-hidden">
            <div className="truncate font-medium">
              {selectedCompany?.name || 'No Company Selected'}
            </div>
            <div className="truncate text-xs text-muted-foreground">
              {selectedCompany ? (
                <>
                  {selectedCompany.businessType || selectedCompany.type || 'Business'}
                  {selectedCompany.subscription?.plan && ` • ${selectedCompany.subscription.plan} Plan`}
                </>
              ) : (
                'Select a company'
              )}
            </div>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[300px]">
        <DropdownMenuLabel>Your Companies</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {companies.length > 0 ? (
          companies.map((company) => (
            <DropdownMenuItem
              key={company._id || company.id}
              onClick={() => handleCompanySelect(company)}
              className="flex items-center justify-between py-2"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Building className="h-4 w-4 text-primary" />
                </div>
                <div className="max-w-[200px]">
                  <div className="font-medium truncate">{company.name}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {company.workerCount || 0} workers
                    {company.subscription?.plan && ` • ${company.subscription.plan} Plan`}
                  </div>
                </div>
              </div>
              {(selectedCompany?._id === company._id || selectedCompany?.id === company.id || selectedCompany?.id === company._id || selectedCompany?._id === company.id) && (
                <Check className="h-4 w-4 text-primary flex-shrink-0" />
              )}
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem className="py-2 text-center text-sm text-muted-foreground" disabled>
            No companies found
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleAddCompany} className="py-2">
          <Plus className="mr-2 h-4 w-4" />
          Add New Company
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleManageCompanies} className="py-2">
          <Building className="mr-2 h-4 w-4" />
          Manage All Companies
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="py-2 text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default CompanySwitcher