import axios from 'axios';
import { CostDataResponse, HealthResponse } from '../types/billing';
import { AWSCredentials } from './credentials';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

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

export const credentialsApi = {
  validateCredentials: async (credentials: AWSCredentials): Promise<{ valid: boolean; error?: string; account_id?: string }> => {
    const response = await api.post<{ valid: boolean; error?: string; account_id?: string }>('/validate-credentials', {
      credentials
    });
    return response.data;
  },
};

export const costApi = {
  getCostData: async (credentials: AWSCredentials, params: {
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
    // Use the simplified endpoint that accepts a dictionary
    const requestData = {
      credentials,
      ...params
    };
    
    const response = await api.post<CostDataResponse>('/cost-data-simple', requestData);
    return response.data;
  },

  getDimensionValues: async (
    credentials: AWSCredentials,
    dimension: string,
    params?: {
      start_date?: string;
      end_date?: string;
    }
  ): Promise<{ dimension: string; values: string[] }> => {
    // Build time period
    const timePeriod = {
      start: params?.start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: params?.end_date || new Date().toISOString().split('T')[0]
    };
    
    const response = await api.post<{ dimension: string; values: string[] }>('/dimensions', {
      credentials,
      dimension,
      time_period: timePeriod
    });
    return response.data;
  },

  getAccountInfo: async (credentials: AWSCredentials): Promise<{ account_id: string; user_id: string; arn: string }> => {
    const response = await api.post<{ account_id: string; user_id: string; arn: string }>('/account-info', {
      credentials
    });
    return response.data;
  },
};

export default api;