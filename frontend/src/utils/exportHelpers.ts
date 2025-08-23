import { CostDataResponse } from '../types/billing';
import { formatCurrency } from './dateHelpers';

export interface ExportData {
  date: string;
  service?: string;
  cost: number;
  unit: string;
}

export const transformDataForExport = (data: CostDataResponse): ExportData[] => {
  if (!data.results || data.results.length === 0) {
    return [];
  }

  const exportData: ExportData[] = [];

  data.results.forEach(result => {
    const date = new Date(result.time_period.start).toLocaleDateString('en-US');

    if (data.group_by && data.group_by.length > 0 && result.groups.length > 0) {
      // Grouped data
      result.groups.forEach(group => {
        if (group.keys.length > 0 && group.metrics.BlendedCost) {
          exportData.push({
            date,
            service: group.keys[0],
            cost: parseFloat(group.metrics.BlendedCost.amount),
            unit: group.metrics.BlendedCost.unit,
          });
        }
      });
    } else if (result.total?.BlendedCost) {
      // Total data
      exportData.push({
        date,
        cost: parseFloat(result.total.BlendedCost.amount),
        unit: result.total.BlendedCost.unit,
      });
    }
  });

  return exportData;
};

export const exportToCsv = (data: CostDataResponse, filename: string = 'aws-cost-data.csv'): void => {
  const exportData = transformDataForExport(data);
  
  if (exportData.length === 0) {
    alert('No data to export');
    return;
  }

  const hasService = exportData[0].service !== undefined;
  
  // Create CSV header
  const headers = hasService ? ['Date', 'Service', 'Cost', 'Unit'] : ['Date', 'Cost', 'Unit'];
  
  // Create CSV rows
  const csvRows = [
    headers.join(','),
    ...exportData.map(row => {
      const values = hasService 
        ? [row.date, `"${row.service}"`, row.cost.toFixed(2), row.unit]
        : [row.date, row.cost.toFixed(2), row.unit];
      return values.join(',');
    })
  ];

  // Create and download CSV
  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const exportToJson = (data: CostDataResponse, filename: string = 'aws-cost-data.json'): void => {
  const exportData = transformDataForExport(data);
  
  if (exportData.length === 0) {
    alert('No data to export');
    return;
  }

  const jsonContent = JSON.stringify({
    exportDate: new Date().toISOString(),
    timePeriod: data.time_period,
    granularity: data.granularity,
    groupBy: data.group_by,
    data: exportData,
    summary: {
      totalRecords: exportData.length,
      totalCost: exportData.reduce((sum, item) => sum + item.cost, 0),
      averageCost: exportData.reduce((sum, item) => sum + item.cost, 0) / exportData.length,
    }
  }, null, 2);

  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const generateSummaryReport = (data: CostDataResponse): string => {
  const exportData = transformDataForExport(data);
  
  if (exportData.length === 0) {
    return 'No data available for report generation.';
  }

  const totalCost = exportData.reduce((sum, item) => sum + item.cost, 0);
  const averageCost = totalCost / exportData.length;
  
  let report = `AWS Cost Report\n`;
  report += `Generated: ${new Date().toLocaleString()}\n`;
  report += `Time Period: ${data.time_period.start} to ${data.time_period.end}\n`;
  report += `Granularity: ${data.granularity}\n`;
  report += `Group By: ${data.group_by?.map(g => g.Key).join(', ') || 'None'}\n\n`;
  
  report += `Summary:\n`;
  report += `Total Cost: ${formatCurrency(totalCost.toString())}\n`;
  report += `Average per period: ${formatCurrency(averageCost.toString())}\n`;
  report += `Number of periods: ${exportData.length}\n\n`;

  if (data.group_by && data.group_by.length > 0) {
    // Service breakdown
    const serviceBreakdown = new Map<string, number>();
    exportData.forEach(item => {
      if (item.service) {
        serviceBreakdown.set(item.service, (serviceBreakdown.get(item.service) || 0) + item.cost);
      }
    });

    const sortedServices = Array.from(serviceBreakdown.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10); // Top 10 services

    report += `Top Services by Cost:\n`;
    sortedServices.forEach(([service, cost], index) => {
      const percentage = (cost / totalCost * 100).toFixed(1);
      report += `${index + 1}. ${service}: ${formatCurrency(cost.toString())} (${percentage}%)\n`;
    });
  }

  return report;
};