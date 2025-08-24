import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AWSCredentials, credentialsService } from '../services/credentials';
import { credentialsApi } from '../services/api';

interface CredentialsContextType {
  credentials: AWSCredentials | null;
  hasCredentials: boolean;
  isValidating: boolean;
  validationError: string | null;
  lastValidated: Date | null;
  saveCredentials: (credentials: AWSCredentials) => Promise<boolean>;
  validateCredentials: (credentials: AWSCredentials) => Promise<boolean>;
  deleteCredentials: () => void;
  refreshCredentials: () => void;
  updateRegion: (region: string) => boolean;
}

const CredentialsContext = createContext<CredentialsContextType | undefined>(undefined);

interface CredentialsProviderProps {
  children: ReactNode;
}

export const CredentialsProvider: React.FC<CredentialsProviderProps> = ({ children }) => {
  const [credentials, setCredentials] = useState<AWSCredentials | null>(null);
  const [hasCredentials, setHasCredentials] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [lastValidated, setLastValidated] = useState<Date | null>(null);

  // Load credentials from localStorage on mount
  useEffect(() => {
    refreshCredentials();
  }, []);

  const refreshCredentials = () => {
    const storedCredentials = credentialsService.getCredentials();
    setCredentials(storedCredentials);
    setHasCredentials(storedCredentials !== null);
    
    if (!storedCredentials) {
      setValidationError(null);
      setLastValidated(null);
    }
  };

  const saveCredentials = async (newCredentials: AWSCredentials): Promise<boolean> => {
    try {
      // Validate format first
      const validationErrors = credentialsService.validateCredentials(newCredentials);
      if (validationErrors.length > 0) {
        setValidationError(validationErrors.join(', '));
        return false;
      }

      // Validate with AWS API
      const isValid = await validateCredentials(newCredentials);
      if (!isValid) {
        return false;
      }

      // Save to localStorage
      credentialsService.saveCredentials(newCredentials);
      setCredentials(newCredentials);
      setHasCredentials(true);
      setValidationError(null);
      setLastValidated(new Date());

      return true;
    } catch (error) {
      console.error('Failed to save credentials:', error);
      setValidationError('Failed to save credentials');
      return false;
    }
  };

  const validateCredentials = async (credentialsToValidate: AWSCredentials): Promise<boolean> => {
    setIsValidating(true);
    setValidationError(null);

    try {
      // Use the API service which handles the correct base URL
      const result = await credentialsApi.validateCredentials(credentialsToValidate);
      
      if (result.valid) {
        setValidationError(null);
        setLastValidated(new Date());
        return true;
      } else {
        setValidationError(result.error || 'Invalid credentials');
        return false;
      }
    } catch (error) {
      console.error('Credential validation failed:', error);
      setValidationError('Failed to validate credentials. Please check your network connection.');
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const deleteCredentials = () => {
    credentialsService.deleteCredentials();
    setCredentials(null);
    setHasCredentials(false);
    setValidationError(null);
    setLastValidated(null);
  };

  const updateRegion = (region: string): boolean => {
    const success = credentialsService.updateRegion(region);
    if (success) {
      refreshCredentials();
    }
    return success;
  };

  const contextValue: CredentialsContextType = {
    credentials,
    hasCredentials,
    isValidating,
    validationError,
    lastValidated,
    saveCredentials,
    validateCredentials,
    deleteCredentials,
    refreshCredentials,
    updateRegion,
  };

  return (
    <CredentialsContext.Provider value={contextValue}>
      {children}
    </CredentialsContext.Provider>
  );
};

export const useCredentials = (): CredentialsContextType => {
  const context = useContext(CredentialsContext);
  if (context === undefined) {
    throw new Error('useCredentials must be used within a CredentialsProvider');
  }
  return context;
};