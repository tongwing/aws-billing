from fastapi import APIRouter, HTTPException
from app.models.billing import (
    CostDataRequest, CostDataResponse, DimensionRequest, 
    AccountInfoRequest, TimePeriod
)
from app.models.credentials import CredentialValidationRequest, CredentialValidationResponse
from app.services.aws_cost_explorer import cost_explorer_service
from datetime import datetime, timedelta
from typing import Optional

router = APIRouter()


@router.post("/cost-data", response_model=CostDataResponse)
async def get_cost_data(request: CostDataRequest):
    """Get cost and usage data with user-provided AWS credentials"""
    try:
        result = await cost_explorer_service.get_cost_and_usage(request)
        return result
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/dimensions")
async def get_dimension_values(request: DimensionRequest):
    """Get dimension values with user-provided AWS credentials"""
    try:
        values = await cost_explorer_service.get_dimension_values(
            request.credentials, 
            request.dimension, 
            request.time_period
        )
        
        return {"dimension": request.dimension, "values": values}
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/account-info")
async def get_account_info(request: AccountInfoRequest):
    """Get AWS account information with user-provided credentials"""
    try:
        account_info = await cost_explorer_service.get_account_info(request.credentials)
        return account_info
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/validate-credentials", response_model=CredentialValidationResponse)
async def validate_credentials(request: CredentialValidationRequest):
    """Validate AWS credentials"""
    try:
        result = await cost_explorer_service.validate_credentials(request.credentials)
        return result
        
    except Exception as e:
        # Don't expose internal errors for credential validation
        return CredentialValidationResponse(
            valid=False,
            error="Failed to validate credentials"
        )


# Convenience endpoint to build cost data request with simplified parameters
@router.post("/cost-data-simple", response_model=CostDataResponse)
async def get_cost_data_simple(
    request_data: dict
):
    """
    Simplified cost data endpoint that accepts a dictionary and builds the proper request
    Expected format:
    {
        "credentials": {"access_key_id": "...", "secret_access_key": "...", "region": "..."},
        "start_date": "2025-08-01",  # Optional, defaults to 30 days ago
        "end_date": "2025-08-24",    # Optional, defaults to today
        "granularity": "DAILY",      # Optional, defaults to DAILY
        "group_by_dimension": "SERVICE", # Optional
        "metrics": "BlendedCost",    # Optional, defaults to BlendedCost
        "service_filter": "Amazon EC2", # Optional
        "region_filter": "us-east-1",   # Optional
        "charge_type": "Usage",         # Optional
        "include_support": true,        # Optional, defaults to true
        "include_other_subscription": true, # etc...
    }
    """
    try:
        # Extract credentials
        if "credentials" not in request_data:
            raise ValueError("AWS credentials are required")
        
        from app.models.credentials import AWSCredentials
        credentials = AWSCredentials(**request_data["credentials"])
        
        # Default dates
        start_date = request_data.get("start_date")
        end_date = request_data.get("end_date")
        
        if not start_date or not end_date:
            end_dt = datetime.now().date()
            start_dt = end_dt - timedelta(days=30)
            start_date = start_dt.strftime("%Y-%m-%d")
            end_date = end_dt.strftime("%Y-%m-%d")
        
        # Parse metrics
        metrics_str = request_data.get("metrics", "BlendedCost")
        metrics_list = [m.strip() for m in metrics_str.split(",")]
        
        # Build group_by list
        group_by = []
        group_by_dimension = request_data.get("group_by_dimension")
        if group_by_dimension:
            group_by.append({
                "Type": "DIMENSION",
                "Key": group_by_dimension
            })
        
        # Build filter conditions
        filter_conditions = []
        
        # Service filter
        service_filter = request_data.get("service_filter")
        if service_filter:
            filter_conditions.append({
                "Dimensions": {
                    "Key": "SERVICE",
                    "Values": [service_filter]
                }
            })
        
        # Region filter
        region_filter = request_data.get("region_filter")
        if region_filter:
            filter_conditions.append({
                "Dimensions": {
                    "Key": "REGION",
                    "Values": [region_filter]
                }
            })
        
        # Charge type filter
        charge_type = request_data.get("charge_type")
        if charge_type:
            filter_conditions.append({
                "Dimensions": {
                    "Key": "RECORD_TYPE",
                    "Values": [charge_type]
                }
            })
        
        # Build charge type exclusions
        charge_type_exclusions = []
        
        include_support = request_data.get("include_support", True)
        include_other_subscription = request_data.get("include_other_subscription", True)
        include_upfront = request_data.get("include_upfront", True)
        include_refund = request_data.get("include_refund", True)
        include_credit = request_data.get("include_credit", True)
        include_ri_fee = request_data.get("include_ri_fee", True)
        
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
            credentials=credentials,
            time_period=TimePeriod(start=start_date, end=end_date),
            granularity=request_data.get("granularity", "DAILY"),
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