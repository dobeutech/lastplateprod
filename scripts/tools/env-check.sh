#!/bin/bash
# Environment variable checker

echo "🔧 Checking Environment Configuration..."

REQUIRED_VARS=(
    "VITE_SUPABASE_URL"
    "VITE_SUPABASE_ANON_KEY"
)

OPTIONAL_VARS=(
    "VITE_SENTRY_DSN"
    "VITE_INTERCOM_APP_ID"
    "VITE_ENABLE_DEMO_MODE"
    "VITE_APP_NAME"
    "VITE_APP_VERSION"
)

MISSING=0
WARNINGS=0

# Check required variables
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Missing required variable: $var"
        MISSING=$((MISSING + 1))
    else
        echo "✅ $var is set"
    fi
done

# Check optional variables
for var in "${OPTIONAL_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo "⚠️  Optional variable not set: $var"
        WARNINGS=$((WARNINGS + 1))
    else
        echo "✅ $var is set"
    fi
done

echo ""
if [ $MISSING -gt 0 ]; then
    echo "❌ $MISSING required variables missing"
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo "⚠️  $WARNINGS optional variables not set"
    exit 0
else
    echo "✅ All environment variables configured"
    exit 0
fi
