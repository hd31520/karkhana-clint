import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

/**
 * Export data to Excel file
 * @param {Array} data - Array of objects to export
 * @param {String} filename - Name of the file without extension
 * @param {String} sheetName - Name of the worksheet
 */
export const exportToExcel = (data, filename = 'export', sheetName = 'Sheet1') => {
  try {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    // Auto-size columns
    const maxWidth = data.reduce((w, r) => Math.max(w, ...Object.keys(r).map(k => k.length)), 10);
    worksheet['!cols'] = Array(Object.keys(data[0] || {}).length).fill({ width: maxWidth });
    
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
    const worksheet = XLSX.utils.json_to_sheet(data);
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
    
    if (data && data.length > 0) {
      // Convert data to table format
      const headers = Object.keys(data[0]);
      const rows = data.map(item => headers.map(header => item[header] ?? ''));
      
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
