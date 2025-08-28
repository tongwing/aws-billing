import { FilterState } from '../types/billing';
import { getDefaultDateRange } from './dateHelpers';

// URL parameter mappings
export const URL_PARAMS = {
  START_DATE: 'startDate',
  END_DATE: 'endDate',
  GRANULARITY: 'granularity', 
  GROUP_BY: 'groupBy',
  METRICS: 'metrics',
  SERVICE_FILTER: 'service',
  REGION_FILTER: 'region',
  CHARGE_TYPE: 'chargeType',
  INCLUDE_SUPPORT: 'support',
  INCLUDE_OTHER_SUB: 'otherSub',
  INCLUDE_UPFRONT: 'upfront',
  INCLUDE_REFUND: 'refund',
  INCLUDE_CREDIT: 'credit',
  INCLUDE_RI_FEE: 'riFee',
  ACTIVE_TAB: 'tab',
} as const;

// Convert FilterState to URL search parameters
export const filtersToUrlParams = (filters: FilterState, activeTab?: string): URLSearchParams => {
  const params = new URLSearchParams();

  // Required parameters
  params.set(URL_PARAMS.START_DATE, filters.startDate);
  params.set(URL_PARAMS.END_DATE, filters.endDate);
  params.set(URL_PARAMS.GRANULARITY, filters.granularity);
  params.set(URL_PARAMS.METRICS, filters.metrics.join(','));

  // Optional parameters
  if (filters.groupByDimension) {
    params.set(URL_PARAMS.GROUP_BY, filters.groupByDimension);
  }
  if (filters.serviceFilter) {
    params.set(URL_PARAMS.SERVICE_FILTER, filters.serviceFilter);
  }
  if (filters.regionFilter) {
    params.set(URL_PARAMS.REGION_FILTER, filters.regionFilter);
  }
  if (filters.chargeType) {
    params.set(URL_PARAMS.CHARGE_TYPE, filters.chargeType);
  }

  // Boolean parameters (only add if different from defaults to keep URL clean)
  const defaults = {
    includeSupport: true,
    includeOtherSubscription: true,
    includeUpfront: true,
    includeRefund: true,
    includeCredit: false,
    includeRiFee: true,
  };

  if (filters.includeSupport !== defaults.includeSupport) {
    params.set(URL_PARAMS.INCLUDE_SUPPORT, filters.includeSupport.toString());
  }
  if (filters.includeOtherSubscription !== defaults.includeOtherSubscription) {
    params.set(URL_PARAMS.INCLUDE_OTHER_SUB, filters.includeOtherSubscription.toString());
  }
  if (filters.includeUpfront !== defaults.includeUpfront) {
    params.set(URL_PARAMS.INCLUDE_UPFRONT, filters.includeUpfront.toString());
  }
  if (filters.includeRefund !== defaults.includeRefund) {
    params.set(URL_PARAMS.INCLUDE_REFUND, filters.includeRefund.toString());
  }
  if (filters.includeCredit !== defaults.includeCredit) {
    params.set(URL_PARAMS.INCLUDE_CREDIT, filters.includeCredit.toString());
  }
  if (filters.includeRiFee !== defaults.includeRiFee) {
    params.set(URL_PARAMS.INCLUDE_RI_FEE, filters.includeRiFee.toString());
  }

  // Active tab
  if (activeTab && activeTab !== 'overview') {
    params.set(URL_PARAMS.ACTIVE_TAB, activeTab);
  }

  return params;
};

