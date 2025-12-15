#!/bin/bash
set -e

echo "🔍 Running Code Review Checks..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
    else
        echo -e "${RED}✗${NC} $2"
        ERRORS=$((ERRORS + 1))
    fi
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
    WARNINGS=$((WARNINGS + 1))
}

# 1. Check for console.log statements
echo "1. Checking for console.log statements..."
if git diff --cached --name-only | grep -E '\.(ts|tsx|js|jsx)$' | xargs grep -n "console\.log" 2>/dev/null; then
    print_warning "Found console.log statements - remove before committing"
else
    print_status 0 "No console.log statements found"
fi
echo ""

# 2. Check for hardcoded secrets
echo "2. Checking for hardcoded secrets..."
SECRETS_FOUND=0
if git diff --cached --name-only | xargs grep -nE "(password|secret|api_key|token|private_key)\s*=\s*['\"][^'\"]+['\"]" 2>/dev/null; then
    print_warning "Potential hardcoded secrets found"
    SECRETS_FOUND=1
fi

if git diff --cached --name-only | xargs grep -nE "AKIA[0-9A-Z]{16}" 2>/dev/null; then
    print_warning "Potential AWS access key found"
    SECRETS_FOUND=1
fi

if [ $SECRETS_FOUND -eq 0 ]; then
    print_status 0 "No hardcoded secrets found"
fi
echo ""

# 3. Check TypeScript compilation
echo "3. Checking TypeScript compilation..."
if npx tsc --noEmit 2>&1 | tee /tmp/tsc-output.txt; then
    print_status 0 "TypeScript compilation successful"
else
    print_status 1 "TypeScript compilation failed"
    cat /tmp/tsc-output.txt
fi
echo ""

# 4. Run ESLint
echo "4. Running ESLint..."
if npm run lint 2>&1 | tee /tmp/eslint-output.txt; then
    print_status 0 "ESLint passed"
else
    print_status 1 "ESLint failed"
    cat /tmp/eslint-output.txt
fi
echo ""

# 5. Check for TODO/FIXME comments
echo "5. Checking for TODO/FIXME comments..."
if git diff --cached --name-only | xargs grep -nE "(TODO|FIXME|XXX|HACK)" 2>/dev/null; then
    print_warning "Found TODO/FIXME comments - consider addressing before committing"
else
    print_status 0 "No TODO/FIXME comments found"
fi
echo ""

# 6. Check file sizes
echo "6. Checking file sizes..."
LARGE_FILES=0
while IFS= read -r file; do
    if [ -f "$file" ]; then
        SIZE=$(wc -c < "$file")
        if [ $SIZE -gt 100000 ]; then
            print_warning "Large file detected: $file ($(numfmt --to=iec-i --suffix=B $SIZE))"
            LARGE_FILES=1
        fi
    fi
done < <(git diff --cached --name-only)

if [ $LARGE_FILES -eq 0 ]; then
    print_status 0 "No large files detected"
fi
echo ""

# 7. Check for .env files
echo "7. Checking for .env files..."
if git diff --cached --name-only | grep -E "\.env$" 2>/dev/null; then
    print_status 1 ".env file should not be committed"
else
    print_status 0 "No .env files in commit"
fi
echo ""

# 8. Check for package-lock.json changes
echo "8. Checking package-lock.json..."
if git diff --cached --name-only | grep "package-lock.json" 2>/dev/null; then
    if git diff --cached --name-only | grep "package.json" 2>/dev/null; then
        print_status 0 "package.json and package-lock.json both updated"
    else
        print_warning "package-lock.json changed without package.json"
    fi
else
    print_status 0 "No package-lock.json changes"
fi
echo ""

# 9. Check for proper error handling
echo "9. Checking for error handling..."
MISSING_ERROR_HANDLING=0
while IFS= read -r file; do
    if [[ $file =~ \.(ts|tsx)$ ]]; then
        if grep -q "async " "$file" 2>/dev/null; then
            if ! grep -q "try\|catch" "$file" 2>/dev/null; then
                print_warning "Async function without try/catch in: $file"
                MISSING_ERROR_HANDLING=1
            fi
        fi
    fi
done < <(git diff --cached --name-only)

if [ $MISSING_ERROR_HANDLING -eq 0 ]; then
    print_status 0 "Error handling looks good"
fi
echo ""

# 10. Check for proper imports
echo "10. Checking imports..."
IMPORT_ISSUES=0
while IFS= read -r file; do
    if [[ $file =~ \.(ts|tsx)$ ]]; then
        if grep -q "import.*from.*'\.\.\/\.\.\/\.\.\/'" "$file" 2>/dev/null; then
            print_warning "Deep relative imports found in: $file - consider using @/ alias"
            IMPORT_ISSUES=1
        fi
    fi
done < <(git diff --cached --name-only)

if [ $IMPORT_ISSUES -eq 0 ]; then
    print_status 0 "Import structure looks good"
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Summary:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "Errors: ${RED}$ERRORS${NC}"
echo -e "Warnings: ${YELLOW}$WARNINGS${NC}"
echo ""

if [ $ERRORS -gt 0 ]; then
    echo -e "${RED}❌ Code review failed with $ERRORS error(s)${NC}"
    echo "Please fix the errors before committing."
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Code review passed with $WARNINGS warning(s)${NC}"
    echo "Consider addressing warnings before committing."
    exit 0
else
    echo -e "${GREEN}✅ Code review passed!${NC}"
    exit 0
fi
