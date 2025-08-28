# AWS Billing Dashboard - Docker Deployment Guide

## Overview

This guide shows how to run the AWS Billing Dashboard using Docker and Docker Compose. The application is containerized with:

- **Backend**: FastAPI service running on Python 3.11
- **Frontend**: React application served by Nginx
- **Networking**: Internal Docker network for service communication
- **Security**: Non-root users, health checks, and resource limits

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- 2GB+ available RAM
- 1GB+ available disk space

## Quick Start

### 1. Development Mode

```bash
# Build and start services
docker-compose up --build

# Or run in background
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api

### 2. Production Mode

```bash
# Build and start with production configuration
docker-compose -f docker-compose.prod.yml up --build -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop services
docker-compose -f docker-compose.prod.yml down
```

The application will be available at:
- **Frontend**: http://localhost:80 (port 80)
- **Backend API**: http://localhost:8000/api

## Configuration

### Environment Variables

Create a `.env` file from the template:

```bash
cp .env.example .env
```

Key configuration options:

```env
# Backend settings
DEBUG=false
DEFAULT_AWS_REGION=us-east-1
ALLOWED_ORIGINS=http://localhost:3000

# Frontend settings  
REACT_APP_API_URL=/api

# Development ports (docker-compose.yml)
BACKEND_PORT=8000
FRONTEND_PORT=3000

# Production ports (docker-compose.prod.yml)  
# BACKEND_PORT=8000
# FRONTEND_PORT=80
```

### Custom Ports

The application ports are now fully configurable via environment variables:

```bash
# Method 1: Set environment variables directly
export BACKEND_PORT=9000
export FRONTEND_PORT=4000
docker-compose up

# Method 2: Inline environment variables
BACKEND_PORT=9000 FRONTEND_PORT=4000 docker-compose up

# Method 3: Update your .env file
echo "BACKEND_PORT=9000" >> .env
echo "FRONTEND_PORT=4000" >> .env
docker-compose up
```

**Default ports:**
- Development: Backend=8000, Frontend=3000
- Production: Backend=8000, Frontend=80

## Architecture

### Docker Network

Services communicate over an internal Docker network:

```
┌─────────────────┐     ┌──────────────────┐
│   Frontend      │────▶│    Backend       │
│   (Nginx)       │     │   (FastAPI)      │
│   Port: 3000    │     │   Port: 8000     │
└─────────────────┘     └──────────────────┘
         │                        │
         ▼                        ▼
    External Port              Internal Only
    (Host: 3000)              (Container: 8000)
```

### API Routing

The frontend Nginx configuration proxies API requests:

- `http://localhost:3000/` → Frontend static files
- `http://localhost:3000/api/*` → Backend service (`http://backend:8000/api/*`)

### Data Persistence

Volumes are used for:

- **backend_data**: Application data and logs
- **backend_logs**: Production logs (prod mode only)

## Management Commands

### Build and Run

```bash
# Clean build (no cache)
docker-compose build --no-cache

# Build specific service
docker-compose build backend
docker-compose build frontend

# Start specific service
docker-compose up backend
docker-compose up frontend
```

### Development

```bash
# View real-time logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Execute commands in containers
docker-compose exec backend bash
docker-compose exec frontend sh

# Restart services
docker-compose restart
docker-compose restart backend
```

### Cleanup

```bash
# Stop and remove containers
docker-compose down

# Remove containers and volumes
docker-compose down -v

# Remove containers, volumes, and images
docker-compose down -v --rmi all

# Clean up Docker system
docker system prune -a
```

## Health Checks

Both services include health checks:

### Backend Health
- **Endpoint**: `http://localhost:8000/api/health`
- **Interval**: 30 seconds
- **Timeout**: 10 seconds

### Frontend Health
- **Check**: HTTP request to root path
- **Interval**: 30 seconds
- **Timeout**: 10 seconds

View health status:

```bash
docker-compose ps
```

## Troubleshooting

### Common Issues

**1. Port Already in Use**
```bash
# Check what's using the port
lsof -i :3000
lsof -i :8000

# Use different ports
BACKEND_PORT=9000 FRONTEND_PORT=4000 docker-compose up

# Or update your .env file
echo "BACKEND_PORT=9000" >> .env  
echo "FRONTEND_PORT=4000" >> .env
docker-compose up
```

**2. Build Failures**
```bash
# Clean build with no cache
docker-compose build --no-cache

# Check Docker logs
docker-compose logs backend
docker-compose logs frontend
```

**3. Service Not Starting**
```bash
# Check service status
docker-compose ps

# View detailed logs
docker-compose logs -f [service-name]

# Rebuild specific service
docker-compose up --build backend
```

**4. Network Issues**
```bash
# Check network connectivity
docker-compose exec frontend ping backend
docker-compose exec backend curl http://localhost:8000/api/health
```

### Debug Mode

For debugging, you can override the command:

```yaml
# Add to docker-compose.override.yml
version: '3.8'
services:
  backend:
    command: ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
    volumes:
      - ./backend:/app
```

## Security Features

- **Non-root users**: Both containers run as non-root
- **Resource limits**: CPU and memory limits in production
- **Security headers**: Nginx adds security headers
- **CORS configuration**: Proper CORS setup for API access
- **Health checks**: Monitor service health
- **Log rotation**: Prevent log files from growing too large

## Performance

### Resource Usage

**Development Mode:**
- Backend: ~200MB RAM, 0.5 CPU
- Frontend: ~100MB RAM, 0.2 CPU

**Production Mode:**
- Backend: Limited to 512MB RAM, 1.0 CPU
- Frontend: Limited to 256MB RAM, 0.5 CPU

### Optimization

- Multi-stage builds reduce image size
- Static file caching in Nginx
- Gzip compression enabled
- Health checks prevent failed deployments
- Volume mounts for persistent data

## Next Steps

1. **SSL/TLS**: Add reverse proxy with Let's Encrypt
2. **Monitoring**: Add Prometheus/Grafana monitoring
3. **Logging**: Centralized logging with ELK stack
4. **Scaling**: Use Docker Swarm or Kubernetes
5. **CI/CD**: Automated builds and deployments

For more information, see the main project README.md.