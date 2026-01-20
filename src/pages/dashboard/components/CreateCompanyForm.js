import { useState } from 'react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import PlanSelector from './PlanSelector'

const CreateCompanyForm = ({ 
  onSubmit, 
  onCancel, 
  isSubmitting 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    businessType: '',
    industry: '',
    estimatedWorkers: '',
    subscriptionPlan: 'standard'
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit}>
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
              value={formData.name}
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
              value={formData.businessType}
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
              value={formData.industry}
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
              value={formData.estimatedWorkers}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Subscription Plan *</Label>
            <PlanSelector 
              selectedPlan={formData.subscriptionPlan}
              onSelectPlan={(plan) => setFormData(prev => ({ ...prev, subscriptionPlan: plan }))}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={isSubmitting || !formData.name || !formData.businessType}
          >
            {isSubmitting ? 'Creating...' : 'Create Company'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}

export default CreateCompanyForm