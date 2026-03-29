import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

/**
 * Normalize values for export (flatten nested objects/arrays)
 */
const normalizeValue = (value) => {
  if (value === null || value === undefined) return ''
  if (Array.isArray(value)) {
    return value.map((item) => normalizeValue(item)).join(', ')
  }
  if (typeof value === 'object' && value.constructor === Object) {
    return Object.entries(value)
      .map(([key, nestedValue]) => `${key}: ${normalizeValue(nestedValue)}`)
      .join(' | ')
  }
  return String(value)
}

/**
 * Sanitize rows for export (flatten nested data)
 */
const sanitizeRows = (data = [], columnMapping = null) => {
  if (!Array.isArray(data) || data.length === 0) return []

  return data.map((row) => {
    if (!row || typeof row !== 'object') return {}
    
    const sanitized = {}
    const keys = columnMapping ? Object.values(columnMapping) : Object.keys(row)
    
    keys.forEach((key) => {
      const value = row[key]
      sanitized[key] = normalizeValue(value)
    })
    
    return sanitized
  })
}

/**
 * Calculate optimal column widths for Excel
 */
const getColumnWidths = (rows = []) => {
  if (!rows.length) return []

  const headers = Object.keys(rows[0])
  return headers.map((header) => ({
    width: Math.min(
      50,
      Math.max(
        header.length + 2,
        ...rows.map((row) => String(row[header] || '').length + 2)
      )
    )
  }))
}

/**
 * Export data to Excel file
 */
export const exportToExcel = (data, filename = 'export', options = {}) => {
  try {
    const rows = sanitizeRows(data, options.columnMapping)
    if (!rows.length) {
      console.warn('No data to export')
      return false
    }

    const worksheet = XLSX.utils.json_to_sheet(rows)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, options.sheetName || 'Data')
    
    worksheet['!cols'] = getColumnWidths(rows)

    // Add company/timestamp if needed
    if (options.company) {
      const infoSheet = XLSX.utils.aoa_to_sheet([
        ['Export Date', new Date().toLocaleString()],
        ['Company', options.company],
        ['Type', options.type || '']
      ])
      XLSX.utils.book_append_sheet(workbook, infoSheet, 'Info')
    }
    
    XLSX.writeFile(workbook, `${filename}.xlsx`)
    return true
  } catch (error) {
    console.error('Excel export failed:', error)
    return false
  }
}

/**
 * Export data to CSV file
 */
export const exportToCSV = (data, filename = 'export', options = {}) => {
  try {
    const rows = sanitizeRows(data, options.columnMapping)
    if (!rows.length) {
      console.warn('No data to export')
      return false
    }

    const worksheet = XLSX.utils.json_to_sheet(rows)
    const csv = XLSX.utils.sheet_to_csv(worksheet)
    
    let content = csv
    if (options.company) {
      content = `Export Date,${new Date().toLocaleString()}\nCompany,${options.company}\n\n${csv}`
    }
    
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    saveAs(blob, `${filename}.csv`)
    return true
  } catch (error) {
    console.error('CSV export failed:', error)
    return false
  }
}

/**
 * Export data to PDF with table
 */
export const exportToPDF = (data, filename = 'export', options = {}) => {
  try {
    const doc = new jsPDF(options.orientation || 'portrait')
    const pageWidth = doc.internal.pageSize.getWidth()
    let yPosition = 10

    // Title
    if (options.title) {
      doc.setFontSize(16)
      doc.text(options.title, 14, yPosition)
      yPosition += 8
    }

    // Company and Date
    if (options.company) {
      doc.setFontSize(10)
      doc.text(`Company: ${options.company}`, 14, yPosition)
      yPosition += 5
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, yPosition)
      yPosition += 8
    }

    // Data table
    const rowsData = sanitizeRows(data, options.columnMapping)
    if (rowsData.length > 0) {
      const headers = Object.keys(rowsData[0])
      const rows = rowsData.map(item => headers.map(header => item[header] ?? ''))
      
      autoTable(doc, {
        head: [headers],
        body: rows,
        startY: yPosition,
        styles: {
          fontSize: 8,
          cellPadding: 2,
          ...options.styles
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        margin: { left: 10, right: 10 },
        ...options.tableOptions
      })
    }

    doc.save(`${filename}.pdf`)
    return true
  } catch (error) {
    console.error('PDF export failed:', error)
    return false
  }
}

/**
 * Export data as JSON (for backup/import)
 */
