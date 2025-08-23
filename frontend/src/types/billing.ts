export interface TimePeriod {
  start: string;
  end: string;
}

export interface Metrics {
  amount: string;
  unit: string;
}

export interface GroupMetrics {
  BlendedCost?: Metrics;
  UnblendedCost?: Metrics;
  UsageQuantity?: Metrics;
}

export interface Group {
  keys: string[];
  metrics: GroupMetrics;
}

export interface ResultByTime {
  time_period: TimePeriod;
  total?: GroupMetrics;
  groups: Group[];
  estimated: boolean;
}

export interface CostDataResponse {
  time_period: TimePeriod;
  granularity: string;
  group_by: Array<{ Type: string; Key: string }>;
  results: ResultByTime[];
  dimension_key?: string;
  next_page_token?: string;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  aws_config: boolean;
}

export interface FilterState {
  startDate: string;
  endDate: string;
  granularity: 'DAILY' | 'MONTHLY';
  groupByDimension?: string;
  metrics: string[];
  serviceFilter?: string;
  regionFilter?: string;
  chargeType?: string;
  includeSupport: boolean;
  includeOtherSubscription: boolean;
  includeUpfront: boolean;
  includeRefund: boolean;
  includeCredit: boolean;
  includeRiFee: boolean;
}