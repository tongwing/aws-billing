import { useState, useEffect } from 'react';
import { costApi } from '../services/api';

interface AccountInfo {
  account_id: string;
  user_id: string;
  arn: string;
}

export const useAccountInfo = () => {
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccountInfo = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const info = await costApi.getAccountInfo();
        setAccountInfo(info);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch account info');
        console.warn('Failed to fetch account info:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAccountInfo();
  }, []);

  return { accountInfo, loading, error };
};