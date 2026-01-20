import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { Building, Plus } from 'lucide-react'
import CompanyCard from './CompanyCard'
import SearchBar from './SearchBar'
import { filterCompanies } from '../utils/companyUtils'

const CompanyList = ({ 
  companies, 
  isLoading, 
  selectedCompany, 
  onSelectCompany,
  onSwitchToCreate 
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const filteredCompanies = filterCompanies(companies, searchTerm)

  const isCompanySelected = (company) => {
    return (
      selectedCompany?._id === company._id || 
      selectedCompany?.id === company.id || 
      selectedCompany?.id === company._id || 
      selectedCompany?._id === company.id
    )
  }

  if (isLoading) {
    return (
      <div className="py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading companies...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SearchBar value={searchTerm} onChange={setSearchTerm} />
        <Button onClick={onSwitchToCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Company
        </Button>
      </div>

      {filteredCompanies.length > 0 ? (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {filteredCompanies.map((company) => (
              <CompanyCard
                key={company._id || company.id}
                company={company}
                isSelected={isCompanySelected}
                onSelect={onSelectCompany}
              />
            ))}
          </div>
        </>
      ) : (
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
    </div>
  )
}

export default CompanyList