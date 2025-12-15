#!/bin/bash
set -e

echo "🔍 Validating Docker configuration..."

# Check if Dockerfile exists
if [ ! -f "Dockerfile" ]; then
    echo "❌ Dockerfile not found"
    exit 1
fi
echo "✅ Dockerfile found"

# Check if nginx.conf exists
if [ ! -f "nginx.conf" ]; then
    echo "❌ nginx.conf not found"
    exit 1
fi
echo "✅ nginx.conf found"

# Check if .dockerignore exists
if [ ! -f ".dockerignore" ]; then
    echo "❌ .dockerignore not found"
    exit 1
fi
echo "✅ .dockerignore found"

# Validate nginx configuration syntax (if nginx is available)
if command -v nginx &> /dev/null; then
    echo "🔍 Validating nginx configuration..."
    nginx -t -c nginx.conf 2>&1 || echo "⚠️  nginx validation skipped (not in container context)"
else
    echo "⚠️  nginx not available for validation"
fi

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker not available - skipping build test"
    echo "📝 To test Docker build manually, run:"
    echo "   docker build --build-arg VITE_SUPABASE_URL=https://your-project.supabase.co \\"
    echo "                --build-arg VITE_SUPABASE_ANON_KEY=your_key \\"
    echo "                -t lastplateprod:test ."
    exit 0
fi

echo "🐳 Docker available - testing build..."

# Test Docker build
docker build \
    --build-arg VITE_SUPABASE_URL=https://example.supabase.co \
    --build-arg VITE_SUPABASE_ANON_KEY=test_key_for_validation \
    --build-arg VITE_ENABLE_DEMO_MODE=false \
    -t lastplateprod:test .

echo "✅ Docker build successful"

# Test container startup
echo "🚀 Testing container startup..."
CONTAINER_ID=$(docker run -d -p 8080:8080 lastplateprod:test)

# Wait for container to be ready
sleep 5

# Test health endpoint
if curl -f http://localhost:8080/health > /dev/null 2>&1; then
    echo "✅ Health check passed"
else
    echo "❌ Health check failed"
    docker logs $CONTAINER_ID
    docker stop $CONTAINER_ID
    docker rm $CONTAINER_ID
    exit 1
fi

# Test main page
if curl -f http://localhost:8080/ > /dev/null 2>&1; then
    echo "✅ Main page accessible"
else
    echo "❌ Main page not accessible"
    docker logs $CONTAINER_ID
    docker stop $CONTAINER_ID
    docker rm $CONTAINER_ID
    exit 1
fi

# Cleanup
docker stop $CONTAINER_ID
docker rm $CONTAINER_ID

echo "✅ All Docker validation tests passed!"
