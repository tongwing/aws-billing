from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import Optional, Union
import os


class Settings(BaseSettings):
    app_name: str = "AWS Billing Dashboard"
    debug: bool = False
    
    # Default AWS region (used as fallback)
    default_aws_region: str = "us-east-1"
    
    # Redis Configuration
    redis_url: str = "redis://localhost:6379"
    cache_ttl: int = 3600  # 1 hour
    
    # CORS - Allow external access in development
    allowed_origins: Union[str, list] = ["http://localhost:3000", "http://0.0.0.0:3000", "*"]
    
    @field_validator('allowed_origins')
    @classmethod
    def parse_allowed_origins(cls, v):
        if isinstance(v, str):
            # Handle comma-separated string from environment variable
            return [origin.strip() for origin in v.split(',') if origin.strip()]
        return v
    
    class Config:
        env_file = ".env"


settings = Settings()