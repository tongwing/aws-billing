import React from 'react';
import { CostDataResponse } from '../../types/billing';
import { formatCurrency } from '../../utils/dateHelpers';

interface SummaryCardsProps {
  data: CostDataResponse | null;
  loading?: boolean;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!data || !data.results || data.results.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border-2 border-dashed border-gray-300">
          <div className="text-center text-gray-500">No data available</div>
        </div>
      </div>
    );
  }

  // Calculate metrics
  const totalCost = data.results.reduce((sum, result) => {
    if (result.total?.BlendedCost) {
      return sum + parseFloat(result.total.BlendedCost.amount);
    }
    return sum + result.groups.reduce((groupSum, group) => {
      return groupSum + (group.metrics.BlendedCost ? parseFloat(group.metrics.BlendedCost.amount) : 0);
    }, 0);
  }, 0);

  const dailyAverage = totalCost / data.results.length;
  
  const costs = data.results.map(result => {
    if (result.total?.BlendedCost) {
      return parseFloat(result.total.BlendedCost.amount);
    }
    return result.groups.reduce((sum, group) => {
      return sum + (group.metrics.BlendedCost ? parseFloat(group.metrics.BlendedCost.amount) : 0);
    }, 0);
  });

  const maxCost = Math.max(...costs);
  const minCost = Math.min(...costs);
  
  // Calculate trend (compare first half vs second half of period)
  const midPoint = Math.floor(costs.length / 2);
  const firstHalfAvg = costs.slice(0, midPoint).reduce((sum, cost) => sum + cost, 0) / midPoint;
  const secondHalfAvg = costs.slice(midPoint).reduce((sum, cost) => sum + cost, 0) / (costs.length - midPoint);
  const trendPercent = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;

  const cards = [
    {
      title: 'Total Cost',
      value: formatCurrency(totalCost.toString()),
      subtitle: `${data.results.length} ${data.granularity.toLowerCase()} periods`,
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
          className={`p-6 rounded-lg border-2 ${getColorClasses(card.color)} transition-transform hover:scale-105`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium opacity-80">{card.title}</div>
            <div className="text-xl">{card.icon}</div>
          </div>
          <div className="text-2xl font-bold mb-1">{card.value}</div>
          <div className="text-xs opacity-70">{card.subtitle}</div>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;