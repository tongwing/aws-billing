import React, { useState } from 'react';
import { useCostData } from '../../hooks/useCostData';
import { FilterState } from '../../types/billing';
import { getDefaultDateRange } from '../../utils/dateHelpers';
import LoadingSpinner from '../Common/LoadingSpinner';

const Dashboard: React.FC = () => {
  const [filters, setFilters] = useState<FilterState>(() => {
    const defaultRange = getDefaultDateRange(30);
    return {
      startDate: defaultRange.start,
      endDate: defaultRange.end,
      granularity: 'DAILY',
      metrics: ['BlendedCost'],
    };
  });

  const { data, loading, error } = useCostData(filters);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading cost data..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-2">Error</div>
          <div className="text-gray-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">AWS Billing Dashboard</h1>
          <p className="mt-2 text-gray-600">Monitor your AWS costs and usage</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Chart Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Cost and Usage Graph</h2>
              {data ? (
                <div className="h-96 flex items-center justify-center border-2 border-dashed border-gray-300 rounded">
                  <div className="text-center">
                    <div className="text-gray-500 mb-2">Chart will be implemented in Phase 2</div>
                    <div className="text-sm text-gray-400">
                      Data loaded: {data.results.length} time periods
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-96 flex items-center justify-center">
                  <div className="text-gray-500">No data available</div>
                </div>
              )}
            </div>
          </div>

          {/* Report Parameters Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Report Parameters</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date Range
                  </label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mt-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Granularity
                  </label>
                  <select
                    value={filters.granularity}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      granularity: e.target.value as 'DAILY' | 'WEEKLY' | 'MONTHLY' 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Group By
                  </label>
                  <select
                    value={filters.groupByDimension || ''}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      groupByDimension: e.target.value || undefined 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">None</option>
                    <option value="SERVICE">Service</option>
                    <option value="LINKED_ACCOUNT">Linked Account</option>
                    <option value="REGION">Region</option>
                    <option value="USAGE_TYPE">Usage Type</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Debug Info */}
        {data && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Debug Information</h3>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;