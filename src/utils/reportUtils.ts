// Utility functions for report generation and file handling

/**
 * Downloads a file with the given content and filename
 */
export const downloadFile = (content: string | Blob, filename: string, mimeType?: string) => {
  let blob: Blob;
  
  if (content instanceof Blob) {
    blob = content;
  } else {
    blob = new Blob([content], { type: mimeType || 'text/plain' });
  }
  
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Generates a CSV file from array data
 */
export const generateCSV = (data: any[], headers: string[]): string => {
  const csvHeaders = headers.join(',');
  const csvRows = data.map(row => 
    headers.map(header => {
      const value = row[header];
      // Escape quotes and wrap in quotes if contains comma
      const escaped = String(value).replace(/"/g, '""');
      return escaped.includes(',') ? `"${escaped}"` : escaped;
    }).join(',')
  );
  
  return [csvHeaders, ...csvRows].join('\n');
};

/**
 * Formats a date for display in reports
 */
export const formatReportDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Formats currency for display in reports
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

/**
 * Generates a sample PDF content (mock implementation)
 */
export const generatePDFContent = (reportType: string, data: any): string => {
  return `
    ${reportType.toUpperCase()} REPORT
    Generated on: ${formatReportDate(new Date())}
    
    Summary:
    ${JSON.stringify(data, null, 2)}
    
    This is a mock PDF content. In a real implementation, 
    you would use a PDF generation library like jsPDF or PDFKit.
  `;
};

/**
 * Gets the appropriate file extension for a report format
 */
export const getFileExtension = (format: 'pdf' | 'excel' | 'csv'): string => {
  switch (format) {
    case 'pdf': return 'pdf';
    case 'excel': return 'xlsx';
    case 'csv': return 'csv';
    default: return 'txt';
  }
};

/**
 * Gets the appropriate MIME type for a report format
 */
export const getMimeType = (format: 'pdf' | 'excel' | 'csv'): string => {
  switch (format) {
    case 'pdf': return 'application/pdf';
    case 'excel': return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case 'csv': return 'text/csv';
    default: return 'text/plain';
  }
};
