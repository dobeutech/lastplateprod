#!/bin/bash
# Pre-commit hook for code quality checks

set -e

echo "🔍 Running pre-commit checks..."

# Run code review
./scripts/code-review.sh

# Run accessibility review
./scripts/a11y-review.sh

echo "✅ All pre-commit checks passed!"
