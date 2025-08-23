import React, { useState } from 'react';
import { CostDataResponse } from '../../types/billing';
import { exportToCsv, exportToJson, generateSummaryReport } from '../../utils/exportHelpers';

interface ExportButtonProps {
  data: CostDataResponse | null;
  disabled?: boolean;
}

const ExportButton: React.FC<ExportButtonProps> = ({ data, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleExportCsv = () => {
    if (data) {
      const filename = `aws-costs-${data.time_period.start}-to-${data.time_period.end}.csv`;
      exportToCsv(data, filename);
      setIsOpen(false);
    }
  };

  const handleExportJson = () => {
    if (data) {
      const filename = `aws-costs-${data.time_period.start}-to-${data.time_period.end}.json`;
      exportToJson(data, filename);
      setIsOpen(false);
    }
  };

  const handleExportReport = () => {
    if (data) {
      const report = generateSummaryReport(data);
      const blob = new Blob([report], { type: 'text/plain;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        const filename = `aws-cost-report-${data.time_period.start}-to-${data.time_period.end}.txt`;
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      setIsOpen(false);
    }
  };

  if (!data || disabled) {
    return (
      <button
        disabled
        className="px-3 py-2 bg-gray-300 text-gray-500 text-sm rounded-md cursor-not-allowed flex items-center space-x-1"
      >
        <span>📁</span>
        <span>Export</span>
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 flex items-center space-x-1"
      >
        <span>📁</span>
        <span>Export</span>
        <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-10">
          <div className="py-1">
            <button
              onClick={handleExportCsv}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
            >
              <span>📊</span>
              <span>Export as CSV</span>
            </button>
            <button
              onClick={handleExportJson}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
            >
              <span>🔗</span>
              <span>Export as JSON</span>
            </button>
            <button
              onClick={handleExportReport}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
            >
              <span>📄</span>
              <span>Summary Report</span>
            </button>
          </div>
        </div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default ExportButton;