import React from 'react';
import { getDefaultDateRange } from '../../utils/dateHelpers';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onPresetSelect: (preset: string) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onPresetSelect
}) => {
  const presets = [
    { label: 'Last 7 days', value: '7', days: 7 },
    { label: 'Last 30 days', value: '30', days: 30 },
    { label: 'Last 90 days', value: '90', days: 90 },
    { label: 'Last 6 months', value: '180', days: 180 },
    { label: 'Last year', value: '365', days: 365 },
  ];

  const handlePresetClick = (days: number, value: string) => {
    const range = getDefaultDateRange(days);
    onStartDateChange(range.start);
    onEndDateChange(range.end);
    onPresetSelect(value);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quick Select
        </label>
        <div className="grid grid-cols-1 gap-2">
          {presets.map((preset) => (
            <button
              key={preset.value}
              onClick={() => handlePresetClick(preset.days, preset.value)}
              className="px-3 py-2 text-sm text-left bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Custom Range
        </label>
        <div className="space-y-2">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="text-xs text-gray-500 pt-2 border-t">
        Selected: {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
      </div>
    </div>
  );
};

export default DateRangePicker;