import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Building, Search, Users, DollarSign, Check } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import api from '../../utils/api'
import { useToast } from '../../contexts/ToastContext'

const normalizeCompany = (company) => ({
  ...company,
  id: company?.id || company?._id,
  _id: company?._id || company?.id
})

const getCompanyId = (company) => company?.id || company?._id || null
const canCreateCompany = (role) => role === 'owner' || role === 'admin'

const CompanySelect = () => {
  const [selectedCompany, setSelectedCompany] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [newCompany, setNewCompany] = useState({
    name: '',
    businessType: '',
    industry: '',
    estimatedWorkers: '',
    subscriptionPlan: 'standard'
  })
  const {
    user,
    selectCompany,
    currentCompany,
    companies,
    companiesLoading,
    companiesFetched,
    refetchCompanies
  } = useAuth()
  const { showSuccess, showError } = useToast()
  const navigate = useNavigate()

  const createCompanyMutation = useMutation({
    mutationFn: (companyData) => api.post('/companies', companyData),
    onSuccess: (data) => {
      const normalizedCompany = normalizeCompany(data.company)
      showSuccess('Company created successfully')
      selectCompany(normalizedCompany)
      refetchCompanies()
      navigate('/dashboard')
    },
    onError: (error) => {
      showError(error?.message || 'Failed to create company')
    }
  })

  useEffect(() => {
    if (!companiesFetched && companiesLoading) return

    if (companies.length === 0) {
      setSelectedCompany(null)
      return
    }

    const targetId = getCompanyId(currentCompany) || getCompanyId(selectedCompany)
    const matchedCompany = companies.find((company) => getCompanyId(company) === targetId)

    if (matchedCompany) {
      setSelectedCompany(normalizeCompany(matchedCompany))
      return
    }

    setSelectedCompany(normalizeCompany(companies[0]))
  }, [currentCompany, companies, companiesFetched, companiesLoading])

  const filteredCompanies = companies.filter(company =>
    company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.businessType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.industry?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleContinue = () => {
    if (!selectedCompany) return
    selectCompany(normalizeCompany(selectedCompany))
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewCompany((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSelectPlan = (plan) => {
    setNewCompany((prev) => ({
      ...prev,
      subscriptionPlan: plan
    }))
  }

  const handleCreateCompany = (e) => {
    e.preventDefault()
    createCompanyMutation.mutate(newCompany)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Select Company</h1>
        <p className="text-muted-foreground">Select the company you want to work with</p>
      </div>

      <Tabs defaultValue="my-companies">
        <TabsList className={`grid w-full ${canCreateCompany(user?.role) ? 'grid-cols-2' : 'grid-cols-1'}`}>
          <TabsTrigger value="my-companies">My Companies</TabsTrigger>
          {canCreateCompany(user?.role) && (
            <TabsTrigger value="create-new">Create New</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="my-companies" className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search companies..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {companiesLoading && !companiesFetched ? (
            <div className="py-12 text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">Loading companies...</p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                {filteredCompanies.map((company) => {
                  const isSelected = getCompanyId(selectedCompany) === getCompanyId(company)

                  return (
                    <Card
                      key={company._id || company.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        isSelected ? 'border-primary ring-2 ring-primary/20' : ''
                      }`}
                      onClick={() => setSelectedCompany(normalizeCompany(company))}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                              <Building className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <CardTitle>{company.name}</CardTitle>
                              <CardDescription>
                                {company.businessType || company.type}
                                {company.industry ? ` - ${company.industry}` : ''}
                              </CardDescription>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="rounded-full bg-primary p-1">
                              <Check className="h-4 w-4 text-white" />
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="text-2xl font-bold">{company.workerCount || 0}</div>
                              <div className="text-xs text-muted-foreground">Workers</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="text-2xl font-bold">৳{company.totalSales?.toLocaleString() || 0}</div>
                              <div className="text-xs text-muted-foreground">Sales</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between border-t pt-4">
                        <div>
                          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            company.status === 'active'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                          }`}>
                            {company.status || 'active'}
                          </span>
                          <span className="ml-2 text-xs text-muted-foreground">
                            {company.subscription?.plan || 'Basic'} Plan
                          </span>
                        </div>
                      </CardFooter>
                    </Card>
                  )
                })}
              </div>

              {filteredCompanies.length === 0 && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Building className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No companies found</h3>
                    <p className="mt-2 text-muted-foreground">
                      {searchTerm ? 'No companies match your search.' : 'No companies available.'}
                    </p>
                  </CardContent>
                </Card>
              )}

              {filteredCompanies.length > 0 && (
                <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-between">
                  <Button variant="outline" asChild className="w-full sm:w-auto">
                    <Link to="/dashboard">Back to Dashboard</Link>
                  </Button>
                  <Button className="w-full sm:w-auto" disabled={!selectedCompany} onClick={handleContinue}>
                    Continue to {selectedCompany?.name || 'Company'}
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>

        {canCreateCompany(user?.role) && (
          <TabsContent value="create-new">
            <form onSubmit={handleCreateCompany}>
              <Card>
                <CardHeader>
                  <CardTitle>Create New Company</CardTitle>
                  <CardDescription>Set up a new business profile</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Company Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Enter company name"
                      value={newCompany.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessType">Business Type *</Label>
                    <select
                      id="businessType"
                      name="businessType"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={newCompany.businessType}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select business type</option>
                      <option value="factory">Factory</option>
                      <option value="shop">Shop</option>
                      <option value="showroom">Showroom</option>
                      <option value="warehouse">Warehouse</option>
                      <option value="service">Service</option>
                      <option value="retail">Retail</option>
                      <option value="wholesale">Wholesale</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry/Category</Label>
                    <Input
                      id="industry"
                      name="industry"
                      placeholder="e.g., Furniture, Textile, Metal Works"
                      value={newCompany.industry}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estimatedWorkers">Estimated Number of Workers</Label>
                    <Input
                      id="estimatedWorkers"
                      name="estimatedWorkers"
                      type="number"
                      min="1"
                      placeholder="Estimated number of workers"
                      value={newCompany.estimatedWorkers}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Subscription Plan *</Label>
                    <div className="grid gap-3 md:grid-cols-3">
                      {['basic', 'standard', 'premium'].map((plan) => (
                        <button
                          key={plan}
                          type="button"
                          className={`rounded-lg border p-4 text-left ${newCompany.subscriptionPlan === plan ? 'border-primary ring-2 ring-primary/20' : ''}`}
                          onClick={() => handleSelectPlan(plan)}
                        >
                          <h4 className="font-semibold capitalize">{plan}</h4>
                          <p className="mt-2 text-sm text-muted-foreground">
                            {plan === 'basic' ? '1-10 Workers' : plan === 'standard' ? '11-20 Workers' : '21-50 Workers'}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={createCompanyMutation.isPending || !newCompany.name || !newCompany.businessType}
                  >
                    {createCompanyMutation.isPending ? 'Creating...' : 'Create Company'}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

export default CompanySelect
