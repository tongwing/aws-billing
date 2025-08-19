import boto3
from botocore.exceptions import ClientError, NoCredentialsError
from app.config import settings
from app.models.billing import CostDataRequest, CostDataResponse, ResultByTime, Group, GroupMetrics, Metrics, TimePeriod
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


class AWSCostExplorerService:
    def __init__(self):
        self.client = None
        self._initialize_client()
    
    def _initialize_client(self):
        try:
            if settings.aws_access_key_id and settings.aws_secret_access_key:
                self.client = boto3.client(
                    'ce',
                    aws_access_key_id=settings.aws_access_key_id,
                    aws_secret_access_key=settings.aws_secret_access_key,
                    region_name=settings.aws_region
                )
            else:
                # Try to use default credentials (IAM role, profile, etc.)
                self.client = boto3.client('ce', region_name=settings.aws_region)
        except Exception as e:
            logger.error(f"Failed to initialize AWS Cost Explorer client: {e}")
            self.client = None
    
    def is_configured(self) -> bool:
        return self.client is not None
    
    async def get_cost_and_usage(self, request: CostDataRequest) -> CostDataResponse:
        if not self.is_configured():
            raise ValueError("AWS Cost Explorer client is not properly configured")
        
        try:
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
            response = self.client.get_cost_and_usage(**aws_request)
            
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
            logger.error(f"AWS API error: {e}")
            raise ValueError(f"AWS API error: {e.response['Error']['Message']}")
        except Exception as e:
            logger.error(f"Unexpected error in get_cost_and_usage: {e}")
            raise ValueError(f"Failed to retrieve cost data: {str(e)}")
    
    async def get_dimension_values(self, dimension: str, time_period: TimePeriod) -> List[str]:
        if not self.is_configured():
            raise ValueError("AWS Cost Explorer client is not properly configured")
        
        try:
            response = self.client.get_dimension_values(
                TimePeriod={
                    'Start': time_period.start,
                    'End': time_period.end
                },
                Dimension=dimension
            )
            
            return [item['Value'] for item in response.get('DimensionValues', [])]
            
        except ClientError as e:
            logger.error(f"AWS API error getting dimension values: {e}")
            raise ValueError(f"AWS API error: {e.response['Error']['Message']}")
        except Exception as e:
            logger.error(f"Unexpected error in get_dimension_values: {e}")
            raise ValueError(f"Failed to retrieve dimension values: {str(e)}")


# Global instance
cost_explorer_service = AWSCostExplorerService()