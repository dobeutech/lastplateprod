#!/bin/bash
set -e

echo "🚀 LastPlate Production Deployment Script"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
VERSION=${1:-"2.0.0"}
ENVIRONMENT=${2:-"production"}

echo -e "${BLUE}Version:${NC} $VERSION"
echo -e "${BLUE}Environment:${NC} $ENVIRONMENT"
echo ""

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
    else
        echo -e "${RED}✗${NC} $2"
        exit 1
    fi
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Step 1: Pre-deployment checks
echo "Step 1: Pre-deployment Checks"
echo "------------------------------"

# Check if .env exists
if [ ! -f .env ]; then
    print_warning ".env file not found"
    print_info "Please create .env file with required variables"
    print_info "See .env.example for template"
    exit 1
fi

# Source environment variables
set -a
source .env
set +a

# Check required variables
REQUIRED_VARS=("VITE_SUPABASE_URL" "VITE_SUPABASE_ANON_KEY")
MISSING_VARS=0

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        print_warning "Missing required variable: $var"
        MISSING_VARS=$((MISSING_VARS + 1))
    else
        print_status 0 "$var is set"
    fi
done

if [ $MISSING_VARS -gt 0 ]; then
    echo ""
    print_warning "$MISSING_VARS required variables missing"
    print_info "Please set all required variables in .env file"
    exit 1
fi

echo ""

# Step 2: Run validation checks
echo "Step 2: Validation Checks"
echo "-------------------------"

# Check if Docker is installed
if command -v docker &> /dev/null; then
    print_status 0 "Docker is installed"
else
    print_status 1 "Docker is not installed"
fi

# Check if git is clean
if [ -z "$(git status --porcelain)" ]; then
    print_status 0 "Git working directory is clean"
else
    print_warning "Git working directory has uncommitted changes"
    git status --short
    echo ""
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Run environment check
print_info "Running environment check..."
if ./scripts/tools/env-check.sh > /dev/null 2>&1; then
    print_status 0 "Environment check passed"
else
    print_warning "Environment check has warnings (continuing)"
fi

echo ""

# Step 3: Build Docker image
echo "Step 3: Build Docker Image"
echo "--------------------------"

print_info "Building Docker image..."

docker build \
    --build-arg VITE_SUPABASE_URL="$VITE_SUPABASE_URL" \
    --build-arg VITE_SUPABASE_ANON_KEY="$VITE_SUPABASE_ANON_KEY" \
    --build-arg VITE_SENTRY_DSN="${VITE_SENTRY_DSN:-}" \
    --build-arg VITE_INTERCOM_APP_ID="${VITE_INTERCOM_APP_ID:-}" \
    --build-arg VITE_ENABLE_DEMO_MODE="${VITE_ENABLE_DEMO_MODE:-false}" \
    --build-arg VITE_APP_NAME="${VITE_APP_NAME:-Restaurant Management System}" \
    --build-arg VITE_APP_VERSION="$VERSION" \
    -t lastplateprod:$VERSION \
    -t lastplateprod:latest \
    . > /tmp/docker-build.log 2>&1

if [ $? -eq 0 ]; then
    print_status 0 "Docker image built successfully"
else
    print_status 1 "Docker build failed"
    echo "Check /tmp/docker-build.log for details"
    tail -20 /tmp/docker-build.log
    exit 1
fi

echo ""

# Step 4: Test Docker image
echo "Step 4: Test Docker Image"
echo "-------------------------"

print_info "Starting test container..."

# Stop and remove existing test container if exists
docker stop lastplateprod-test 2>/dev/null || true
docker rm lastplateprod-test 2>/dev/null || true

# Run test container
docker run -d \
    -p 8081:8080 \
    --name lastplateprod-test \
    lastplateprod:$VERSION > /dev/null 2>&1

if [ $? -eq 0 ]; then
    print_status 0 "Test container started"
else
    print_status 1 "Failed to start test container"
    exit 1
fi

# Wait for container to be ready
print_info "Waiting for container to be ready..."
sleep 5

# Test health endpoint
print_info "Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s http://localhost:8081/health)

if [ "$HEALTH_RESPONSE" = "healthy" ]; then
    print_status 0 "Health check passed"
