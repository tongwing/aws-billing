from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    app_name: str = "AWS Billing Dashboard"
    debug: bool = False
    
    # AWS Configuration
    aws_access_key_id: Optional[str] = None
    aws_secret_access_key: Optional[str] = None
    aws_region: str = "us-east-1"
    
    # Redis Configuration
    redis_url: str = "redis://localhost:6379"
    cache_ttl: int = 3600  # 1 hour
    
    # CORS - Allow external access in development
    allowed_origins: list = ["http://localhost:3000", "http://0.0.0.0:3000", "*"]
    
    class Config:
        env_file = ".env"


settings = Settings()