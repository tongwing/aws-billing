import React, { useState } from 'react';
import { AWSCredentials } from '../../services/credentials';

interface AWSCredentialsFormProps {
  initialCredentials?: Partial<AWSCredentials>;
  onSubmit: (credentials: AWSCredentials) => Promise<boolean>;
  onCancel?: () => void;
  isLoading?: boolean;
  error?: string | null;
  showCancel?: boolean;
}

const AWSCredentialsForm: React.FC<AWSCredentialsFormProps> = ({
  initialCredentials = {},
  onSubmit,
  onCancel,
  isLoading = false,
  error = null,
  showCancel = true
}) => {
  const [formData, setFormData] = useState<AWSCredentials>({
    access_key_id: initialCredentials.access_key_id || '',
    secret_access_key: initialCredentials.secret_access_key || '',
    region: initialCredentials.region || 'us-east-1'
  });

  const [showSecretKey, setShowSecretKey] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!formData.access_key_id.trim()) {
      errors.push('Access Key ID is required');
    } else if (formData.access_key_id.length < 16 || formData.access_key_id.length > 32) {
      errors.push('Access Key ID must be between 16 and 32 characters');
    }

    if (!formData.secret_access_key.trim()) {
      errors.push('Secret Access Key is required');
    } else if (formData.secret_access_key.length < 40) {
      errors.push('Secret Access Key must be at least 40 characters long');
    }

    if (!formData.region.trim()) {
      errors.push('Region is required');
    } else if (!/^[a-z]{2}-[a-z]+-\d+$/.test(formData.region)) {
      errors.push('Region must be in format like us-east-1, eu-west-1, etc.');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const success = await onSubmit(formData);
    if (!success) {
      // Error handling is done in the parent component through the error prop
    }
  };

  const handleInputChange = (field: keyof AWSCredentials, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation errors when user starts typing
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const commonRegions = [
    'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
    'eu-west-1', 'eu-west-2', 'eu-central-1', 'eu-north-1',
    'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1', 'ap-northeast-2',
    'ap-south-1', 'sa-east-1', 'ca-central-1'
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Access Key ID */}
      <div>
        <label htmlFor="access_key_id" className="block text-sm font-medium text-gray-700 mb-2">
          AWS Access Key ID
        </label>
        <input
          type="text"
          id="access_key_id"
          value={formData.access_key_id}
          onChange={(e) => handleInputChange('access_key_id', e.target.value)}
          placeholder="AKIA..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={isLoading}
          autoComplete="off"
        />
      </div>

      {/* Secret Access Key */}
      <div>
        <label htmlFor="secret_access_key" className="block text-sm font-medium text-gray-700 mb-2">
          AWS Secret Access Key
        </label>
        <div className="relative">
          <input
            type={showSecretKey ? "text" : "password"}
            id="secret_access_key"
            value={formData.secret_access_key}
            onChange={(e) => handleInputChange('secret_access_key', e.target.value)}
            placeholder="Enter your secret access key"
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
            autoComplete="off"
          />
          <button
            type="button"
            onClick={() => setShowSecretKey(!showSecretKey)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            disabled={isLoading}
          >
            {showSecretKey ? (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Region */}
      <div>
        <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-2">
          AWS Region
        </label>
        <select
          id="region"
          value={formData.region}
          onChange={(e) => handleInputChange('region', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={isLoading}
        >
          {commonRegions.map(region => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-gray-500">
          Select the region where your AWS Cost Explorer data is available
        </p>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <div className="text-sm text-red-800">
            <p className="font-medium mb-1">Please fix the following errors:</p>
            <ul className="list-disc list-inside space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* API Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <div className="text-sm text-red-800">
            <p className="font-medium">Validation Failed</p>
            <p className="mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">🔒 Security Note</p>
          <p>Your credentials are encrypted and stored locally in your browser. They are never sent to our servers except for AWS API calls.</p>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex space-x-3">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Validating...
            </div>
          ) : (
            'Save Credentials'
          )}
        </button>
        
        {showCancel && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default AWSCredentialsForm;