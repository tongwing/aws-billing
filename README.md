# AWS Billing Dashboard

A real-time AWS billing dashboard web application that tracks cloud usage and costs with comprehensive filtering and grouping capabilities.

## Phase 1 - Foundation Setup (Completed)

### Architecture
- **Backend**: FastAPI with Python
- **Frontend**: React with TypeScript
- **AWS Integration**: boto3 for Cost Explorer API
- **Styling**: Tailwind CSS

### Features Implemented
- ✅ FastAPI backend with basic structure
- ✅ AWS Cost Explorer API integration
- ✅ React TypeScript frontend with Tailwind CSS
- ✅ Basic cost data retrieval endpoint
- ✅ Health check endpoint
- ✅ Configuration management for AWS credentials

## Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 16+
- AWS account with Cost Explorer API access

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure AWS credentials:
   ```bash
   cp .env.example .env
   # Edit .env file with your AWS credentials
   ```

5. Start the backend server:
   ```bash
   ./start.sh
   # Or manually:
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   ./start.sh
   # Or manually:
   npm start
   ```

### AWS Configuration

Edit the `.env` file in the backend directory:

```env
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-1
```

**Note**: Ensure your AWS credentials have the following permissions:
- `ce:GetCostAndUsage`
- `ce:GetDimensionValues`

### Quick Start

**Local Development:**
1. **Start Backend:**
   ```bash
   cd backend
   ./start.sh
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   ./start.sh
   ```

**External Access (One Command):**
```bash
./start-external.sh [YOUR_PUBLIC_IP]
```
This script will:
- Auto-detect your public IP (or use the provided one)
- Start both backend and frontend services
- Configure frontend to connect to the correct backend URL
- Display all access URLs

### Testing the Setup

**Local Access:**
1. Backend health check: http://localhost:8000/api/health
2. API documentation: http://localhost:8000/docs
3. Frontend application: http://localhost:3000

**External Access:**
1. Backend health check: http://YOUR_SERVER_IP:8000/api/health
2. API documentation: http://YOUR_SERVER_IP:8000/docs
3. Frontend application: http://YOUR_SERVER_IP:3000

**For External Access:**
Set the API URL environment variable before starting the frontend:
```bash
export REACT_APP_API_URL=http://YOUR_SERVER_IP:8000/api
cd frontend && ./start.sh
```

### Current API Endpoints

- `GET /api/health` - Health check and AWS configuration status
- `GET /api/cost-data` - Retrieve cost and usage data
- `GET /api/dimensions/{dimension}` - Get available dimension values

### Query Parameters for Cost Data

- `start_date` (optional): Start date (YYYY-MM-DD), defaults to 30 days ago
- `end_date` (optional): End date (YYYY-MM-DD), defaults to today
- `granularity` (optional): DAILY, WEEKLY, or MONTHLY (default: DAILY)
- `group_by_dimension` (optional): SERVICE, LINKED_ACCOUNT, REGION, etc.
- `metrics` (optional): Comma-separated metrics (default: BlendedCost)

### Example API Calls

```bash
# Get last 30 days of cost data
curl "http://localhost:8000/api/cost-data"

# Get cost data grouped by service
curl "http://localhost:8000/api/cost-data?group_by_dimension=SERVICE"

# Get monthly cost data for a specific date range
curl "http://localhost:8000/api/cost-data?start_date=2025-07-01&end_date=2025-08-01&granularity=MONTHLY"

# Get available services
curl "http://localhost:8000/api/dimensions/SERVICE"
```

## Phase 2 Features Completed ✅

- [x] Chart.js visualization with bar/line charts
- [x] Interactive chart controls with export functionality
- [x] Enhanced filter panel with advanced AWS dimensions
- [x] Service breakdown analysis and rankings
- [x] Data export (CSV, JSON, summary reports)
- [x] Responsive design improvements
- [x] Comprehensive error handling and user feedback

## Project Structure

```
aws-billing/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application entry point
│   │   ├── config.py            # Configuration settings
│   │   ├── models/
│   │   │   └── billing.py       # Pydantic models
│   │   ├── routers/
│   │   │   ├── health.py        # Health check endpoints
│   │   │   └── cost_data.py     # Cost data endpoints
│   │   └── services/
│   │       └── aws_cost_explorer.py  # AWS integration
│   ├── requirements.txt
│   ├── .env.example
│   └── start.sh
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard/       # Main dashboard components
│   │   │   └── Common/          # Reusable components
│   │   ├── hooks/
│   │   │   └── useCostData.ts   # Data fetching hook
│   │   ├── services/
│   │   │   └── api.ts           # API service layer
│   │   ├── types/
│   │   │   └── billing.ts       # TypeScript interfaces
│   │   └── utils/
│   │       └── dateHelpers.ts   # Date utility functions
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```