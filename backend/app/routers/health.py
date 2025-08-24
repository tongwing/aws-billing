from fastapi import APIRouter, HTTPException
from app.models.billing import HealthResponse
from datetime import datetime

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Simple health check that only verifies the service is running.
    AWS credential validation is now done per-request by the frontend.
    """
    try:
        return HealthResponse(
            status="healthy",
            timestamp=datetime.now()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")