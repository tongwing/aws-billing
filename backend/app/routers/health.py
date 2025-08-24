from fastapi import APIRouter, HTTPException
from app.models.billing import HealthResponse
from app.config import settings
from app.services.aws_cost_explorer import cost_explorer_service
from datetime import datetime
import boto3
from botocore.exceptions import NoCredentialsError, ClientError

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check():
    try:
        # Check AWS credentials configuration using the service
        aws_config = cost_explorer_service.is_configured()
        aws_error = None
        
        if not aws_config:
            aws_error = cost_explorer_service.credential_error
        
        return HealthResponse(
            status="healthy",
            timestamp=datetime.now(),
            aws_config=aws_config,
            aws_error=aws_error
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")