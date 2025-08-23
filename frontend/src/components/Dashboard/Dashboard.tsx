import React, { useState } from 'react';
import { useCostData } from '../../hooks/useCostData';
import { FilterState } from '../../types/billing';
import { getDefaultDateRange } from '../../utils/dateHelpers';
import LoadingSpinner from '../Common/LoadingSpinner';
import CostChart from './CostChart';
import FilterPanel from './FilterPanel';
import SummaryCards from './SummaryCards';
import ServiceBreakdown from './ServiceBreakdown';

const Dashboard: React.FC = () => {
  const [filters, setFilters] = useState<FilterState>(() => {
    const defaultRange = getDefaultDateRange(30);
    return {
      startDate: defaultRange.start,
      endDate: defaultRange.end,
      granularity: 'DAILY',
      metrics: ['BlendedCost'],
      includeSupport: true,
      includeOtherSubscription: true,
      includeUpfront: true,
      includeRefund: true,
      includeCredit: false,
      includeRiFee: true,
    };
  });
  const [activeTab, setActiveTab] = useState<'overview' | 'services'>('overview');

  const { data, loading, error, refetch } = useCostData(filters);

  const handleFiltersChange = (newFilters: FilterState) => {
    console.log('Dashboard receiving new filters:', newFilters);
    setFilters(newFilters);
  };

  const handleRefresh = () => {
    refetch();
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-600 text-xl mb-2">⚠️ Error Loading Data</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">AWS Billing Dashboard</h1>
          <p className="mt-2 text-gray-600">Monitor your AWS costs and usage with real-time insights</p>
        </div>

        {/* Summary Cards */}
        <div className="mb-6">
          <SummaryCards data={data} loading={loading} />
        </div>

        {/* Tabs Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📊 Overview
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'services'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🔧 Service Breakdown
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Chart and Main Content Area */}
          <div className="xl:col-span-3 space-y-6">
            {activeTab === 'overview' && (
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6">
                  <CostChart data={data} loading={loading} />
                </div>
              </div>
            )}

            {activeTab === 'services' && (
              <ServiceBreakdown data={data} loading={loading} />
            )}
          </div>

          {/* Filter Panel */}
          <div className="xl:col-span-1">
            <FilterPanel
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onRefresh={handleRefresh}
              loading={loading}
            />
          </div>
        </div>

        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <LoadingSpinner size="lg" text="Loading cost data..." />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;