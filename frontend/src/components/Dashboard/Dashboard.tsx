import React, { useState } from 'react';
import { useCostData } from '../../hooks/useCostData';
import { useAccountInfo } from '../../hooks/useAccountInfo';
import { useCredentials } from '../../contexts/CredentialsContext';
import { FilterState } from '../../types/billing';
import { getDefaultDateRange } from '../../utils/dateHelpers';
import LoadingSpinner from '../Common/LoadingSpinner';
import CredentialsModal from '../Credentials/CredentialsModal';
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
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);

  const { hasCredentials } = useCredentials();
  const { data, loading, error, refetch } = useCostData(filters);
  const { accountInfo } = useAccountInfo();

  const handleFiltersChange = (newFilters: FilterState) => {
    console.log('Dashboard receiving new filters:', newFilters);
    setFilters(newFilters);
  };

  const handleRefresh = () => {
    refetch();
  };

  const openCredentialsModal = () => {
    setShowCredentialsModal(true);
  };

  const closeCredentialsModal = () => {
    setShowCredentialsModal(false);
  };

  // Show error screen for non-credential related errors
  if (error && !error.includes('AWS credentials')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-lg">
          <div className="text-red-600 text-xl mb-2">⚠️ Error Loading Data</div>
          <div className="text-gray-600 mb-4 text-left bg-red-50 border border-red-200 rounded-md p-4">
            <p className="font-medium text-red-800 mb-2">Error Details:</p>
            <p className="text-red-700">{error}</p>
          </div>
          <div className="space-x-3">
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Try Again
            </button>
            <button
              onClick={openCredentialsModal}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Check Credentials
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              AWS Billing Dashboard
              {accountInfo?.account_id && (
                <span className="ml-3 text-lg font-normal text-gray-600">
                  ({accountInfo.account_id})
                </span>
              )}
            </h1>
            <button
              onClick={openCredentialsModal}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center space-x-2"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9a2 2 0 012-2m0 0V7a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span>{hasCredentials ? 'Manage' : 'Configure'} Credentials</span>
            </button>
          </div>
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <LoadingSpinner size="lg" text="Loading cost data..." />
            </div>
          </div>
        )}
      </div>

      {/* Credentials Modal */}
      <CredentialsModal
        isOpen={showCredentialsModal}
        onClose={closeCredentialsModal}
      />
    </div>
  );
};

export default Dashboard;