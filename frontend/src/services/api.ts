import axios from 'axios';
import { CostDataResponse, HealthResponse } from '../types/billing';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

export const healthApi = {
  checkHealth: async (): Promise<HealthResponse> => {
    const response = await api.get<HealthResponse>('/health');
    return response.data;
  },
};

export const costApi = {
  getCostData: async (params: {
    start_date?: string;
    end_date?: string;
    granularity?: string;
    group_by_dimension?: string;
    metrics?: string;
    service_filter?: string;
    region_filter?: string;
    charge_type?: string;
    include_support?: boolean;
    include_other_subscription?: boolean;
    include_upfront?: boolean;
    include_refund?: boolean;
    include_credit?: boolean;
    include_ri_fee?: boolean;
  }): Promise<CostDataResponse> => {
    const response = await api.get<CostDataResponse>('/cost-data', { params });
    return response.data;
  },

  getDimensionValues: async (
    dimension: string,
    params?: {
      start_date?: string;
      end_date?: string;
    }
  ): Promise<{ dimension: string; values: string[] }> => {
    const response = await api.get<{ dimension: string; values: string[] }>(`/dimensions/${dimension}`, { params });
    return response.data;
  },
};

export default api;