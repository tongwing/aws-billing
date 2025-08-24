from pydantic import BaseModel
from typing import List, Dict, Optional, Any
from datetime import datetime
from .credentials import AWSCredentials


class TimePeriod(BaseModel):
    start: str
    end: str


class Metrics(BaseModel):
    amount: str
    unit: str


class GroupMetrics(BaseModel):
    BlendedCost: Optional[Metrics] = None
    UnblendedCost: Optional[Metrics] = None
    UsageQuantity: Optional[Metrics] = None


class Group(BaseModel):
    keys: List[str]
    metrics: GroupMetrics


class ResultByTime(BaseModel):
    time_period: TimePeriod
    total: Optional[GroupMetrics] = None
    groups: List[Group] = []
    estimated: bool = False


class CostDataRequest(BaseModel):
    credentials: AWSCredentials
    time_period: TimePeriod
    granularity: str = "DAILY"
    group_by: List[Dict[str, str]] = []
    metrics: List[str] = ["BlendedCost"]
    filter: Optional[Dict[str, Any]] = None


class CostDataResponse(BaseModel):
    time_period: TimePeriod
    granularity: str
    group_by: List[Dict[str, str]]
    results: List[ResultByTime]
    dimension_key: Optional[str] = None
    next_page_token: Optional[str] = None


class DimensionRequest(BaseModel):
    credentials: AWSCredentials
    dimension: str
    time_period: TimePeriod


class AccountInfoRequest(BaseModel):
    credentials: AWSCredentials


class HealthResponse(BaseModel):
    status: str
    timestamp: datetime