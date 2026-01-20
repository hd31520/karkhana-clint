// Normalize company object to ensure consistent structure
export const normalizeCompany = (company) => {
  if (!company) return null
  
  return {
    ...company,
    id: company.id || company._id,
    _id: company._id || company.id
  }
}

// Filter companies based on search term
export const filterCompanies = (companies, searchTerm) => {
  if (!searchTerm) return companies

  return companies.filter(company =>
    company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.businessType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.industry?.toLowerCase().includes(searchTerm.toLowerCase())
  )
}

// Auto-select logic
export const getAutoSelectedCompany = (companies, currentCompany) => {
  if (!currentCompany && companies && companies.length === 1) {
    return normalizeCompany(companies[0])
  }
  return null
}