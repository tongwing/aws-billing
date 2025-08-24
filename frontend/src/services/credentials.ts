import { encrypt, decrypt } from '../utils/encryption';

export interface AWSCredentials {
  access_key_id: string;
  secret_access_key: string;
  region: string;
}

export interface StoredCredentials extends AWSCredentials {
  created_at: string;
  last_used: string;
}

const CREDENTIALS_KEY = 'aws-billing-credentials';

export class CredentialsService {
  
  /**
   * Save AWS credentials to localStorage with encryption
   */
  saveCredentials(credentials: AWSCredentials): void {
    try {
      const storedCredentials: StoredCredentials = {
        ...credentials,
        created_at: new Date().toISOString(),
        last_used: new Date().toISOString()
      };
      
      const encryptedData = encrypt(JSON.stringify(storedCredentials));
      localStorage.setItem(CREDENTIALS_KEY, encryptedData);
    } catch (error) {
      console.error('Failed to save credentials:', error);
      throw new Error('Failed to save AWS credentials');
    }
  }
  
  /**
   * Get AWS credentials from localStorage
   */
  getCredentials(): AWSCredentials | null {
    try {
      const encryptedData = localStorage.getItem(CREDENTIALS_KEY);
      if (!encryptedData) {
        return null;
      }
      
      const decryptedData = decrypt(encryptedData);
      const storedCredentials: StoredCredentials = JSON.parse(decryptedData);
      
      // Update last_used timestamp
      const updatedCredentials = {
        ...storedCredentials,
        last_used: new Date().toISOString()
      };
      
      const encryptedUpdated = encrypt(JSON.stringify(updatedCredentials));
      localStorage.setItem(CREDENTIALS_KEY, encryptedUpdated);
      
      // Return only the credential parts
      return {
        access_key_id: storedCredentials.access_key_id,
        secret_access_key: storedCredentials.secret_access_key,
        region: storedCredentials.region
      };
    } catch (error) {
      console.error('Failed to get credentials:', error);
      // If decryption fails, remove the corrupted data
      this.deleteCredentials();
      return null;
    }
  }
  
  /**
   * Check if credentials are stored
   */
  hasCredentials(): boolean {
    return localStorage.getItem(CREDENTIALS_KEY) !== null;
  }
  
  /**
   * Delete stored credentials
   */
  deleteCredentials(): void {
    localStorage.removeItem(CREDENTIALS_KEY);
  }
  
  /**
   * Get stored credentials metadata (without sensitive data)
   */
  getCredentialsMetadata(): { created_at: string; last_used: string; region: string } | null {
    try {
      const encryptedData = localStorage.getItem(CREDENTIALS_KEY);
      if (!encryptedData) {
        return null;
      }
      
      const decryptedData = decrypt(encryptedData);
      const storedCredentials: StoredCredentials = JSON.parse(decryptedData);
      
      return {
        created_at: storedCredentials.created_at,
        last_used: storedCredentials.last_used,
        region: storedCredentials.region
      };
    } catch (error) {
      console.error('Failed to get credentials metadata:', error);
      return null;
    }
  }
  
  /**
   * Basic validation of credential format
   */
  validateCredentials(credentials: Partial<AWSCredentials>): string[] {
    const errors: string[] = [];
    
    if (!credentials.access_key_id) {
      errors.push('Access Key ID is required');
    } else if (credentials.access_key_id.length < 16 || credentials.access_key_id.length > 32) {
      errors.push('Access Key ID must be between 16 and 32 characters');
    }
    
    if (!credentials.secret_access_key) {
      errors.push('Secret Access Key is required');
    } else if (credentials.secret_access_key.length < 40) {
      errors.push('Secret Access Key must be at least 40 characters long');
    }
    
    if (!credentials.region) {
      errors.push('Region is required');
    } else if (!/^[a-z]{2}-[a-z]+-\d+$/.test(credentials.region)) {
      errors.push('Region must be in format like us-east-1, eu-west-1, etc.');
    }
    
    return errors;
  }
  
  /**
   * Update the region of stored credentials
   */
  updateRegion(newRegion: string): boolean {
    try {
      const credentials = this.getCredentials();
      if (!credentials) {
        return false;
      }
      
      const updatedCredentials = {
        ...credentials,
        region: newRegion
      };
      
      this.saveCredentials(updatedCredentials);
      return true;
    } catch (error) {
      console.error('Failed to update region:', error);
      return false;
    }
  }
}

// Export singleton instance
export const credentialsService = new CredentialsService();