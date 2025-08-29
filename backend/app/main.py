from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import health, cost_data

app = FastAPI(
    title=settings.app_name,
    description="AWS Billing Dashboard API",
    version="1.0.0",
    debug=settings.debug
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers - support both root and sub-path API endpoints
api_prefix = "/api"
sub_path_api_prefix = f"{settings.api_base_path}/api" if settings.api_base_path else None

app.include_router(health.router, prefix=api_prefix)
app.include_router(cost_data.router, prefix=api_prefix)

# If sub-path is configured, also include routers with sub-path prefix
if sub_path_api_prefix and sub_path_api_prefix != api_prefix:
    app.include_router(health.router, prefix=sub_path_api_prefix)
    app.include_router(cost_data.router, prefix=sub_path_api_prefix)


@app.get("/")
async def root():
    return {"message": "AWS Billing Dashboard API"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug
    )