import { useCallback } from 'react';

const useExcelDownload = () => {
  const downloadExcel = useCallback((data, filename = 'data') => {
    if (!data || data.length === 0) {
      alert('No data to download');
      return;
    }

    // Get headers from first object
    const headers = Object.keys(data[0]).join(',');
    
    // Get rows data
    const rows = data.map(row => 
      Object.values(row).map(value => 
        // Handle values that might contain commas
        typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value
      ).join(',')
    ).join('\n');

    // Create CSV content
    const csvContent = headers + '\n' + rows;
    
    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename + '.csv');
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  return downloadExcel;
};

export default useExcelDownload;