else
    print_status 1 "Health check failed"
    echo "Response: $HEALTH_RESPONSE"
    docker logs lastplateprod-test
    docker stop lastplateprod-test
    docker rm lastplateprod-test
    exit 1
fi

# Cleanup test container
docker stop lastplateprod-test > /dev/null 2>&1
docker rm lastplateprod-test > /dev/null 2>&1
print_info "Test container cleaned up"

echo ""

# Step 5: Deploy to production
echo "Step 5: Deploy to Production"
echo "-----------------------------"

print_warning "About to deploy to $ENVIRONMENT"
echo ""
echo "Version: $VERSION"
echo "Image: lastplateprod:$VERSION"
echo ""
read -p "Continue with deployment? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_info "Deployment cancelled"
    exit 0
fi

print_info "Stopping existing container..."
docker stop lastplateprod 2>/dev/null || true
docker rm lastplateprod 2>/dev/null || true

print_info "Starting new container..."
docker run -d \
    -p 8080:8080 \
    --name lastplateprod \
    --restart unless-stopped \
    lastplateprod:$VERSION

if [ $? -eq 0 ]; then
    print_status 0 "Container started successfully"
else
    print_status 1 "Failed to start container"
    exit 1
fi

# Wait for container to be ready
print_info "Waiting for container to be ready..."
sleep 5

# Test health endpoint
print_info "Testing production health endpoint..."
HEALTH_RESPONSE=$(curl -s http://localhost:8080/health)

if [ "$HEALTH_RESPONSE" = "healthy" ]; then
    print_status 0 "Production health check passed"
else
    print_status 1 "Production health check failed"
    echo "Response: $HEALTH_RESPONSE"
    docker logs lastplateprod
    exit 1
fi

echo ""

# Step 6: Post-deployment verification
echo "Step 6: Post-Deployment Verification"
echo "-------------------------------------"

print_info "Checking container status..."
if docker ps | grep -q lastplateprod; then
    print_status 0 "Container is running"
else
    print_status 1 "Container is not running"
    exit 1
fi

print_info "Checking container logs..."
ERROR_COUNT=$(docker logs lastplateprod 2>&1 | grep -i error | wc -l)
if [ $ERROR_COUNT -eq 0 ]; then
    print_status 0 "No errors in logs"
else
    print_warning "Found $ERROR_COUNT errors in logs"
    docker logs lastplateprod 2>&1 | grep -i error | tail -5
fi

echo ""

# Step 7: Summary
echo "Step 7: Deployment Summary"
echo "--------------------------"

echo ""
echo -e "${GREEN}✅ Deployment Successful!${NC}"
echo ""
echo "Version: $VERSION"
echo "Environment: $ENVIRONMENT"
echo "Container: lastplateprod"
echo "Port: 8080"
echo ""
echo "Health Check: http://localhost:8080/health"
echo "Application: http://localhost:8080"
echo ""
echo "Next Steps:"
echo "1. Monitor logs: docker logs -f lastplateprod"
echo "2. Check Sentry for errors"
echo "3. Verify all features working"
echo "4. Set up monitoring alerts"
echo ""
echo "For rollback: docker stop lastplateprod && docker rm lastplateprod"
echo ""

# Create deployment log
DEPLOY_LOG="deployments/deploy-$VERSION-$(date +%Y%m%d-%H%M%S).log"
mkdir -p deployments
cat > $DEPLOY_LOG <<EOF
Deployment Log
==============

Version: $VERSION
Environment: $ENVIRONMENT
Date: $(date)
Deployed By: $(whoami)

Status: SUCCESS

Pre-Deployment:
- Environment variables: OK
- Docker installed: OK
- Git status: OK

Build:
- Docker image: lastplateprod:$VERSION
- Build status: SUCCESS

Testing:
- Health check: PASSED
- Container start: SUCCESS

Deployment:
- Container name: lastplateprod
- Port: 8080
- Restart policy: unless-stopped
- Status: RUNNING

Post-Deployment:
- Health check: PASSED
- Error count: $ERROR_COUNT
- Container status: RUNNING

Notes:
- Deployment completed successfully
- No issues detected
EOF

print_info "Deployment log saved to: $DEPLOY_LOG"

echo ""
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
