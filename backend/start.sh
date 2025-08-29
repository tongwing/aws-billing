#!/bin/bash

# Activate virtual environment
source venv/bin/activate

# Export API base path if provided
if [ -n "$API_BASE_PATH" ]; then
    export API_BASE_PATH
    echo "Backend will serve API at both /api and ${API_BASE_PATH}/api"
else
    echo "Backend will serve API at /api"
fi

# Start the FastAPI server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload