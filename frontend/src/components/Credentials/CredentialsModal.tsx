import React, { useState } from 'react';
import { useCredentials } from '../../contexts/CredentialsContext';
import { credentialsService } from '../../services/credentials';
import AWSCredentialsForm from './AWSCredentialsForm';

interface CredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

const CredentialsModal: React.FC<CredentialsModalProps> = ({
  isOpen,
  onClose,
  title = "Manage AWS Credentials",
  description = "Configure your AWS credentials to access billing data for your account."
}) => {
  const { 
    credentials, 
    hasCredentials,
    saveCredentials, 
    deleteCredentials,
    isValidating, 
    validationError,
    lastValidated 
  } = useCredentials();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const metadata = credentialsService.getCredentialsMetadata();

  const handleSubmit = async (newCredentials: any) => {
    const success = await saveCredentials(newCredentials);
    if (success) {
      onClose();
    }
    return success;
  };

  const handleDelete = () => {
    deleteCredentials();
    setShowDeleteConfirm(false);
    onClose();
    // Refresh the page to clear any cached AWS data
    window.location.reload();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {description && (
              <p className="mt-2 text-sm text-gray-600">
                {description}
              </p>
            )}
          </div>
          
          {/* Content */}
          <div className="px-6 py-4">
            {/* Current Credentials Status */}
            {hasCredentials && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Current Credentials</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Access Key:</span> {credentials?.access_key_id?.slice(0, 8)}...
                  </div>
                  <div>
                    <span className="font-medium">Region:</span> {credentials?.region}
                  </div>
                  {lastValidated && (
                    <div>
                      <span className="font-medium">Last validated:</span> {new Date(lastValidated).toLocaleString()}
                    </div>
                  )}
                  {metadata && (
                    <div>
                      <span className="font-medium">Stored:</span> {new Date(metadata.created_at).toLocaleDateString()}
                    </div>
                  )}
                  {validationError && (
                    <div className="text-red-600">
                      <span className="font-medium">Status:</span> {validationError}
                    </div>
                  )}
                </div>
                <div className="mt-3 flex space-x-2">
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    Delete Credentials
                  </button>
                </div>
              </div>
            )}

            {/* Delete Confirmation */}
            {showDeleteConfirm && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="text-sm font-medium text-red-800 mb-2">Confirm Deletion</h4>
                <p className="text-sm text-red-700 mb-3">
                  Are you sure you want to delete your stored AWS credentials? You will need to re-enter them to continue using the dashboard.
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={handleDelete}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    Yes, Delete
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-3 py-1 bg-gray-200 text-gray-800 text-sm rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Credentials Form */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-4">
                {hasCredentials ? 'Update' : 'Configure'} AWS Credentials
              </h4>
              <AWSCredentialsForm
                initialCredentials={credentials || {}}
                onSubmit={handleSubmit}
                onCancel={onClose}
                isLoading={isValidating}
                error={validationError}
                showCancel={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CredentialsModal;