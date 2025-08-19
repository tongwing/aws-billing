#!/bin/bash

# Activate virtual environment
source venv/bin/activate

# Start the FastAPI server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload