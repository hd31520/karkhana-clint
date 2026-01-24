import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Building, Plus, Search, Users, DollarSign, Check } from 'lucide-react'
import { useQuery, useMutation } from '@tanstack/react-query'
import api from '../../utils/api'
import { useToast } from '../../contexts/ToastContext'

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
  
  const { user, selectCompany, currentCompany } = useAuth()
  const { showSuccess, showError } = useToast()
  const navigate = useNavigate()

  // Fetch user's companies
  const { data: companiesData, isLoading, refetch } = useQuery({
    queryKey: ['companies'],
    queryFn: () => api.get('/companies'),
    enabled: !!user && user.role !== 'admin'
  })

  const companies = companiesData?.companies || []

  // Create company mutation
  const createCompanyMutation = useMutation({
    mutationFn: (companyData) => api.post('/companies', companyData),
    onSuccess: (data) => {
      showSuccess('Company created successfully!')
      refetch()
      // Normalize company object to ensure it has both id and _id
      const normalizedCompany = { ...data.company, id: data.company.id || data.company._id, _id: data.company._id || data.company.id }
      selectCompany(normalizedCompany)
      navigate('/dashboard')
    },
    onError: (error) => {
      showError(error.message || 'Failed to create company')
    }
  })

  // Don't auto-select when user already has a current company
  // Only auto-select if no company is currently selected AND user has exactly one company
  useEffect(() => {
    if (!currentCompany && companies && companies.length === 1) {
      const onlyCompany = companies[0]
      if (onlyCompany && !selectedCompany) {
        // Auto-select but don't navigate automatically
        // Let user see and confirm their company
        const normalizedCompany = { 
          ...onlyCompany, 
          id: onlyCompany.id || onlyCompany._id, 
          _id: onlyCompany._id || onlyCompany.id 
        }
        setSelectedCompany(normalizedCompany)
      }
    }
  }, [companies, currentCompany, selectedCompany])

  const filteredCompanies = companies.filter(company =>
    company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.businessType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.industry?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateCompany = (e) => {
    e.preventDefault()
    createCompanyMutation.mutate(newCompany)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewCompany(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSelectPlan = (plan) => {
    setNewCompany(prev => ({
      ...prev,
      subscriptionPlan: plan
    }))
  }

  const handleContinue = () => {
    if (!selectedCompany) return
    // Normalize company object to ensure it has both id and _id
    const normalizedCompany = { ...selectedCompany, id: selectedCompany.id || selectedCompany._id, _id: selectedCompany._id || selectedCompany.id }
    selectCompany(normalizedCompany)
    navigate('/dashboard')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Select Company</h1>
        <p className="text-muted-foreground">
          Choose a company to manage or create a new one
        </p>
      </div>

      <Tabs defaultValue="my-companies">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my-companies">My Companies</TabsTrigger>
          <TabsTrigger value="create-new">Create New</TabsTrigger>
        </TabsList>
        
        <TabsContent value="my-companies" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search companies..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={() => document.querySelector('[data-value="create-new"]').click()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Company
            </Button>
          </div>

          {isLoading ? (
            <div className="py-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading companies...</p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                {filteredCompanies.map((company) => (
                  <Card
                    key={company._id || company.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      (selectedCompany?._id === company._id || selectedCompany?.id === company.id || selectedCompany?.id === company._id || selectedCompany?._id === company.id)
                        ? 'border-primary ring-2 ring-primary/20'
                        : ''
                    }`}
                    onClick={() => {
                      const normalizedCompany = { ...company, id: company.id || company._id, _id: company._id || company.id }
                      setSelectedCompany(normalizedCompany)
                    }}
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
                              {company.industry && ` • ${company.industry}`}
                            </CardDescription>
                          </div>
                        </div>
                        {(selectedCompany?._id === company._id || selectedCompany?.id === company.id || selectedCompany?.id === company._id || selectedCompany?._id === company.id) && (
                          <div className="rounded-full bg-primary p-1">
                            <Check className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
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
                            <div className="text-2xl font-bold">
                              ৳{company.totalSales?.toLocaleString() || 0}
                            </div>
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
                      <div className="text-xs text-muted-foreground">
                        {company.lastActive ? `Last active: ${company.lastActive}` : '—'}
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>

              {filteredCompanies.length === 0 && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Building className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No companies found</h3>
                    <p className="mt-2 text-muted-foreground">
                      {searchTerm 
                        ? 'No companies match your search. Try a different search term.' 
                        : 'You don\'t have any companies yet. Create your first company.'}
                    </p>
                  </CardContent>
                </Card>
              )}

              {filteredCompanies.length > 0 && (
                <div className="flex justify-between pt-4">
                  <Button variant="outline" asChild>
                    <Link to="/dashboard">Back to Dashboard</Link>
                  </Button>
                  <Button disabled={!selectedCompany} onClick={handleContinue}>
                    Continue to {selectedCompany?.name || 'Company'}
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="create-new">
          <form onSubmit={handleCreateCompany}>
            <Card>
              <CardHeader>
                <CardTitle>Create New Company</CardTitle>
                <CardDescription>
                  Set up a new business profile
                </CardDescription>
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
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
                    placeholder="e.g., Furniture, Textile, Metal Works, Electronics" 
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
                    <div className={`rounded-lg border p-4 cursor-pointer ${
                      newCompany.subscriptionPlan === 'basic' ? 'border-primary ring-2 ring-primary/20' : ''
                    }`} onClick={() => handleSelectPlan('basic')}>
                      <h4 className="font-semibold">Basic</h4>
                      <p className="text-2xl font-bold">৳200<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                      <p className="text-sm text-muted-foreground">1-10 Workers</p>
                      <p className="text-xs mt-2">• Basic features</p>
                      <p className="text-xs">• Email support</p>
                      <Button 
                        type="button" 
                        size="sm" 
                        className="mt-3 w-full" 
                        variant={newCompany.subscriptionPlan === 'basic' ? 'default' : 'outline'}
                      >
                        {newCompany.subscriptionPlan === 'basic' ? 'Selected' : 'Select'}
                      </Button>
                    </div>
                    
                    <div className={`rounded-lg border p-4 cursor-pointer ${
                      newCompany.subscriptionPlan === 'standard' ? 'border-primary ring-2 ring-primary/20' : ''
                    }`} onClick={() => handleSelectPlan('standard')}>
                      <h4 className="font-semibold">Standard</h4>
                      <p className="text-2xl font-bold">৳300<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                      <p className="text-sm text-muted-foreground">11-20 Workers</p>
                      <p className="text-xs mt-2">• All Basic features</p>
                      <p className="text-xs">• Advanced reporting</p>
                      <p className="text-xs">• Priority support</p>
                      <Button 
                        type="button" 
                        size="sm" 
                        className="mt-3 w-full" 
                        variant={newCompany.subscriptionPlan === 'standard' ? 'default' : 'outline'}
                      >
                        {newCompany.subscriptionPlan === 'standard' ? 'Selected' : 'Select'}
                      </Button>
                    </div>
                    
                    <div className={`rounded-lg border p-4 cursor-pointer ${
                      newCompany.subscriptionPlan === 'premium' ? 'border-primary ring-2 ring-primary/20' : ''
                    }`} onClick={() => handleSelectPlan('premium')}>
                      <h4 className="font-semibold">Premium</h4>
                      <p className="text-2xl font-bold">৳500<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                      <p className="text-sm text-muted-foreground">21-50 Workers</p>
                      <p className="text-xs mt-2">• All Standard features</p>
                      <p className="text-xs">• Custom integrations</p>
                      <p className="text-xs">• 24/7 phone support</p>
                      <Button 
                        type="button" 
                        size="sm" 
                        className="mt-3 w-full" 
                        variant={newCompany.subscriptionPlan === 'premium' ? 'default' : 'outline'}
                      >
                        {newCompany.subscriptionPlan === 'premium' ? 'Selected' : 'Select'}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => document.querySelector('[data-value="my-companies"]').click()}
                >
                  Cancel
                </Button>
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
      </Tabs>
    </div>
  )
}

export default CompanySelect