import { useState, useRef } from 'react'
import { Button } from '../ui/button'
import { Download, Printer, Upload, FileJson } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import {
  exportToExcel,
  exportToCSV,
  exportToPDF,
  exportToJSON,
  printData,
  importFile
} from '../../utils/exportImport'

const ExportImportToolbar = ({
  data = [],
  filename = 'export',
  title = 'Report',
  company = null,
  onImportSuccess = null
}) => {
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const fileInputRef = useRef(null)

  const handleExport = async (format) => {
    setIsExporting(true)
    
    try {
      // Get the actual data - could be an array or async function
      let actualData = data
      if (typeof data === 'function') {
        actualData = await data()
      }
      
      if (!actualData || actualData.length === 0) {
        window.alert('No data to export')
        return
      }

      const exportOptions = {
        company,
        title,
        type: 'export'
      }

      let success = false
      switch (format) {
        case 'excel':
          success = exportToExcel(actualData, filename, exportOptions)
          break
        case 'csv':
          success = exportToCSV(actualData, filename, exportOptions)
          break
        case 'pdf':
          success = exportToPDF(actualData, filename, exportOptions)
          break
        case 'json':
          success = exportToJSON(actualData, filename, exportOptions)
          break
        default:
          success = false
      }

      if (success) {
        // Don't show success alert for exports - file download indicates success
        console.log(`Successfully exported to ${format.toUpperCase()}`)
      } else {
        window.alert(`Failed to export to ${format.toUpperCase()}`)
      }
    } catch (error) {
      console.error('Export error:', error)
      window.alert(`Export error: ${error.message}`)
    } finally {
      setIsExporting(false)
    }
  }

  const handlePrint = () => {
    if (!data || data.length === 0) {
      window.alert('No data to print')
      return
    }

    try {
      printData(data, { title, company })
    } catch (error) {
      window.alert(`Print error: ${error.message}`)
    }
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    try {
      const records = await importFile(file)
      if (onImportSuccess) {
        onImportSuccess(records)
        window.alert(`Successfully imported ${records.length} records from ${file.name}`)
      } else {
        window.alert(`Imported ${records.length} records. Please check your application for import handlers.`)
      }
    } catch (error) {
      window.alert(`Import error: ${error.message}`)
    } finally {
      setIsImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Export Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="min-w-[120px] sm:min-w-0"
            disabled={isExporting || !data || data.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Export Format</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleExport('excel')}>
            📊 Excel (.xlsx)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport('csv')}>
            📄 CSV (.csv)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport('pdf')}>
            📕 PDF (.pdf)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport('json')}>
            <FileJson className="mr-2 h-4 w-4" />
            JSON (.json)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Print Button */}
      <Button
        variant="outline"
        size="sm"
        className="w-full sm:w-auto"
        onClick={handlePrint}
        disabled={!data || data.length === 0}
        >
        <Printer className="mr-2 h-4 w-4" />
        Print
      </Button>

      {/* Import Button */}
      <Button
        variant="outline"
        size="sm"
        className="w-full sm:w-auto"
        onClick={handleImportClick}
        disabled={isImporting}
      >
        <Upload className="mr-2 h-4 w-4" />
        {isImporting ? 'Importing...' : 'Import'}
      </Button>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx,.xls,.json"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
}

export default ExportImportToolbar
