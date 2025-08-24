import React from 'react';
import { useHealth } from '../../hooks/useHealth';

interface AWSConfigAlertProps {
  className?: string;
}

const AWSConfigAlert: React.FC<AWSConfigAlertProps> = ({ className = '' }) => {
  const { health, loading } = useHealth();

  if (loading || !health) {
    return null;
  }

  if (health.aws_config) {
    return null; // No alert needed if AWS is configured
  }

  return (
    <div className={`bg-red-50 border border-red-200 rounded-md p-4 ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">
            AWS Configuration Error
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <p>
              {health.aws_error || 'AWS credentials are not properly configured.'}
            </p>
            <div className="mt-2">
              <p className="font-medium">To fix this issue:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Set the <code className="bg-red-100 px-1 rounded">AWS_ACCESS_KEY_ID</code> environment variable</li>
                <li>Set the <code className="bg-red-100 px-1 rounded">AWS_SECRET_ACCESS_KEY</code> environment variable</li>
                <li>Ensure your AWS credentials have Cost Explorer permissions</li>
                <li>Restart the backend service after updating credentials</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AWSConfigAlert;