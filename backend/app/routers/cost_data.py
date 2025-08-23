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
    granularity: str = Query("DAILY", description="Granularity: DAILY, WEEKLY, MONTHLY"),
    group_by_dimension: Optional[str] = Query(None, description="Group by dimension: SERVICE, LINKED_ACCOUNT, REGION, etc."),
    metrics: str = Query("BlendedCost", description="Comma-separated metrics"),
    service_filter: Optional[str] = Query(None, description="Filter by specific service"),
    region_filter: Optional[str] = Query(None, description="Filter by specific region"),
    charge_type: Optional[str] = Query(None, description="Charge type filter: Usage, Tax, Credit, etc."),
    include_support: bool = Query(True, description="Include support charges"),
    include_other_subscription: bool = Query(True, description="Include other subscription costs"),
    include_upfront: bool = Query(True, description="Include upfront reservation fees"),
    include_refund: bool = Query(True, description="Include refunds"),
    include_credit: bool = Query(True, description="Include credits"),
    include_ri_fee: bool = Query(True, description="Include reserved instance fees")
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
        
        # Build filter conditions
        filter_conditions = []
        
        # Service filter
        if service_filter:
            filter_conditions.append({
                "Dimensions": {
                    "Key": "SERVICE",
                    "Values": [service_filter]
                }
            })
        
        # Region filter
        if region_filter:
            filter_conditions.append({
                "Dimensions": {
                    "Key": "REGION",
                    "Values": [region_filter]
                }
            })
        
        # Charge type filter
        if charge_type:
            filter_conditions.append({
                "Dimensions": {
                    "Key": "RECORD_TYPE",
                    "Values": [charge_type]
                }
            })
        
        # Build charge type exclusions
        charge_type_exclusions = []
        
        if not include_support:
            charge_type_exclusions.append("Support")
        if not include_other_subscription:
            charge_type_exclusions.append("Other_Subscription")
        if not include_upfront:
            charge_type_exclusions.append("Fee")
        if not include_refund:
            charge_type_exclusions.append("Refund")
        if not include_credit:
            charge_type_exclusions.append("Credit")
        if not include_ri_fee:
            charge_type_exclusions.append("RIFee")
        
        if charge_type_exclusions:
            filter_conditions.append({
                "Not": {
                    "Dimensions": {
                        "Key": "RECORD_TYPE",
                        "Values": charge_type_exclusions
                    }
                }
            })
        
        # Combine filters with AND logic
        cost_filter = None
        if filter_conditions:
            if len(filter_conditions) == 1:
                cost_filter = filter_conditions[0]
            else:
                cost_filter = {
                    "And": filter_conditions
                }
        
        # Create request
        request = CostDataRequest(
            time_period=TimePeriod(start=start_date, end=end_date),
            granularity=granularity,
            group_by=group_by,
            metrics=metrics_list,
            filter=cost_filter
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