import { CostDataResponse } from '../types/billing';

export const generateColors = (count: number): string[] => {
  const colors = [
    '#3B82F6', // blue-500
    '#EF4444', // red-500
    '#10B981', // emerald-500
    '#F59E0B', // amber-500
    '#8B5CF6', // violet-500
    '#06B6D4', // cyan-500
    '#F97316', // orange-500
    '#84CC16', // lime-500
    '#EC4899', // pink-500
    '#6366F1', // indigo-500
    '#14B8A6', // teal-500
    '#F43F5E', // rose-500
  ];
  
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(colors[i % colors.length]);
  }
  return result;
};

export const processChartData = (data: CostDataResponse) => {
  if (!data.results || data.results.length === 0) {
    return { labels: [], datasets: [] };
  }

  const labels = data.results.map(result => {
    const date = new Date(result.time_period.start);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: data.granularity === 'MONTHLY' ? 'numeric' : undefined
    });
  });

  // If grouping is enabled
  if (data.group_by && data.group_by.length > 0 && data.results[0].groups.length > 0) {
    // Get all unique group keys
    const allKeys = new Set<string>();
    data.results.forEach(result => {
      result.groups.forEach(group => {
        if (group.keys.length > 0) {
          allKeys.add(group.keys[0]);
        }
      });
    });

    const sortedKeys = Array.from(allKeys).sort();
    const colors = generateColors(sortedKeys.length);

    const datasets = sortedKeys.map((key, index) => {
      const dataPoints = data.results.map(result => {
        const group = result.groups.find(g => g.keys[0] === key);
        return group?.metrics.BlendedCost ? parseFloat(group.metrics.BlendedCost.amount) : 0;
      });

      return {
        label: key,
        data: dataPoints,
        backgroundColor: colors[index],
        borderColor: colors[index],
        borderWidth: 2,
        fill: false,
      };
    });

    return { labels, datasets };
  } else {
    // No grouping - show total costs
    const totalData = data.results.map(result => {
      return result.total?.BlendedCost ? parseFloat(result.total.BlendedCost.amount) : 0;
    });

    return {
      labels,
      datasets: [{
        label: 'Total Cost',
        data: totalData,
        backgroundColor: '#3B82F6',
        borderColor: '#3B82F6',
        borderWidth: 2,
        fill: false,
      }]
    };
  }
};

export const getChartOptions = (type: 'bar' | 'line' = 'bar') => {
  const isStacked = type === 'bar';
  
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
        }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: $${value.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 45,
        }
      },
      y: {
        beginAtZero: true,
        stacked: isStacked,
        ticks: {
          callback: function(value: any) {
            return '$' + value.toFixed(0);
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        }
      }
    },
    elements: {
      bar: {
        borderRadius: 4,
        borderSkipped: false,
      }
    },
    datasets: isStacked ? {
      bar: {
        barPercentage: 0.8,
        categoryPercentage: 0.9,
      }
    } : {}
  };
};