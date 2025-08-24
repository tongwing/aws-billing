#!/bin/bash

# AWS Billing Frontend - Docker Rebuild Script
# This script rebuilds the frontend Docker image after code changes

set -e  # Exit on any error

echo "🚀 Rebuilding AWS Billing Frontend Docker Image..."
echo "================================================="

# Get the current directory name for the image tag
IMAGE_NAME="aws-billing-frontend"
DOCKERFILE_PATH="."

# Stop and remove existing container if running
echo "📦 Stopping existing containers..."
docker-compose stop frontend 2>/dev/null || true
docker-compose rm -f frontend 2>/dev/null || true

# Remove existing image to force rebuild
echo "🗑️  Removing existing image..."
docker rmi ${IMAGE_NAME}:latest 2>/dev/null || true

# Build new image with no cache
echo "🔨 Building new Docker image..."
docker build --no-cache -t ${IMAGE_NAME}:latest ${DOCKERFILE_PATH}

echo ""
echo "✅ Frontend rebuild complete!"
