import { useState, useEffect } from 'react';
import { costApi } from '../services/api';
import { useCredentials } from '../contexts/CredentialsContext';

interface AccountInfo {
  account_id: string;
  user_id: string;
  arn: string;
}

export const useAccountInfo = () => {
  const { credentials, hasCredentials } = useCredentials();
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccountInfo = async () => {
      // Don't fetch if no credentials
      if (!hasCredentials || !credentials) {
        setError('AWS credentials are required');
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const info = await costApi.getAccountInfo(credentials);
        setAccountInfo(info);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch account info');
        console.warn('Failed to fetch account info:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAccountInfo();
  }, [credentials, hasCredentials]);

  return { accountInfo, loading, error };
};