export const exportToJSON = (data, filename = 'export', options = {}) => {
  try {
    if (!data) {
      console.warn('No data to export')
      return false
    }

    const exportData = {
      exportDate: new Date().toISOString(),
      company: options.company || null,
      type: options.type || null,
      data: Array.isArray(data) ? data : [data]
    }

    const json = JSON.stringify(exportData, null, 2)
    const blob = new Blob([json], { type: 'application/json;charset=utf-8;' })
    saveAs(blob, `${filename}.json`)
    return true
  } catch (error) {
    console.error('JSON export failed:', error)
    return false
  }
}

/**
 * Print data (opens in new tab/window for browser print)
 */
export const printData = (data, options = {}) => {
  try {
    if (!data || (Array.isArray(data) && data.length === 0)) {
      console.warn('No data to print')
      return false
    }

    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      console.error('Pop-up blocked. Please allow pop-ups for this site.')
      return false
    }

    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${options.title || 'Print'}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
          }
          h1 { color: #2980b9; border-bottom: 2px solid #2980b9; padding-bottom: 10px; }
          .info { color: #666; font-size: 12px; margin-bottom: 20px; }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th {
            background-color: #2980b9;
            color: white;
            padding: 10px;
            text-align: left;
            font-weight: bold;
            border: 1px solid #ddd;
          }
          td {
            padding: 8px;
            border: 1px solid #ddd;
          }
          tr:nth-child(even) {
            background-color: #f5f5f5;
          }
          @media print {
            body { margin: 10px; }
            table { font-size: 12px; }
            td, th { padding: 5px; }
          }
        </style>
      </head>
      <body>
    `

    if (options.title) {
      html += `<h1>${options.title}</h1>`
    }

    if (options.company) {
      html += `<div class="info">
        <p><strong>Company:</strong> ${options.company}</p>
        <p><strong>Printed:</strong> ${new Date().toLocaleString()}</p>
      </div>`
    }

    // Build table
    const itemsToRender = Array.isArray(data) ? data : [data]
    if (itemsToRender.length > 0 && typeof itemsToRender[0] === 'object') {
      const headers = Object.keys(itemsToRender[0])
      html += '<table><thead><tr>'
      headers.forEach(header => {
        html += `<th>${header}</th>`
      })
      html += '</tr></thead><tbody>'

      itemsToRender.forEach(item => {
        html += '<tr>'
        headers.forEach(header => {
          const value = normalizeValue(item[header])
          html += `<td>${value}</td>`
        })
        html += '</tr>'
      })

      html += '</tbody></table>'
    }

    html += `
      </body>
      </html>
    `

    printWindow.document.write(html)
    printWindow.document.close()
    
    setTimeout(() => {
      printWindow.print()
    }, 100)

    return true
  } catch (error) {
    console.error('Print failed:', error)
    return false
  }
}

/**
 * Parse and import CSV file
 */
export const importFromCSV = (file) => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader()
      reader.onload = (e) => {
        const data = e.target.result
        const workbook = XLSX.read(data, { type: 'string' })
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]
        const records = XLSX.utils.sheet_to_json(worksheet)
        resolve(records)
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsText(file)
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Parse and import Excel file
 */
export const importFromExcel = (file) => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader()
      reader.onload = (e) => {
        const data = e.target.result
        const workbook = XLSX.read(data, { type: 'array' })
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]
        const records = XLSX.utils.sheet_to_json(worksheet)
        resolve(records)
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsArrayBuffer(file)
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Parse and import JSON file
 */
export const importFromJSON = (file) => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader()
      reader.onload = (e) => {
        const data = JSON.parse(e.target.result)
        resolve(Array.isArray(data.data) ? data.data : [data])
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsText(file)
    } catch (error) {
      reject(new Error(`Invalid JSON file: ${error.message}`))
    }
  })
}

/**
 * Generic import handler - detects file type
 */
export const importFile = async (file) => {
  const ext = file.name.split('.').pop().toLowerCase()
  
  switch (ext) {
    case 'csv':
      return await importFromCSV(file)
    case 'xlsx':
    case 'xls':
      return await importFromExcel(file)
    case 'json':
      return await importFromJSON(file)
    default:
      throw new Error(`Unsupported file type: ${ext}`)
  }
}

export default {
  exportToExcel,
  exportToCSV,
  exportToPDF,
  exportToJSON,
  printData,
  importFromCSV,
  importFromExcel,
  importFromJSON,
  importFile
}
