from pydantic import BaseModel, Field, validator
from typing import Optional
import re


class AWSCredentials(BaseModel):
    access_key_id: str = Field(..., min_length=16, max_length=32, description="AWS Access Key ID")
    secret_access_key: str = Field(..., min_length=40, max_length=128, description="AWS Secret Access Key")
    region: str = Field(default="us-east-1", description="AWS Region")
    
    @validator('access_key_id')
    def validate_access_key_id(cls, v):
        # AWS Access Key IDs are typically 20 characters long and start with AKIA
        if not re.match(r'^AKIA[A-Z0-9]{16}$', v) and not re.match(r'^[A-Z0-9]{20}$', v):
            # Allow for temporary credentials that might have different format
            if len(v) < 16 or len(v) > 32:
                raise ValueError('AWS Access Key ID must be between 16 and 32 characters')
        return v
    
    @validator('secret_access_key')
    def validate_secret_access_key(cls, v):
        # AWS Secret Access Keys are 40 characters long base64-encoded strings
        if len(v) < 40:
            raise ValueError('AWS Secret Access Key must be at least 40 characters long')
        return v
    
    @validator('region')
    def validate_region(cls, v):
        # Basic AWS region format validation
        if not re.match(r'^[a-z]{2}-[a-z]+-\d+$', v):
            raise ValueError('AWS Region must be in format like us-east-1, eu-west-1, etc.')
        return v


class CredentialValidationRequest(BaseModel):
    credentials: AWSCredentials


class CredentialValidationResponse(BaseModel):
    valid: bool
    error: Optional[str] = None
    account_id: Optional[str] = None