#!/bin/bash
# Security risk scanner

echo "🛡️  Running Security Risk Scan..."

RISKS=0

# Check for common security issues
echo "1. Checking for eval() usage..."
if grep -r "eval(" src/ 2>/dev/null; then
    echo "❌ Found eval() - security risk"
    RISKS=$((RISKS + 1))
else
    echo "✅ No eval() found"
fi

echo "2. Checking for dangerouslySetInnerHTML..."
if grep -r "dangerouslySetInnerHTML" src/ 2>/dev/null; then
    echo "⚠️  Found dangerouslySetInnerHTML - review for XSS risks"
    RISKS=$((RISKS + 1))
else
    echo "✅ No dangerouslySetInnerHTML found"
fi

echo "3. Checking for hardcoded URLs..."
if grep -rE "http://[^l]" src/ 2>/dev/null; then
    echo "⚠️  Found hardcoded HTTP URLs - use HTTPS"
    RISKS=$((RISKS + 1))
else
    echo "✅ No hardcoded HTTP URLs found"
fi

echo "4. Checking for localStorage of sensitive data..."
if grep -r "localStorage.setItem.*password\|localStorage.setItem.*token" src/ 2>/dev/null; then
    echo "❌ Found sensitive data in localStorage"
    RISKS=$((RISKS + 1))
else
    echo "✅ No sensitive data in localStorage"
fi

echo ""
if [ $RISKS -gt 0 ]; then
    echo "❌ Found $RISKS security risk(s)"
    exit 1
else
    echo "✅ No security risks found"
    exit 0
fi
