import { useCallback } from 'react';
import { FilterState } from '../types/billing';
import { filtersToUrlParams } from '../utils/urlParams';

interface UseUrlStateReturn {
  copyCurrentUrl: () => Promise<boolean>;
  shareUrl: (filters: FilterState, activeTab?: string) => string;
  resetUrl: () => void;
}

export const useUrlState = (): UseUrlStateReturn => {
  const copyCurrentUrl = useCallback(async (): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      return true;
    } catch (error) {
      console.warn('Failed to copy URL to clipboard:', error);
      // Fallback for browsers that don't support clipboard API
      try {
        const textArea = document.createElement('textarea');
        textArea.value = window.location.href;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        return true;
      } catch (fallbackError) {
        console.error('Clipboard fallback also failed:', fallbackError);
        return false;
      }
    }
  }, []);

  const shareUrl = useCallback((filters: FilterState, activeTab?: string): string => {
    const params = filtersToUrlParams(filters, activeTab);
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  }, []);

  const resetUrl = useCallback(() => {
    window.history.replaceState(null, '', window.location.pathname);
  }, []);

  return {
    copyCurrentUrl,
    shareUrl,
    resetUrl,
  };
};