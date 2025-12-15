#!/bin/bash
# Dependency security audit

echo "🔒 Running Dependency Security Audit..."

# Run npm audit
echo "Running npm audit..."
if npm audit --audit-level=moderate; then
    echo "✅ No moderate or higher vulnerabilities found"
    EXIT_CODE=0
else
    echo "❌ Vulnerabilities found"
    echo ""
    echo "Run 'npm audit fix' to fix automatically"
    echo "Run 'npm audit' for details"
    EXIT_CODE=1
fi

# Check for outdated packages
echo ""
echo "Checking for outdated packages..."
npm outdated || true

echo ""
if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ Dependency audit passed"
else
    echo "❌ Dependency audit failed"
fi

exit $EXIT_CODE
