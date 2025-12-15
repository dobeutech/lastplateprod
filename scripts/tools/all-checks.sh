#!/bin/bash
# Comprehensive project checks - runs all validation scripts

set -e

echo "🚀 Running All Project Checks..."
echo "================================"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

cd "$PROJECT_ROOT"

# Track results
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

run_check() {
    local name=$1
    local script=$2
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Running: $name"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    if bash "$script"; then
        echo "✅ $name passed"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo "❌ $name failed"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
    fi
    echo ""
}

# Run all checks
run_check "Code Review" "./scripts/code-review.sh"
run_check "Accessibility Review" "./scripts/a11y-review.sh"
run_check "Environment Check" "./scripts/tools/env-check.sh"
run_check "Dependency Audit" "./scripts/tools/deps-audit.sh"
run_check "Risk Scan" "./scripts/tools/risk-scan.sh"

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Final Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Total Checks: $TOTAL_CHECKS"
echo "Passed: $PASSED_CHECKS"
echo "Failed: $FAILED_CHECKS"
echo ""

if [ $FAILED_CHECKS -gt 0 ]; then
    echo "❌ Some checks failed. Please review and fix issues."
    exit 1
else
    echo "✅ All checks passed! Ready for deployment."
    exit 0
fi
