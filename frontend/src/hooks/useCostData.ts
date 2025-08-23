import { useState, useEffect, useCallback } from 'react';
import { costApi } from '../services/api';
import { CostDataResponse, FilterState } from '../types/billing';

export const useCostData = (filters: FilterState) => {
  const [data, setData] = useState<CostDataResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    console.log('Fetching cost data with filters:', {
      start_date: filters.startDate,
      end_date: filters.endDate,
      granularity: filters.granularity
    });
    
    try {
      const response = await costApi.getCostData({
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cost data');
    } finally {
      setLoading(false);
    }
  }, [
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