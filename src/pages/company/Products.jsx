import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import api from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { productService } from '../../services/productService'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Badge } from '../../components/ui/badge'
import { 
  Package,
  PackagePlus,
  Search,
  Filter,
  Download,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Tag,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  CheckCircle
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu'
import { exportToCSV, exportToExcel, exportToPDF } from '../../utils/printExport'

const formatProductTimestamp = (value) => {
  if (!value) return 'Just now'

  try {
    return new Date(value).toLocaleString()
  } catch {
    return 'Just now'
  }
}

const getNormalizedProduct = (product) => {
  if (!product) return product

  const stock = product.stock ?? product.inventory?.quantity ?? 0
  const minStock = product.minStock ?? product.inventory?.minStock ?? 0
  const status = stock === 0 ? 'out-of-stock' : stock <= minStock ? 'low-stock' : 'in-stock'

  return {
    ...product,
    id: product.id || product._id,
    _id: product._id || product.id,
    code: product.code || product.sku || '-',
    unit: product.unit || product.inventory?.unit || 'pcs',
    stock,
    minStock,
    status,
    category: product.category?.name || product.category || 'Uncategorized',
    costPrice: product.costPrice ?? product.price?.cost ?? 0,
    sellingPrice: product.sellingPrice ?? product.price?.selling ?? 0,
    supplier: typeof product.supplier === 'object'
      ? product.supplier?.name || product.supplier?.contact || '-'
      : product.supplier || '-',
    lastUpdated: product.lastUpdated || formatProductTimestamp(product.updatedAt || product.createdAt)
  }
}

const normalizeSupplierPayload = (supplier) => {
  if (supplier && typeof supplier === 'object') return supplier

  const value = typeof supplier === 'string' ? supplier.trim() : ''
  return value ? { name: value } : undefined
}

const normalizeBatchPayload = (batch) => {
  if (batch && typeof batch === 'object') return batch

  const value = typeof batch === 'string' ? batch.trim() : ''
  return value ? { number: value } : undefined
}

const Products = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const { currentCompany } = useAuth()
  const companyId = currentCompany?.id || currentCompany?._id

  const { data, isLoading, refetch: refetchProducts } = useQuery({
    queryKey: ['products', companyId, page, limit, searchTerm],
    queryFn: async () => {
      const res = await api.get('/products', { params: { companyId, page, limit, search: searchTerm } })
      return {
        ...res,
        products: (res?.products || []).map(getNormalizedProduct)
      }
    },
    enabled: !!companyId,
    refetchOnWindowFocus: false,
  })

  const { data: totalProductsData } = useQuery({
    queryKey: ['products-total', companyId],
    queryFn: () => api.get('/products', { params: { companyId, page: 1, limit: 1 } }),
    enabled: !!companyId,
    refetchOnWindowFocus: false,
  })

  const queryClient = useQueryClient()
  const { showSuccess, showError } = useToast()
  const [openAddDialog, setOpenAddDialog] = useState(false)

  const [productForm, setProductForm] = useState({
    name: '',
    sku: '',
    barcode: '',
    category: '',
    price: { selling: 0, cost: 0 },
    inventory: { quantity: 0, minStock: 0, unit: 'pcs' },
    supplier: '',
    batch: ''
  })
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedProductForEdit, setSelectedProductForEdit] = useState(null)

  const invalidateProductQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['products', companyId] })
    queryClient.invalidateQueries({ queryKey: ['products-total', companyId] })
    queryClient.invalidateQueries({ queryKey: ['companyStats', companyId] })
    queryClient.invalidateQueries({ queryKey: ['products-stock-value', companyId] })
  }

  const prependProductToVisibleCache = (product) => {
    const normalizedProduct = getNormalizedProduct(product)

    queryClient.setQueriesData({ queryKey: ['products', companyId] }, (oldData) => {
      if (!oldData || !Array.isArray(oldData.products)) {
        return oldData
      }

      const filtered = oldData.products.filter((item) => (item._id || item.id) !== (normalizedProduct._id || normalizedProduct.id))
      return {
        ...oldData,
        products: [normalizedProduct, ...filtered].slice(0, limit),
        total: (oldData.total || 0) + 1
      }
    })
  }

  const replaceProductInVisibleCache = (product) => {
    const normalizedProduct = getNormalizedProduct(product)

    queryClient.setQueriesData({ queryKey: ['products', companyId] }, (oldData) => {
      if (!oldData || !Array.isArray(oldData.products)) {
        return oldData
      }

      return {
        ...oldData,
        products: oldData.products.map((item) =>
          (item._id || item.id) === (normalizedProduct._id || normalizedProduct.id)
            ? { ...item, ...normalizedProduct }
            : item
        )
      }
    })
  }

  const removeProductFromVisibleCache = (productId) => {
    queryClient.setQueriesData({ queryKey: ['products', companyId] }, (oldData) => {
      if (!oldData || !Array.isArray(oldData.products)) {
        return oldData
      }

      return {
        ...oldData,
        products: oldData.products.filter((item) => (item._id || item.id) !== productId),
        total: Math.max(0, (oldData.total || 0) - 1)
      }
    })
  }

  const handleCreateProduct = async (payload) => {
    try {
      if (!payload?.companyId) {
        showError('Please select a company first')
        return null
      }

      setIsCreating(true)
      const res = await productService.create(payload)
      showSuccess('Product created')
      setOpenAddDialog(false)
      if (res?.product) {
        prependProductToVisibleCache(res.product)
      }
      invalidateProductQueries()
      await refetchProducts()
      setProductForm({ name: '', sku: '', barcode: '', category: '', price: { selling: 0, cost: 0 }, inventory: { quantity: 0, minStock: 0, unit: 'pcs' }, supplier: '', batch: '' })
      return res
    } catch (err) {
      showError(err?.message || 'Failed to create product')
      throw err
    } finally {
      setIsCreating(false)
    }
  }

  const handleOpenEdit = (product) => {
    setIsEditing(true)
    setSelectedProductForEdit(product)
    setProductForm({
      name: product.name || '',
      sku: product.sku || '',
      barcode: product.barcode || '',
      category: product.category?._id || product.category || '',
      price: { selling: product.price?.selling || 0, cost: product.price?.cost || 0 },
      inventory: { quantity: product.inventory?.quantity || 0, minStock: product.inventory?.minStock || 0, unit: product.inventory?.unit || 'pcs' },
      supplier: product.supplier || '',
      batch: product.batch || ''
    })
    setOpenAddDialog(true)
  }

  const handleUpdateProduct = async (payload) => {
    if (!selectedProductForEdit) return
    try {
      setIsCreating(true)
      const id = selectedProductForEdit._id || selectedProductForEdit.id
      const res = await productService.update(id, payload)
      showSuccess('Product updated')
      setOpenAddDialog(false)
      setIsEditing(false)
      setSelectedProductForEdit(null)
      if (res?.product) {
        replaceProductInVisibleCache(res.product)
      }
      invalidateProductQueries()
      await refetchProducts()
      setProductForm({ name: '', sku: '', barcode: '', category: '', price: { selling: 0, cost: 0 }, inventory: { quantity: 0, minStock: 0, unit: 'pcs' }, supplier: '', batch: '' })
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update product')
      throw err
    } finally {
      setIsCreating(false)
    }
  }

  const products = data?.products || []
  const total = data?.total ?? products.length
  const totalProducts = totalProductsData?.total ?? total
  const totalPages = Math.max(1, Math.ceil((total) / limit))
  const hasSearch = searchTerm.trim().length > 0

  useEffect(() => {
    setPage(1)
  }, [companyId, searchTerm])

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  // Fetch aggregated total stock value for the company
  const { data: stockValueData } = useQuery({
    queryKey: ['products-stock-value', companyId],
    queryFn: () => api.get('/products/stock-value', { params: { companyId } }),
    enabled: !!companyId,
    refetchOnWindowFocus: false,
  })

  const totalStockValue = stockValueData?.totalValue ?? 0

  const navigate = useNavigate()

  // Update stock dialog (per-product)
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false)
  const [selectedProductForUpdate, setSelectedProductForUpdate] = useState(null)
  const [updateForm, setUpdateForm] = useState({ type: 'in', quantity: 0, reason: '', location: '' })
  const [isUpdating, setIsUpdating] = useState(false)

  const handleOpenUpdate = (product) => {
    setSelectedProductForUpdate(product)
    setUpdateForm({ type: 'in', quantity: 0, reason: '', location: '' })
    setOpenUpdateDialog(true)
  }

  const handleUpdateInventory = async () => {
    if (!selectedProductForUpdate) return
    try {
      setIsUpdating(true)
      const res = await productService.updateInventory(selectedProductForUpdate._id || selectedProductForUpdate.id, updateForm)
      showSuccess('Inventory updated')
      setOpenUpdateDialog(false)
      if (res?.product) {
        replaceProductInVisibleCache(res.product)
      }
      invalidateProductQueries()
      await refetchProducts()
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update inventory')
    } finally {
      setIsUpdating(false)
    }
  }

  // Change price dialog
  const [openPriceDialog, setOpenPriceDialog] = useState(false)
  const [selectedProductForPrice, setSelectedProductForPrice] = useState(null)
  const [priceForm, setPriceForm] = useState({ selling: 0, cost: 0 })
  const [isChangingPrice, setIsChangingPrice] = useState(false)

  const handleOpenChangePrice = (product) => {
    setSelectedProductForPrice(product)
    setPriceForm({ selling: product.price?.selling || 0, cost: product.price?.cost || 0 })
    setOpenPriceDialog(true)
  }

  const handleChangePrice = async () => {
    if (!selectedProductForPrice) return
    try {
      setIsChangingPrice(true)
      const res = await productService.update(selectedProductForPrice._id || selectedProductForPrice.id, { price: priceForm })
      showSuccess('Price updated')
      setOpenPriceDialog(false)
      if (res?.product) {
        replaceProductInVisibleCache(res.product)
      }
      invalidateProductQueries()
      await refetchProducts()
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update price')
    } finally {
      setIsChangingPrice(false)
    }
  }

  const handleViewProduct = (product) => {
    const id = product._id || product.id
    navigate(`/dashboard/products/${id}`)
  }

  // Delete confirmation dialog state
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false)
  const [selectedProductForDelete, setSelectedProductForDelete] = useState(null)

  const confirmDeleteProduct = (product) => {
    setSelectedProductForDelete(product)
    setOpenDeleteConfirm(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedProductForDelete) return
    try {
      await productService.delete(selectedProductForDelete._id || selectedProductForDelete.id)
      showSuccess('Product deleted')
      setOpenDeleteConfirm(false)
      setSelectedProductForDelete(null)
      removeProductFromVisibleCache(selectedProductForDelete._id || selectedProductForDelete.id)
      invalidateProductQueries()
      await refetchProducts()
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to delete product')
    }
  }
  const formatCurrency = (value) => {
    // format as BDT with short millions/k
    if (value >= 1_000_000) return `৳${(value / 1_000_000).toFixed(1)}M`
    if (value >= 1_000) return `৳${(value / 1_000).toFixed(1)}k`
    return `৳${value.toFixed(2)}`
  }

  const getStatusColor = (status) => {
    const colors = {
      'in-stock': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'low-stock': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
      'out-of-stock': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    }
    return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }

  const getStockStatus = (stock, minStock) => {
    if (stock === 0) return 'Out of Stock'
    if (stock <= minStock) return 'Low Stock'
    return 'In Stock'
  }

  const handleExportProducts = (type = 'excel') => {
    if (!products.length) {
      showError('No products available to export')
      return
    }

    const rows = products.map((product) => ({
      Name: product.name,
      SKU: product.sku || product.code,
      Category: product.category,
      Stock: product.stock,
      'Min Stock': product.minStock,
      Status: getStockStatus(product.stock, product.minStock),
      'Cost Price': product.costPrice,
      'Selling Price': product.sellingPrice,
      Supplier: product.supplier,
      Updated: product.lastUpdated
    }))

    const filename = `${(currentCompany?.name || 'company').replace(/\s+/g, '-').toLowerCase()}-products`
    const ok = type === 'pdf'
      ? exportToPDF(rows, filename, 'Product Inventory')
      : type === 'csv'
        ? exportToCSV(rows, filename)
        : exportToExcel(rows, filename, 'Products')

    if (ok) showSuccess(`Products exported as ${type.toUpperCase()}`)
    else showError('Failed to export products')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Product Management</h1>
          <p className="text-muted-foreground">
            Manage your product catalog and inventory
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Export Products</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleExportProducts('excel')}>Export as Excel</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportProducts('csv')}>Export as CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportProducts('pdf')}>Export as PDF</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <PackagePlus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Product</DialogTitle>
                <DialogDescription>Enter product details to create a new product.</DialogDescription>
              </DialogHeader>

              <div className="grid gap-2">
                <div>
                  <Label>Product Name</Label>
                  <Input value={productForm.name} onChange={(e) => setProductForm(s => ({...s, name: e.target.value}))} />
                </div>
                <div>
                  <Label>SKU</Label>
                  <Input value={productForm.sku} onChange={(e) => setProductForm(s => ({...s, sku: e.target.value}))} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Cost Price</Label>
                    <Input type="number" value={productForm.price.cost} onChange={(e) => setProductForm(s => ({...s, price: {...s.price, cost: Number(e.target.value)}}))} />
                  </div>
                  <div>
                    <Label>Selling Price</Label>
                    <Input type="number" value={productForm.price.selling} onChange={(e) => setProductForm(s => ({...s, price: {...s.price, selling: Number(e.target.value)}}))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Initial Quantity</Label>
                    <Input type="number" value={productForm.inventory.quantity} onChange={(e) => setProductForm(s => ({...s, inventory: {...s.inventory, quantity: Number(e.target.value)}}))} />
                  </div>
                  <div>
                    <Label>Min Stock</Label>
                    <Input type="number" value={productForm.inventory.minStock} onChange={(e) => setProductForm(s => ({...s, inventory: {...s.inventory, minStock: Number(e.target.value)}}))} />
                  </div>
                </div>
                <div>
                  <Label>Supplier</Label>
                  <Input value={productForm.supplier} onChange={(e) => setProductForm(s => ({...s, supplier: e.target.value}))} />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenAddDialog(false)}>Cancel</Button>
                <Button onClick={() => {
                  // Build payload
                  const payload = {
                    companyId: currentCompany?.id || currentCompany?._id,
                    name: productForm.name,
                    sku: productForm.sku,
                    barcode: productForm.barcode,
                    category: productForm.category,
                    price: productForm.price,
                    inventory: productForm.inventory,
                    supplier: normalizeSupplierPayload(productForm.supplier),
                    batch: normalizeBatchPayload(productForm.batch)
                  }
                  if (isEditing) {
                    handleUpdateProduct(payload)
                  } else {
                    handleCreateProduct(payload)
                  }
                }} disabled={isCreating}>{isCreating ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update' : 'Create')}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {/* Delete confirmation dialog */}
          <Dialog open={openDeleteConfirm} onOpenChange={setOpenDeleteConfirm}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete product</DialogTitle>
                <DialogDescription>Are you sure you want to delete {selectedProductForDelete?.name || 'this product'}? This action can be undone by re-activating the product in the database.</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenDeleteConfirm(false)}>Cancel</Button>
                <Button className="text-red-600" onClick={handleConfirmDelete}>Delete</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {/* Update Stock Dialog (for product rows) */}
          <Dialog open={openUpdateDialog} onOpenChange={setOpenUpdateDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Stock</DialogTitle>
                <DialogDescription>Adjust inventory for {selectedProductForUpdate?.name || '-'}</DialogDescription>
              </DialogHeader>

              <div className="grid gap-2">
                <div>
                  <Label>Type</Label>
                  <select value={updateForm.type} onChange={(e) => setUpdateForm(s => ({...s, type: e.target.value}))} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="in">Add (In)</option>
                    <option value="out">Remove (Out)</option>
                    <option value="adjustment">Set Quantity</option>
                  </select>
                </div>
                <div>
                  <Label>Quantity</Label>
                  <Input type="number" value={updateForm.quantity} onChange={(e) => setUpdateForm(s => ({...s, quantity: Number(e.target.value)}))} />
                </div>
                <div>
                  <Label>Reason</Label>
                  <Input value={updateForm.reason} onChange={(e) => setUpdateForm(s => ({...s, reason: e.target.value}))} />
                </div>
                <div>
                  <Label>Location (optional)</Label>
                  <Input value={updateForm.location} onChange={(e) => setUpdateForm(s => ({...s, location: e.target.value}))} />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenUpdateDialog(false)}>Cancel</Button>
                <Button onClick={handleUpdateInventory} disabled={isUpdating}>{isUpdating ? 'Updating...' : 'Apply'}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Change Price Dialog (for product rows) */}
          <Dialog open={openPriceDialog} onOpenChange={setOpenPriceDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Change Price</DialogTitle>
                <DialogDescription>Update price for {selectedProductForPrice?.name || '-'}</DialogDescription>
              </DialogHeader>

              <div className="grid gap-2">
                <div>
                  <Label>Cost Price</Label>
                  <Input type="number" value={priceForm.cost} onChange={(e) => setPriceForm(s => ({...s, cost: Number(e.target.value)}))} />
                </div>
                <div>
                  <Label>Selling Price</Label>
                  <Input type="number" value={priceForm.selling} onChange={(e) => setPriceForm(s => ({...s, selling: Number(e.target.value)}))} />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenPriceDialog(false)}>Cancel</Button>
                <Button onClick={handleChangePrice} disabled={isChangingPrice}>{isChangingPrice ? 'Updating...' : 'Save'}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              Across all categories
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stock Value</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalStockValue)}</div>
            <p className="text-xs text-muted-foreground">
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.filter(p => p.status === 'low-stock').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Need restocking
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.filter(p => p.status === 'out-of-stock').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Immediate attention needed
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>All Products</CardTitle>
              <CardDescription>
                Manage your product inventory and details
              </CardDescription>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  className="w-full pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon" className="self-end sm:self-auto">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Code</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Pricing</TableHead>
                <TableHead>Stock Status</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product._id || product.id}>
                  <TableCell>
                    <div className="font-medium">{product.code}</div>
                    <div className="text-sm text-muted-foreground">
                      {product.unit}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-muted-foreground">
                      SKU: {product.code}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{product.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">
                        Cost: <span className="font-medium">{product.costPrice}</span>
                      </div>
                      <div className="text-sm">
                        Selling: <span className="font-medium text-green-600">{product.sellingPrice}</span>
                      </div>
                      <div className="text-sm">
                        Margin: <span className="font-medium text-blue-600">108%</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Stock: {product.stock}</span>
                        <span className="text-sm text-muted-foreground">
                          Min: {product.minStock}
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                        <div
                          className={`h-full rounded-full ${
                            product.status === 'in-stock'
                              ? 'bg-green-600'
                              : product.status === 'low-stock'
                              ? 'bg-amber-600'
                              : 'bg-red-600'
                          }`}
                          style={{ width: `${Math.min((product.stock / product.minStock) * 100, 100)}%` }}
                        />
                      </div>
                      <Badge className={getStatusColor(product.status)}>
                        {getStockStatus(product.stock, product.minStock)}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{product.supplier}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {product.lastUpdated}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleViewProduct(product)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenEdit(product)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenUpdate(product)}>
                          <Package className="mr-2 h-4 w-4" />
                          Update Stock
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenChangePrice(product)}>
                          <Tag className="mr-2 h-4 w-4" />
                          Change Price
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600" onClick={() => confirmDeleteProduct(product)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {products.length === 0 && !isLoading && (
            <div className="py-12 text-center">
              <Package className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No products found</h3>
              <p className="mt-2 text-muted-foreground">
                {hasSearch
                  ? 'No products match your search criteria.'
                  : totalProducts > 0
                    ? 'No products are available on this page right now.'
                    : 'Add your first product to get started.'}
              </p>
            </div>
          )}
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {products.length} of {total} products
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <div className="text-sm px-3">{page} / {totalPages}</div>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Low Stock Alerts</CardTitle>
            <CardDescription>
              Products that need immediate attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {products
                .filter(p => p.status === 'low-stock' || p.status === 'out-of-stock')
                .map((product) => (
                  <div key={product.id} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{product.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Current stock: {product.stock} | Minimum required: {product.minStock}
                        </p>
                      </div>
                      <Button size="sm">Order</Button>
                    </div>
                  </div>
                ))}
              
              {products.filter(p => p.status === 'low-stock' || p.status === 'out-of-stock').length === 0 && (
                <div className="py-8 text-center">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
                  <h4 className="mt-4 font-semibold">All products are well-stocked</h4>
                  <p className="mt-2 text-sm text-muted-foreground">
                    No low stock alerts at this time.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common product management tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-auto flex-col items-center justify-center p-4" onClick={() => setOpenAddDialog(true)}>
                <PackagePlus className="mb-2 h-5 w-5" />
                <span className="text-sm">Add Product</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col items-center justify-center p-4" onClick={() => showSuccess('Import not implemented yet')}>
                <Download className="mb-2 h-5 w-5" />
                <span className="text-sm">Import Products</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col items-center justify-center p-4" onClick={() => setOpenPriceDialog(true)}>
                <Tag className="mb-2 h-5 w-5" />
                <span className="text-sm">Update Prices</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col items-center justify-center p-4" onClick={() => navigate('/dashboard/inventory')}>
                <Package className="mb-2 h-5 w-5" />
                <span className="text-sm">Stock Count</span>
              </Button>
            </div>
            
            <div className="mt-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
              <h4 className="mb-2 font-medium">Inventory Tips</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Set minimum stock levels for all products</li>
                <li>• Regular stock counting prevents discrepancies</li>
                <li>• Use barcode scanning for faster inventory</li>
                <li>• Monitor fast-moving items closely</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Products

