import React from 'react';
import { CostDataResponse } from '../../types/billing';
import { formatCurrency } from '../../utils/dateHelpers';

interface SummaryCardsProps {
  data: CostDataResponse | null;
  loading?: boolean;
  visibleDatasets?: string[];
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ data, loading, visibleDatasets = [] }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow animate-pulse">
            <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!data || !data.results || data.results.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border-2 border-dashed border-gray-300">
          <div className="text-center text-gray-500">No data available</div>
        </div>
      </div>
    );
  }

  // Helper function to filter groups based on visible datasets
  const isGroupVisible = (group: any) => {
    // If no datasets are specified (initial load), show all data
    if (visibleDatasets.length === 0) return true;
    
    // If we have group data, check if this group's key is in visible datasets
    if (group.keys && group.keys.length > 0) {
      return visibleDatasets.includes(group.keys[0]);
    }
    
    return true;
  };

  // Calculate metrics with dataset visibility filtering
  const totalCost = data.results.reduce((sum, result) => {
    // For ungrouped data (total cost only), check if "Total Cost" dataset is visible
    if (result.total?.BlendedCost) {
      const shouldInclude = visibleDatasets.length === 0 || visibleDatasets.includes('Total Cost');
      return shouldInclude ? sum + parseFloat(result.total.BlendedCost.amount) : sum;
    }
    
    // For grouped data, only include visible groups
    return sum + result.groups.reduce((groupSum, group) => {
      if (!isGroupVisible(group)) return groupSum;
      return groupSum + (group.metrics.BlendedCost ? parseFloat(group.metrics.BlendedCost.amount) : 0);
    }, 0);
  }, 0);

  const dailyAverage = totalCost / data.results.length;
  
  const costs = data.results.map(result => {
    // For ungrouped data (total cost only), check if "Total Cost" dataset is visible
    if (result.total?.BlendedCost) {
      const shouldInclude = visibleDatasets.length === 0 || visibleDatasets.includes('Total Cost');
      return shouldInclude ? parseFloat(result.total.BlendedCost.amount) : 0;
    }
    
    // For grouped data, only include visible groups
    return result.groups.reduce((sum, group) => {
      if (!isGroupVisible(group)) return sum;
      return sum + (group.metrics.BlendedCost ? parseFloat(group.metrics.BlendedCost.amount) : 0);
    }, 0);
  });

  // Handle edge case where all costs might be zero (all datasets hidden)
  const validCosts = costs.filter(cost => cost > 0);
  const maxCost = validCosts.length > 0 ? Math.max(...validCosts) : 0;
  const minCost = validCosts.length > 0 ? Math.min(...validCosts) : 0;
  
  // Calculate trend (compare first half vs second half of period)
  const midPoint = Math.floor(costs.length / 2);
  const firstHalfAvg = costs.slice(0, midPoint).reduce((sum, cost) => sum + cost, 0) / midPoint;
  const secondHalfAvg = costs.slice(midPoint).reduce((sum, cost) => sum + cost, 0) / (costs.length - midPoint);
  const trendPercent = firstHalfAvg > 0 ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 : 0;

  // Check if we're showing filtered data
  const isFiltered = visibleDatasets.length > 0;
  const hasGroupedData = data.group_by && data.group_by.length > 0;

  const cards = [
    {
      title: isFiltered && hasGroupedData ? 'Filtered Total' : 'Total Cost',
      value: formatCurrency(totalCost.toString()),
      subtitle: isFiltered && hasGroupedData 
        ? `${visibleDatasets.length} visible datasets` 
        : `${data.results.length} ${data.granularity.toLowerCase()} periods`,
      icon: '💰',
      color: 'blue',
    },
    {
      title: 'Daily Average',
      value: formatCurrency(dailyAverage.toString()),
      subtitle: data.granularity === 'DAILY' ? 'Per day' : `Per ${data.granularity.toLowerCase().slice(0, -2)}`,
      icon: '📊',
      color: 'green',
    },
    {
      title: 'Peak Cost',
      value: formatCurrency(maxCost.toString()),
      subtitle: `Min: ${formatCurrency(minCost.toString())}`,
      icon: '📈',
      color: 'amber',
    },
    {
      title: 'Trend',
      value: `${trendPercent > 0 ? '+' : ''}${trendPercent.toFixed(1)}%`,
      subtitle: trendPercent > 0 ? 'Increasing' : trendPercent < 0 ? 'Decreasing' : 'Stable',
      icon: trendPercent > 0 ? '↗️' : trendPercent < 0 ? '↘️' : '➡️',
      color: trendPercent > 0 ? 'red' : trendPercent < 0 ? 'green' : 'gray',
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      amber: 'bg-amber-50 text-amber-600 border-amber-200',
      red: 'bg-red-50 text-red-600 border-red-200',
      gray: 'bg-gray-50 text-gray-600 border-gray-200',
    };
    return colors[color as keyof typeof colors] || colors.gray;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`p-4 rounded-lg border-2 ${getColorClasses(card.color)} transition-transform hover:scale-105`}
        >
          <div className="flex items-center justify-between mb-1">
            <div className="text-sm font-medium opacity-80">{card.title}</div>
            <div className="text-lg">{card.icon}</div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-xl font-bold">{card.value}</div>
            <div className="text-xs opacity-70">{card.subtitle}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;