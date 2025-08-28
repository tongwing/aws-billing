#!/bin/bash

# AWS Billing Backend - Docker Rebuild Script
# This script rebuilds the backend Docker image after code changes

set -e  # Exit on any error

echo "🚀 Rebuilding AWS Billing Backend Docker Image..."
echo "================================================"

# Get the current directory name for the image tag
IMAGE_NAME="aws-billing-backend"
DOCKERFILE_PATH="."

# Stop and remove existing container if running
echo "📦 Stopping existing containers..."
docker-compose stop backend 2>/dev/null || true
docker-compose rm -f backend 2>/dev/null || true

# Remove existing image to force rebuild
echo "🗑️  Removing existing image..."
docker rmi ${IMAGE_NAME}:latest 2>/dev/null || true

# Build new image with no cache
echo "🔨 Building new Docker image..."
docker build --no-cache -t ${IMAGE_NAME}:latest ${DOCKERFILE_PATH}

echo ""
echo "✅ Backend rebuild complete!"
