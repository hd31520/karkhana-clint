import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card'
import { Building, Users, DollarSign, Check } from 'lucide-react'

const CompanyCard = ({ company, isSelected, onSelect }) => {
  const normalizedCompany = {
    ...company,
    id: company.id || company._id,
    _id: company._id || company.id
  }

  const isCurrentlySelected = isSelected(normalizedCompany)

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        isCurrentlySelected ? 'border-primary ring-2 ring-primary/20' : ''
      }`}
      onClick={() => onSelect(normalizedCompany)}
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
          {isCurrentlySelected && (
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
  )
}

export default CompanyCard