// Convert URL search parameters to FilterState
export const urlParamsToFilters = (searchParams: URLSearchParams): { filters: FilterState; activeTab: string } => {
  const defaultRange = getDefaultDateRange(30);
  const today = new Date().toISOString().split('T')[0];

  // Default values that match Dashboard component
  const defaults = {
    includeSupport: true,
    includeOtherSubscription: true,
    includeUpfront: true,
    includeRefund: true,
    includeCredit: false,
    includeRiFee: true,
  };

  // Parse metrics (required parameter)
  const metricsParam = searchParams.get(URL_PARAMS.METRICS);
  const metrics = metricsParam ? metricsParam.split(',').filter(m => m.trim()) : ['BlendedCost'];

  // Build FilterState from URL params with defaults
  const filters: FilterState = {
    startDate: searchParams.get(URL_PARAMS.START_DATE) || defaultRange.start,
    endDate: searchParams.get(URL_PARAMS.END_DATE) || today,
    granularity: (searchParams.get(URL_PARAMS.GRANULARITY) as 'DAILY' | 'MONTHLY') || 'DAILY',
    groupByDimension: searchParams.get(URL_PARAMS.GROUP_BY) || undefined,
    metrics,
    serviceFilter: searchParams.get(URL_PARAMS.SERVICE_FILTER) || undefined,
    regionFilter: searchParams.get(URL_PARAMS.REGION_FILTER) || undefined,
    chargeType: searchParams.get(URL_PARAMS.CHARGE_TYPE) || undefined,
    // Use defaults if parameter is not present, otherwise parse the value
    includeSupport: searchParams.has(URL_PARAMS.INCLUDE_SUPPORT) 
      ? searchParams.get(URL_PARAMS.INCLUDE_SUPPORT) === 'true' 
      : defaults.includeSupport,
    includeOtherSubscription: searchParams.has(URL_PARAMS.INCLUDE_OTHER_SUB) 
      ? searchParams.get(URL_PARAMS.INCLUDE_OTHER_SUB) === 'true' 
      : defaults.includeOtherSubscription,
    includeUpfront: searchParams.has(URL_PARAMS.INCLUDE_UPFRONT) 
      ? searchParams.get(URL_PARAMS.INCLUDE_UPFRONT) === 'true' 
      : defaults.includeUpfront,
    includeRefund: searchParams.has(URL_PARAMS.INCLUDE_REFUND) 
      ? searchParams.get(URL_PARAMS.INCLUDE_REFUND) === 'true' 
      : defaults.includeRefund,
    includeCredit: searchParams.has(URL_PARAMS.INCLUDE_CREDIT) 
      ? searchParams.get(URL_PARAMS.INCLUDE_CREDIT) === 'true' 
      : defaults.includeCredit,
    includeRiFee: searchParams.has(URL_PARAMS.INCLUDE_RI_FEE) 
      ? searchParams.get(URL_PARAMS.INCLUDE_RI_FEE) === 'true' 
      : defaults.includeRiFee,
  };

  const activeTab = searchParams.get(URL_PARAMS.ACTIVE_TAB) || 'overview';

  return { filters, activeTab };
};

// Validate and sanitize filters from URL
export const validateUrlFilters = (filters: FilterState): FilterState => {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const minDate = new Date(now.getFullYear() - 2, 0, 1).toISOString().split('T')[0];

  return {
    ...filters,
    // Validate dates
    startDate: (filters.startDate >= minDate && filters.startDate <= today) ? filters.startDate : getDefaultDateRange(30).start,
    endDate: (filters.endDate >= minDate && filters.endDate <= today) ? filters.endDate : today,
    // Validate granularity
    granularity: (['DAILY', 'MONTHLY'].includes(filters.granularity)) ? filters.granularity : 'DAILY',
    // Validate metrics
    metrics: filters.metrics.length > 0 ? filters.metrics : ['BlendedCost'],
  };
};

// Update URL without causing navigation
export const updateUrlWithFilters = (filters: FilterState, activeTab?: string) => {
  const params = filtersToUrlParams(filters, activeTab);
  const newUrl = `${window.location.pathname}?${params.toString()}`;
  
  // Use replaceState to update URL without adding to browser history
  window.history.replaceState(null, '', newUrl);
};

// Parse current URL parameters
export const parseCurrentUrlParams = (): { filters: FilterState; activeTab: string } => {
  const searchParams = new URLSearchParams(window.location.search);
  const { filters, activeTab } = urlParamsToFilters(searchParams);
  return { filters: validateUrlFilters(filters), activeTab };
};