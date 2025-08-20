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
    
    try {
      const response = await costApi.getCostData({
        start_date: filters.startDate,
        end_date: filters.endDate,
        granularity: filters.granularity,
        group_by_dimension: filters.groupByDimension,
        metrics: filters.metrics.join(','),
      });
      
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cost data');
    } finally {
      setLoading(false);
    }
  }, [filters.startDate, filters.endDate, filters.granularity, filters.groupByDimension, filters.metrics]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};