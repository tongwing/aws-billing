from fastapi import APIRouter, HTTPException
from app.models.billing import HealthResponse
from app.config import settings
from datetime import datetime
import boto3
from botocore.exceptions import NoCredentialsError, ClientError

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check():
    try:
        # Check AWS credentials configuration
        aws_config = bool(settings.aws_access_key_id and settings.aws_secret_access_key)
        
        # If credentials are configured, test AWS connection
        if aws_config:
            try:
                client = boto3.client(
                    'ce',
                    aws_access_key_id=settings.aws_access_key_id,
                    aws_secret_access_key=settings.aws_secret_access_key,
                    region_name=settings.aws_region
                )
                # Test connection with a simple API call
                client.get_dimension_values(
                    TimePeriod={
                        'Start': '2025-08-01',
                        'End': '2025-08-02'
                    },
                    Dimension='SERVICE'
                )
            except (NoCredentialsError, ClientError):
                aws_config = False
        
        return HealthResponse(
            status="healthy",
            timestamp=datetime.now(),
            aws_config=aws_config
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")