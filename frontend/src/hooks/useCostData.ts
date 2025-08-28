import { useState, useEffect, useCallback } from 'react';
import { costApi } from '../services/api';
import { CostDataResponse, FilterState } from '../types/billing';
import { useCredentials } from '../contexts/CredentialsContext';

export const useCostData = (filters: FilterState) => {
  const { credentials, hasCredentials } = useCredentials();
  const [data, setData] = useState<CostDataResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    // Don't fetch if no credentials
    if (!hasCredentials || !credentials) {
      setError('AWS credentials are required. Please configure your credentials.');
      return;
    }

    setLoading(true);
    setError(null);
    
    console.log('Fetching cost data with filters:', {
      start_date: filters.startDate,
      end_date: filters.endDate,
      granularity: filters.granularity
    });
    
    try {
      const response = await costApi.getCostData(credentials, {
        start_date: filters.startDate,
        end_date: filters.endDate,
        granularity: filters.granularity,
        group_by_dimension: filters.groupByDimension,
        metrics: filters.metrics.join(','),
        service_filter: filters.serviceFilter,
        region_filter: filters.regionFilter,
        charge_type: filters.chargeType,
        include_support: filters.includeSupport,
        include_other_subscription: filters.includeOtherSubscription,
        include_upfront: filters.includeUpfront,
        include_refund: filters.includeRefund,
        include_credit: filters.includeCredit,
        include_ri_fee: filters.includeRiFee,
      });
      
      setData(response);
    } catch (err: any) {
      console.error('Cost data fetch error:', err);
      let errorMessage = 'Failed to fetch cost data';
      
      // Extract error message from axios response
      if (err.response?.data?.detail) {
        // Backend sends error details in the 'detail' field
        errorMessage = err.response.data.detail;
      } else if (err.response?.status === 400) {
        // Generic 400 error - likely credential issue
        errorMessage = 'Invalid or expired AWS credentials. Please update your credentials.';
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [
    credentials,
    hasCredentials,
    filters.startDate,
    filters.endDate,
    filters.granularity,
    filters.groupByDimension,
    filters.metrics,
    filters.serviceFilter,
    filters.regionFilter,
    filters.chargeType,
    filters.includeSupport,
    filters.includeOtherSubscription,
    filters.includeUpfront,
    filters.includeRefund,
    filters.includeCredit,
    filters.includeRiFee
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};