import { format, subDays, startOfDay, startOfMonth } from 'date-fns';

export const formatDate = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

export const getDefaultDateRange = (days: number = 30) => {
  const endDate = startOfDay(new Date());
  const startDate = subDays(endDate, days);
  
  return {
    start: formatDate(startDate),
    end: formatDate(endDate),
  };
};

export const getMonthToDateRange = () => {
  const endDate = startOfDay(new Date());
  const startDate = startOfMonth(endDate);
  
  return {
    start: formatDate(startDate),
    end: formatDate(endDate),
  };
};

export const formatDisplayDate = (dateString: string): string => {
  const date = new Date(dateString);
  return format(date, 'MMM dd, yyyy');
};

export const formatCurrency = (amount: string, unit: string = 'USD'): string => {
  const num = parseFloat(amount);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: unit,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};