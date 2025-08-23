import React, { useMemo, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  TimeScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { CostDataResponse } from '../../types/billing';
import { processChartData, getChartOptions } from '../../utils/chartHelpers';
import ExportButton from '../Common/ExportButton';

ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

interface CostChartProps {
  data: CostDataResponse | null;
  loading?: boolean;
}

const CostChart: React.FC<CostChartProps> = ({ data, loading }) => {
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [useTimeScale, setUseTimeScale] = useState(false);

  const chartData = useMemo(() => {
    if (!data) return { labels: [], datasets: [] };
    console.log('Chart data updated:', {
      time_period: data.time_period,
      results_count: data.results?.length,
      first_result: data.results?.[0]?.time_period
    });
    return processChartData(data, useTimeScale);
  }, [data, useTimeScale]);

  const chartOptions = useMemo(() => {
    const hasGrouping = data?.group_by && data.group_by.length > 0;
    return getChartOptions(chartType, useTimeScale, hasGrouping);
  }, [chartType, useTimeScale, data?.group_by]);

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data || !data.results || data.results.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center border-2 border-dashed border-gray-300 rounded">
        <div className="text-center">
          <div className="text-gray-500 mb-2">No cost data available</div>
          <div className="text-sm text-gray-400">
            Try adjusting your date range or check your AWS configuration
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Chart Controls */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Cost and Usage Graph</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">View:</span>
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              <button
                onClick={() => setChartType('bar')}
                className={`px-3 py-1 text-sm font-medium ${
                  chartType === 'bar'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                📊 Bar
              </button>
              <button
                onClick={() => setChartType('line')}
                className={`px-3 py-1 text-sm font-medium border-l border-gray-300 ${
                  chartType === 'line'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                📈 Line
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <label className="flex items-center space-x-1 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={useTimeScale}
                onChange={(e) => setUseTimeScale(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span>Time Scale</span>
            </label>
          </div>

          <ExportButton data={data} disabled={loading} />
        </div>
      </div>

      {/* Chart Container */}
      <div className="h-96 bg-white p-4 rounded-lg border">
        {chartType === 'bar' ? (
          <Bar 
            key={`${data?.time_period.start}-${data?.time_period.end}-${chartType}-${useTimeScale}`}
            data={chartData} 
            options={chartOptions as ChartOptions<'bar'>} 
          />
        ) : (
          <Line 
            key={`${data?.time_period.start}-${data?.time_period.end}-${chartType}-${useTimeScale}`}
            data={chartData} 
            options={chartOptions as ChartOptions<'line'>} 
          />
        )}
      </div>

      {/* Chart Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-sm text-blue-600 font-medium">Total Period</div>
          <div className="text-2xl font-bold text-blue-900">
            ${data.results.reduce((sum, result) => {
              if (result.total?.BlendedCost) {
                return sum + parseFloat(result.total.BlendedCost.amount);
              }
              return sum + result.groups.reduce((groupSum, group) => {
                return groupSum + (group.metrics.BlendedCost ? parseFloat(group.metrics.BlendedCost.amount) : 0);
              }, 0);
            }, 0).toFixed(2)}
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-sm text-green-600 font-medium">Daily Average</div>
          <div className="text-2xl font-bold text-green-900">
            ${(data.results.reduce((sum, result) => {
              if (result.total?.BlendedCost) {
                return sum + parseFloat(result.total.BlendedCost.amount);
              }
              return sum + result.groups.reduce((groupSum, group) => {
                return groupSum + (group.metrics.BlendedCost ? parseFloat(group.metrics.BlendedCost.amount) : 0);
              }, 0);
            }, 0) / data.results.length).toFixed(2)}
          </div>
        </div>

        <div className="bg-amber-50 p-4 rounded-lg">
          <div className="text-sm text-amber-600 font-medium">Time Period</div>
          <div className="text-lg font-bold text-amber-900">
            {data.results.length} {data.granularity.toLowerCase()} periods
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostChart;