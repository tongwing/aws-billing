from fastapi import APIRouter, HTTPException, Query
from app.models.billing import CostDataRequest, CostDataResponse, TimePeriod
from app.services.aws_cost_explorer import cost_explorer_service
from datetime import datetime, timedelta
from typing import Optional, List

router = APIRouter()


@router.get("/cost-data", response_model=CostDataResponse)
async def get_cost_data(
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    granularity: str = Query("DAILY", description="Granularity: DAILY, MONTHLY"),
    group_by_dimension: Optional[str] = Query(None, description="Group by dimension: SERVICE, LINKED_ACCOUNT, etc."),
    metrics: str = Query("BlendedCost", description="Comma-separated metrics")
):
    try:
        # Default to last 30 days if no dates provided
        if not start_date or not end_date:
            end_dt = datetime.now().date()
            start_dt = end_dt - timedelta(days=30)
            start_date = start_dt.strftime("%Y-%m-%d")
            end_date = end_dt.strftime("%Y-%m-%d")
        
        # Parse metrics
        metrics_list = [m.strip() for m in metrics.split(",")]
        
        # Build group_by list
        group_by = []
        if group_by_dimension:
            group_by.append({
                "Type": "DIMENSION",
                "Key": group_by_dimension
            })
        
        # Create request
        request = CostDataRequest(
            time_period=TimePeriod(start=start_date, end=end_date),
            granularity=granularity,
            group_by=group_by,
            metrics=metrics_list
        )
        
        # Get data from AWS
        result = await cost_explorer_service.get_cost_and_usage(request)
        return result
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/dimensions/{dimension}")
async def get_dimension_values(
    dimension: str,
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)")
):
    try:
        # Default to last 30 days if no dates provided
        if not start_date or not end_date:
            end_dt = datetime.now().date()
            start_dt = end_dt - timedelta(days=30)
            start_date = start_dt.strftime("%Y-%m-%d")
            end_date = end_dt.strftime("%Y-%m-%d")
        
        time_period = TimePeriod(start=start_date, end=end_date)
        values = await cost_explorer_service.get_dimension_values(dimension, time_period)
        
        return {"dimension": dimension, "values": values}
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")