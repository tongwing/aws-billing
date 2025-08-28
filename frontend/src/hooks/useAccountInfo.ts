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
      } catch (err: any) {
        console.warn('Failed to fetch account info:', err);
        let errorMessage = 'Failed to fetch account info';
        
        // Extract error message from axios response
        if (err.response?.data?.detail) {
          errorMessage = err.response.data.detail;
        } else if (err.response?.status === 400) {
          errorMessage = 'Invalid or expired AWS credentials. Please update your credentials.';
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchAccountInfo();
  }, [credentials, hasCredentials]);

  return { accountInfo, loading, error };
};