import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const normalizeValue = (value) => {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) {
    return value.map((item) => normalizeValue(item)).join(', ');
  }
  if (typeof value === 'object') {
    return Object.entries(value)
      .map(([key, nestedValue]) => `${key}: ${normalizeValue(nestedValue)}`)
      .join(' | ');
  }
  return String(value);
};

const sanitizeRows = (data = []) => {
  if (!Array.isArray(data) || data.length === 0) return [];

  return data.map((row) => {
    const entries = Object.entries(row || {}).map(([key, value]) => [key, normalizeValue(value)]);
    return Object.fromEntries(entries);
  });
};

const getColumnWidths = (rows = []) => {
  if (!rows.length) return [];

  const headers = Object.keys(rows[0]);
  return headers.map((header) => ({
    width: Math.min(
      40,
      Math.max(
        header.length + 2,
        ...rows.map((row) => String(row[header] || '').length + 2)
      )
    )
  }));
};

/**
 * Export data to Excel file
 * @param {Array} data - Array of objects to export
 * @param {String} filename - Name of the file without extension
 * @param {String} sheetName - Name of the worksheet
 */
export const exportToExcel = (data, filename = 'export', sheetName = 'Sheet1') => {
  try {
    const rows = sanitizeRows(data);
    if (!rows.length) return false;

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    worksheet['!cols'] = getColumnWidths(rows);
    
    XLSX.writeFile(workbook, `${filename}.xlsx`);
    return true;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    return false;
  }
};

/**
 * Export data to CSV file
 * @param {Array} data - Array of objects to export
 * @param {String} filename - Name of the file without extension
 */
export const exportToCSV = (data, filename = 'export') => {
  try {
    const rows = sanitizeRows(data);
    if (!rows.length) return false;

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${filename}.csv`);
    return true;
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    return false;
  }
};

/**
 * Export data to PDF with table
 * @param {Array} data - Array of objects to export
 * @param {String} filename - Name of the file without extension
 * @param {String} title - Title of the PDF document
 * @param {Object} options - Additional options
 */ 
export const exportToPDF = (data, filename = 'export', title = 'Report', options = {}) => {
  try {
    const doc = new jsPDF(options.orientation || 'portrait');
    
    // Add title
    doc.setFontSize(18);
    doc.text(title, 14, 20);
    
    // Add date
    doc.setFontSize(10);

    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28);
    
    const rowsData = sanitizeRows(data);

    if (rowsData.length > 0) {
      // Convert data to table format
      const headers = Object.keys(rowsData[0]);
      const rows = rowsData.map(item => headers.map(header => item[header] ?? ''));
      
      // Add table
      doc.autoTable({
        head: [headers],
        body: rows,
        startY: 35,
        styles: { // Default styles
          fontSize: 9,
          cellPadding: 3,
          ...options.styles // Override with options
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: { // Default alternate row styles
          fillColor: [245, 245, 245],
        },
        ...options.tableOptions
      });
    }
    
    doc.save(`${filename}.pdf`);
    return true;
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    return false;
  }
};

export default {
  exportToExcel,
  exportToCSV,
  exportToPDF,
};
