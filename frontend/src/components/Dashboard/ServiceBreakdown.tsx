import React, { useMemo, useState } from 'react';
import { CostDataResponse } from '../../types/billing';
import { formatCurrency } from '../../utils/dateHelpers';

interface ServiceBreakdownProps {
  data: CostDataResponse | null;
  loading?: boolean;
}

interface ServiceData {
  name: string;
  cost: number;
  unit: string;
  percentage: number;
  trend?: 'up' | 'down' | 'stable';
}

const ServiceBreakdown: React.FC<ServiceBreakdownProps> = ({ data, loading }) => {
  const [sortBy, setSortBy] = useState<'cost' | 'name' | 'percentage'>('cost');
  const [showAll, setShowAll] = useState(false);

  const serviceData = useMemo(() => {
    if (!data || !data.results || data.results.length === 0) {
      return [];
    }

    // Only show service breakdown if data is grouped by service
    const isGroupedByService = data.group_by?.some(group => group.Key === 'SERVICE');
    
    if (!isGroupedByService) {
      return [];
    }

    // Aggregate costs by service across all time periods
    const serviceMap = new Map<string, number>();
    const unitMap = new Map<string, string>();
    
    data.results.forEach(result => {
      result.groups.forEach(group => {
        if (group.keys.length > 0 && group.metrics.BlendedCost) {
          const serviceName = group.keys[0];
          const cost = parseFloat(group.metrics.BlendedCost.amount);
          const unit = group.metrics.BlendedCost.unit;
          
          serviceMap.set(serviceName, (serviceMap.get(serviceName) || 0) + cost);
          unitMap.set(serviceName, unit);
        }
      });
    });

    const totalCost = Array.from(serviceMap.values()).reduce((sum, cost) => sum + cost, 0);
    
    const services: ServiceData[] = Array.from(serviceMap.entries()).map(([name, cost]) => ({
      name,
      cost,
      unit: unitMap.get(name) || 'USD',
      percentage: (cost / totalCost) * 100,
      trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable' // Mock trend for now
    }));

    // Sort services
    services.sort((a, b) => {
      switch (sortBy) {
        case 'cost':
          return b.cost - a.cost;
        case 'percentage':
          return b.percentage - a.percentage;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return b.cost - a.cost;
      }
    });

    return services;
  }, [data, sortBy]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data || serviceData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Breakdown</h3>
        <div className="text-center text-gray-500 py-8">
          <div className="text-4xl mb-2">📊</div>
          <div className="text-sm">
            {data ? 'Group by "Service" to see service breakdown' : 'No data available'}
          </div>
        </div>
      </div>
    );
  }

  const displayedServices = showAll ? serviceData : serviceData.slice(0, 10);
  const totalCost = serviceData.reduce((sum, service) => sum + service.cost, 0);

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up':
        return <span className="text-red-500">↗️</span>;
      case 'down':
        return <span className="text-green-500">↘️</span>;
      default:
        return <span className="text-gray-400">➡️</span>;
    }
  };

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 20) return 'bg-red-500';
    if (percentage >= 10) return 'bg-amber-500';
    if (percentage >= 5) return 'bg-blue-500';
    return 'bg-gray-400';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Service Breakdown</h3>
        <div className="flex items-center space-x-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'cost' | 'name' | 'percentage')}
            className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="cost">Sort by Cost</option>
            <option value="percentage">Sort by Percentage</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {displayedServices.map((service, index) => (
          <div key={service.name} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg">
            <div className="flex-shrink-0 w-8 text-center">
              <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900 truncate">
                  {service.name}
                </span>
                {getTrendIcon(service.trend)}
              </div>
              <div className="mt-1 flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getPercentageColor(service.percentage)}`}
                    style={{ width: `${Math.min(service.percentage, 100)}%` }}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex-shrink-0 text-right">
              <div className="font-semibold text-gray-900">
                {formatCurrency(service.cost.toString(), service.unit)}
              </div>
              <div className="text-sm text-gray-500">
                {service.percentage.toFixed(1)}%
              </div>
            </div>
          </div>
        ))}
      </div>

      {serviceData.length > 10 && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            {showAll ? 'Show Less' : `Show All ${serviceData.length} Services`}
          </button>
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="font-medium text-blue-900">Total Services</div>
            <div className="text-xl font-bold text-blue-900">{serviceData.length}</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="font-medium text-green-900">Total Cost</div>
            <div className="text-xl font-bold text-green-900">
              {formatCurrency(totalCost.toString())}
            </div>
          </div>
          <div className="bg-amber-50 p-3 rounded-lg">
            <div className="font-medium text-amber-900">Top 3 Services</div>
            <div className="text-sm text-amber-900 mt-1">
              {serviceData.slice(0, 3).reduce((sum, service) => sum + service.percentage, 0).toFixed(1)}% of total
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceBreakdown;