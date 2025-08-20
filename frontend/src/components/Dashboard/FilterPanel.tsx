import React, { useState } from 'react';
import { FilterState } from '../../types/billing';
import DateRangePicker from '../Common/DateRangePicker';

interface FilterPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onRefresh: () => void;
  loading?: boolean;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  onRefresh,
  loading = false
}) => {
  const [, setSelectedPreset] = useState('30');

  const updateFilter = (key: keyof FilterState, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const dimensionOptions = [
    { value: '', label: 'None (Total)' },
    { value: 'SERVICE', label: 'Service' },
    { value: 'LINKED_ACCOUNT', label: 'Linked Account' },
    { value: 'REGION', label: 'Region' },
    { value: 'USAGE_TYPE', label: 'Usage Type' },
    { value: 'INSTANCE_TYPE', label: 'Instance Type' },
    { value: 'PLATFORM', label: 'Platform' },
  ];

  const metricsOptions = [
    { value: 'BlendedCost', label: 'Blended Cost' },
    { value: 'UnblendedCost', label: 'Unblended Cost' },
    { value: 'UsageQuantity', label: 'Usage Quantity' },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Report Parameters</h2>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
        >
          <span className={loading ? 'animate-spin' : ''}>
            {loading ? '⟳' : '🔄'}
          </span>
          <span>Refresh</span>
        </button>
      </div>

      {/* Time Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
          <span className="mr-2">🕒</span>
          Time
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Granularity
            </label>
            <select
              value={filters.granularity}
              onChange={(e) => updateFilter('granularity', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
            </select>
          </div>

          <DateRangePicker
            startDate={filters.startDate}
            endDate={filters.endDate}
            onStartDateChange={(date) => updateFilter('startDate', date)}
            onEndDateChange={(date) => updateFilter('endDate', date)}
            onPresetSelect={setSelectedPreset}
          />
        </div>
      </div>

      {/* Group By Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
          <span className="mr-2">📊</span>
          Group by
        </h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dimension
          </label>
          <select
            value={filters.groupByDimension || ''}
            onChange={(e) => updateFilter('groupByDimension', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {dimensionOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {filters.groupByDimension && (
            <p className="mt-1 text-xs text-gray-500">
              Costs will be broken down by {filters.groupByDimension.toLowerCase().replace('_', ' ')}
            </p>
          )}
        </div>
      </div>

      {/* Metrics Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
          <span className="mr-2">💰</span>
          Metrics
        </h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cost Type
          </label>
          <select
            value={filters.metrics[0] || 'BlendedCost'}
            onChange={(e) => updateFilter('metrics', [e.target.value])}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {metricsOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Current Selection Summary */}
      <div className="bg-gray-50 p-4 rounded-lg border-t">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Current Selection</h4>
        <div className="space-y-1 text-xs text-gray-600">
          <div>📅 {filters.granularity.toLowerCase()} from {new Date(filters.startDate).toLocaleDateString()} to {new Date(filters.endDate).toLocaleDateString()}</div>
          <div>📊 {filters.groupByDimension ? `Grouped by ${filters.groupByDimension.toLowerCase().replace('_', ' ')}` : 'Total costs'}</div>
          <div>💰 Showing {filters.metrics[0]?.toLowerCase().replace(/([A-Z])/g, ' $1').trim() || 'blended cost'}</div>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;