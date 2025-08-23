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
    console.log(`Updating filter ${key}:`, value);
    const newFilters = {
      ...filters,
      [key]: value
    };
    console.log('New filters:', newFilters);
    onFiltersChange(newFilters);
  };

  const updateDateRange = (startDate: string, endDate: string) => {
    console.log(`Updating date range: ${startDate} to ${endDate}`);
    const newFilters = {
      ...filters,
      startDate,
      endDate
    };
    console.log('New filters with date range:', newFilters);
    onFiltersChange(newFilters);
  };

  const dimensionOptions = [
    { value: '', label: 'None (Total)' },
    { value: 'SERVICE', label: 'Service' },
    { value: 'LINKED_ACCOUNT', label: 'Linked Account' },
    { value: 'REGION', label: 'Region' },
    { value: 'USAGE_TYPE', label: 'Usage Type' },
    { value: 'INSTANCE_TYPE', label: 'Instance Type' },
    { value: 'PLATFORM', label: 'Platform' },
    { value: 'RECORD_TYPE', label: 'Record Type' },
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
              <option value="MONTHLY">Monthly</option>
            </select>
          </div>

          <DateRangePicker
            startDate={filters.startDate}
            endDate={filters.endDate}
            onStartDateChange={(date) => updateFilter('startDate', date)}
            onEndDateChange={(date) => updateFilter('endDate', date)}
            onDateRangeChange={updateDateRange}
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

      {/* Advanced Filters Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
          <span className="mr-2">🎯</span>
          Advanced Filters
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Filter
            </label>
            <input
              type="text"
              value={filters.serviceFilter || ''}
              onChange={(e) => updateFilter('serviceFilter', e.target.value || undefined)}
              placeholder="e.g., Amazon EC2"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Region Filter
            </label>
            <input
              type="text"
              value={filters.regionFilter || ''}
              onChange={(e) => updateFilter('regionFilter', e.target.value || undefined)}
              placeholder="e.g., us-east-1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Charge Type
            </label>
            <select
              value={filters.chargeType || ''}
              onChange={(e) => updateFilter('chargeType', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Charges</option>
              <option value="Usage">Usage</option>
              <option value="Tax">Tax</option>
              <option value="Credit">Credit</option>
              <option value="Refund">Refund</option>
              <option value="Fee">Fee</option>
              <option value="RIFee">RI Fee</option>
              <option value="Support">Support</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Charge Type Inclusions
            </label>
            <div className="space-y-2">
              {[
                { key: 'includeSupport', label: 'Support charges' },
                { key: 'includeOtherSubscription', label: 'Other subscription costs' },
                { key: 'includeUpfront', label: 'Upfront reservation fees' },
                { key: 'includeRefund', label: 'Refunds' },
                { key: 'includeCredit', label: 'Credits' },
                { key: 'includeRiFee', label: 'Reserved instance fees' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={filters[key as keyof FilterState] as boolean}
                    onChange={(e) => updateFilter(key as keyof FilterState, e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Current Selection Summary */}
      <div className="bg-gray-50 p-4 rounded-lg border-t">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Current Selection</h4>
        <div className="space-y-1 text-xs text-gray-600">
          <div>📅 {filters.granularity.toLowerCase()} from {new Date(filters.startDate).toLocaleDateString()} to {new Date(filters.endDate).toLocaleDateString()}</div>
          <div>📊 {filters.groupByDimension ? `Grouped by ${filters.groupByDimension.toLowerCase().replace('_', ' ')}` : 'Total costs'}</div>
          <div>💰 Showing {filters.metrics[0]?.toLowerCase().replace(/([A-Z])/g, ' $1').trim() || 'blended cost'}</div>
          {filters.serviceFilter && <div>🔧 Service: {filters.serviceFilter}</div>}
          {filters.regionFilter && <div>🌍 Region: {filters.regionFilter}</div>}
          {filters.chargeType && <div>💳 Charge type: {filters.chargeType}</div>}
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;