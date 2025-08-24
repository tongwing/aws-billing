# AWS Billing Dashboard

A real-time AWS billing dashboard web application that tracks cloud usage and costs with comprehensive filtering and grouping capabilities.

## Features
- ✅ User-configurable AWS credentials (no server-side .env required)
- ✅ Stateless backend supporting multiple users
- ✅ AWS Cost Explorer API integration with real-time data
- ✅ Interactive Chart.js visualizations (bar/line charts)
- ✅ Advanced filtering and grouping by AWS dimensions
- ✅ Service breakdown analysis and cost rankings
- ✅ Data export functionality (CSV, JSON, reports)
- ✅ Docker containerization for easy deployment
- ✅ Responsive design with Tailwind CSS

## Quick Start (Docker - Recommended)

### Prerequisites
- Docker and Docker Compose
- AWS account with Cost Explorer API access

### Running with Docker

1. **Start the application:**
   ```bash
   docker compose up -d
   ```

2. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000

3. **Configure AWS credentials in the web interface:**
   - Open http://localhost:3000
   - Click "Manage Credentials" to enter your AWS credentials
   - Credentials are stored securely in your browser

4. **Stop the application:**
   ```bash
   docker compose down
   ```

## Development Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- AWS account with Cost Explorer API access

### Local Development

1. **Start Backend:**
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ./start.sh
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm install
   ./start.sh
   ```

### AWS Permissions Required
Ensure your AWS credentials have the following permissions:
- `ce:GetCostAndUsage`
- `ce:GetDimensionValues`

### Testing the Setup

1. **Backend health check:** http://localhost:8000/api/health
2. **API documentation:** http://localhost:8000/docs  
3. **Frontend application:** http://localhost:3000

### External Access (Optional)
Use the convenience script for external server access:
```bash
./start-external.sh [YOUR_PUBLIC_IP]
```

## API Reference

### Core Endpoints
- `GET /api/health` - Health check and system status
- `POST /api/credentials/validate` - Validate AWS credentials
- `POST /api/cost-data` - Retrieve cost and usage data (requires credentials)
- `POST /api/dimensions/{dimension}` - Get available dimension values (requires credentials)

### Usage
All cost data endpoints require AWS credentials to be passed in the request body. The frontend handles this automatically through the credential management system.

## Architecture
- **Backend**: FastAPI with stateless design
- **Frontend**: React with TypeScript and Tailwind CSS
- **AWS Integration**: boto3 for Cost Explorer API
- **Storage**: Client-side encrypted credential storage
- **Containerization**: Docker with multi-stage builds and nginx proxy