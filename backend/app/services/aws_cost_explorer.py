import boto3
from botocore.exceptions import ClientError, NoCredentialsError
from app.models.billing import CostDataRequest, CostDataResponse, ResultByTime, Group, GroupMetrics, Metrics, TimePeriod
from app.models.credentials import AWSCredentials, CredentialValidationResponse
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


class AWSCostExplorerService:
    """Stateless AWS Cost Explorer service that creates clients per request"""
    
    def create_client(self, credentials: AWSCredentials, service_name: str = 'ce'):
        """Create a new AWS client with the provided credentials"""
        try:
            session = boto3.Session(
                aws_access_key_id=credentials.access_key_id,
                aws_secret_access_key=credentials.secret_access_key,
                region_name=credentials.region
            )
            return session.client(service_name)
        except Exception as e:
            logger.error(f"Failed to create AWS {service_name} client: {e}")
            raise ValueError(f"Failed to create AWS client: {str(e)}")
    
    async def validate_credentials(self, credentials: AWSCredentials) -> CredentialValidationResponse:
        """Validate AWS credentials by making a simple API call"""
        try:
            # Create STS client to get caller identity (lightweight operation)
            sts_client = self.create_client(credentials, 'sts')
            response = sts_client.get_caller_identity()
            
            return CredentialValidationResponse(
                valid=True,
                account_id=response.get('Account')
            )
        except ClientError as e:
            error_code = e.response.get('Error', {}).get('Code', 'Unknown')
            error_message = e.response.get('Error', {}).get('Message', str(e))
            
            logger.error(f"AWS credential validation failed: {e}")
            
            if error_code in ['InvalidUserID.NotFound', 'SignatureDoesNotMatch', 'InvalidAccessKeyId']:
                return CredentialValidationResponse(
                    valid=False,
                    error="Invalid AWS credentials. Please check your Access Key ID and Secret Access Key."
                )
            else:
                return CredentialValidationResponse(
                    valid=False,
                    error=f"AWS API error: {error_message}"
                )
        except Exception as e:
            logger.error(f"Unexpected error validating credentials: {e}")
            return CredentialValidationResponse(
                valid=False,
                error=f"Failed to validate credentials: {str(e)}"
            )
    
    async def get_cost_and_usage(self, request: CostDataRequest) -> CostDataResponse:
        """Get cost and usage data using the provided credentials"""
        try:
            # Create Cost Explorer client with provided credentials
            client = self.create_client(request.credentials)
            
            # Prepare the request for AWS API
            aws_request = {
                'TimePeriod': {
                    'Start': request.time_period.start,
                    'End': request.time_period.end
                },
                'Granularity': request.granularity,
                'Metrics': request.metrics
            }
            
            # Add grouping if specified
            if request.group_by:
                aws_request['GroupBy'] = request.group_by
            
            # Add filter if specified
            if request.filter:
                aws_request['Filter'] = request.filter
            
            # Call AWS Cost Explorer API
            response = client.get_cost_and_usage(**aws_request)
            
            # Transform AWS response to our model
            results = []
            for result in response.get('ResultsByTime', []):
                groups = []
                for group in result.get('Groups', []):
                    # Extract metrics
                    metrics_data = {}
                    for metric_name, metric_value in group.get('Metrics', {}).items():
                        metrics_data[metric_name] = Metrics(
                            amount=metric_value.get('Amount', '0'),
                            unit=metric_value.get('Unit', 'USD')
                        )
                    
                    groups.append(Group(
                        keys=group.get('Keys', []),
                        metrics=GroupMetrics(**metrics_data)
                    ))
                
                # Extract total metrics if no grouping
                total_metrics = None
                if 'Total' in result:
                    total_data = {}
                    for metric_name, metric_value in result['Total'].items():
                        total_data[metric_name] = Metrics(
                            amount=metric_value.get('Amount', '0'),
                            unit=metric_value.get('Unit', 'USD')
                        )
                    total_metrics = GroupMetrics(**total_data)
                
                results.append(ResultByTime(
                    time_period=TimePeriod(
                        start=result['TimePeriod']['Start'],
                        end=result['TimePeriod']['End']
                    ),
                    total=total_metrics,
                    groups=groups,
                    estimated=result.get('Estimated', False)
                ))
            
            return CostDataResponse(
                time_period=request.time_period,
                granularity=request.granularity,
                group_by=request.group_by,
                results=results,
                next_page_token=response.get('NextPageToken')
            )
            
        except ClientError as e:
            error_message = e.response['Error']['Message']
            logger.error(f"AWS API error: {e}")
            raise ValueError(f"AWS API error: {error_message}")
        except Exception as e:
            logger.error(f"Unexpected error in get_cost_and_usage: {e}")
            raise ValueError(f"Failed to retrieve cost data: {str(e)}")
    
    async def get_dimension_values(self, credentials: AWSCredentials, dimension: str, time_period: TimePeriod) -> List[str]:
        """Get dimension values using the provided credentials"""
        try:
            client = self.create_client(credentials)
            
            response = client.get_dimension_values(
                TimePeriod={
                    'Start': time_period.start,
                    'End': time_period.end
                },
                Dimension=dimension
            )
            
            return [item['Value'] for item in response.get('DimensionValues', [])]
            
        except ClientError as e:
            error_message = e.response['Error']['Message']
            logger.error(f"AWS API error getting dimension values: {e}")
            raise ValueError(f"AWS API error: {error_message}")
        except Exception as e:
            logger.error(f"Unexpected error in get_dimension_values: {e}")
            raise ValueError(f"Failed to retrieve dimension values: {str(e)}")
    
    async def get_account_info(self, credentials: AWSCredentials) -> dict:
        """Get AWS account information using the provided credentials"""
        try:
            # Create STS client to get account information
            sts_client = self.create_client(credentials, 'sts')
            response = sts_client.get_caller_identity()
            
            return {
                "account_id": response.get('Account'),
                "user_id": response.get('UserId'), 
                "arn": response.get('Arn')
            }
                
        except ClientError as e:
            error_message = e.response['Error']['Message']
            logger.error(f"AWS API error getting account info: {e}")
            raise ValueError(f"AWS API error: {error_message}")
        except Exception as e:
            logger.error(f"Unexpected error getting account info: {e}")
            raise ValueError(f"Failed to retrieve account information: {str(e)}")


# Global instance - now stateless
cost_explorer_service = AWSCostExplorerService()