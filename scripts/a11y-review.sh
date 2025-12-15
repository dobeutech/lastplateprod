#!/bin/bash
set -e

echo "♿ Running Accessibility Review..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0
INFO=0

print_error() {
    echo -e "${RED}✗${NC} $1"
    ERRORS=$((ERRORS + 1))
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
    WARNINGS=$((WARNINGS + 1))
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
    INFO=$((INFO + 1))
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

# 1. Check for alt text on images
echo "1. Checking for alt text on images..."
MISSING_ALT=0
while IFS= read -r file; do
    if [[ $file =~ \.(tsx|jsx)$ ]]; then
        if grep -q "<img" "$file" 2>/dev/null; then
            if grep -E "<img[^>]*>" "$file" | grep -v "alt=" 2>/dev/null; then
                print_warning "Missing alt attribute in: $file"
                MISSING_ALT=1
            fi
        fi
    fi
done < <(find src -type f \( -name "*.tsx" -o -name "*.jsx" \))

if [ $MISSING_ALT -eq 0 ]; then
    print_success "All images have alt attributes"
fi
echo ""

# 2. Check for semantic HTML
echo "2. Checking for semantic HTML usage..."
SEMANTIC_ISSUES=0
while IFS= read -r file; do
    if [[ $file =~ \.(tsx|jsx)$ ]]; then
        # Check for excessive div usage
        DIV_COUNT=$(grep -o "<div" "$file" 2>/dev/null | wc -l)
        SEMANTIC_COUNT=$(grep -oE "<(header|nav|main|section|article|aside|footer)" "$file" 2>/dev/null | wc -l)
        
        if [ $DIV_COUNT -gt 10 ] && [ $SEMANTIC_COUNT -eq 0 ]; then
            print_info "Consider using semantic HTML in: $file (${DIV_COUNT} divs, 0 semantic elements)"
            SEMANTIC_ISSUES=1
        fi
    fi
done < <(find src -type f \( -name "*.tsx" -o -name "*.jsx" \))

if [ $SEMANTIC_ISSUES -eq 0 ]; then
    print_success "Semantic HTML usage looks good"
fi
echo ""

# 3. Check for ARIA labels
echo "3. Checking for ARIA labels on interactive elements..."
ARIA_ISSUES=0
while IFS= read -r file; do
    if [[ $file =~ \.(tsx|jsx)$ ]]; then
        # Check buttons without accessible names
        if grep -E "<button[^>]*>" "$file" | grep -v -E "(aria-label|aria-labelledby|>.*<)" 2>/dev/null; then
            print_warning "Button without accessible name in: $file"
            ARIA_ISSUES=1
        fi
        
        # Check links without text
        if grep -E "<a[^>]*>" "$file" | grep -v -E "(aria-label|aria-labelledby|>.*<)" 2>/dev/null; then
            print_warning "Link without accessible name in: $file"
            ARIA_ISSUES=1
        fi
    fi
done < <(find src -type f \( -name "*.tsx" -o -name "*.jsx" \))

if [ $ARIA_ISSUES -eq 0 ]; then
    print_success "ARIA labels look good"
fi
echo ""

# 4. Check for keyboard navigation
echo "4. Checking for keyboard navigation support..."
KEYBOARD_ISSUES=0
while IFS= read -r file; do
    if [[ $file =~ \.(tsx|jsx)$ ]]; then
        # Check for onClick without onKeyDown
        if grep -q "onClick=" "$file" 2>/dev/null; then
            if ! grep -q "onKeyDown=" "$file" 2>/dev/null; then
                print_info "Consider adding keyboard support in: $file"
                KEYBOARD_ISSUES=1
            fi
        fi
    fi
done < <(find src -type f \( -name "*.tsx" -o -name "*.jsx" \))

if [ $KEYBOARD_ISSUES -eq 0 ]; then
    print_success "Keyboard navigation support looks good"
fi
echo ""

# 5. Check for color contrast (basic check)
echo "5. Checking for potential color contrast issues..."
CONTRAST_ISSUES=0
while IFS= read -r file; do
    if [[ $file =~ \.(tsx|jsx|css)$ ]]; then
        # Check for light text on light background
        if grep -iE "color:\s*(#fff|white|#f)" "$file" 2>/dev/null; then
            if grep -iE "background(-color)?:\s*(#fff|white|#f)" "$file" 2>/dev/null; then
                print_warning "Potential contrast issue (light on light) in: $file"
                CONTRAST_ISSUES=1
            fi
        fi
    fi
done < <(find src -type f \( -name "*.tsx" -o -name "*.jsx" -o -name "*.css" \))

if [ $CONTRAST_ISSUES -eq 0 ]; then
    print_success "No obvious contrast issues found"
fi
echo ""

# 6. Check for form labels
echo "6. Checking for form labels..."
FORM_ISSUES=0
while IFS= read -r file; do
    if [[ $file =~ \.(tsx|jsx)$ ]]; then
        # Check inputs without labels
        if grep -q "<input" "$file" 2>/dev/null; then
            if ! grep -qE "(aria-label|aria-labelledby|<label)" "$file" 2>/dev/null; then
                print_warning "Input without label in: $file"
                FORM_ISSUES=1
            fi
        fi
    fi
done < <(find src -type f \( -name "*.tsx" -o -name "*.jsx" \))

if [ $FORM_ISSUES -eq 0 ]; then
    print_success "Form labels look good"
fi
echo ""

# 7. Check for heading hierarchy
echo "7. Checking for heading hierarchy..."
HEADING_ISSUES=0
while IFS= read -r file; do
    if [[ $file =~ \.(tsx|jsx)$ ]]; then
        # Check if h1 exists
        if ! grep -q "<h1" "$file" 2>/dev/null; then
            if grep -qE "<h[2-6]" "$file" 2>/dev/null; then
                print_info "Page may be missing h1 in: $file"
                HEADING_ISSUES=1
            fi
        fi
    fi
done < <(find src/pages -type f \( -name "*.tsx" -o -name "*.jsx" \) 2>/dev/null)

if [ $HEADING_ISSUES -eq 0 ]; then
    print_success "Heading hierarchy looks good"
fi
echo ""

# 8. Check for focus indicators
echo "8. Checking for focus indicators..."
FOCUS_ISSUES=0
if grep -r "outline:\s*none" src/ 2>/dev/null; then
    print_warning "Found 'outline: none' - ensure custom focus indicators are provided"
    FOCUS_ISSUES=1
fi

if grep -r "outline:\s*0" src/ 2>/dev/null; then
    print_warning "Found 'outline: 0' - ensure custom focus indicators are provided"
    FOCUS_ISSUES=1
fi

if [ $FOCUS_ISSUES -eq 0 ]; then
    print_success "Focus indicators look good"
fi
echo ""

# 9. Check for language attribute
echo "9. Checking for language attribute..."
if grep -q 'lang=' index.html 2>/dev/null; then
    print_success "Language attribute found in HTML"
else
    print_warning "Missing lang attribute in index.html"
fi
echo ""

# 10. Check for skip links
echo "10. Checking for skip navigation links..."
if grep -rq "skip.*navigation\|skip.*content" src/ 2>/dev/null; then
    print_success "Skip navigation links found"
else
    print_info "Consider adding skip navigation links for keyboard users"
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Accessibility Review Summary:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "Errors: ${RED}$ERRORS${NC}"
echo -e "Warnings: ${YELLOW}$WARNINGS${NC}"
echo -e "Info: ${BLUE}$INFO${NC}"
echo ""

if [ $ERRORS -gt 0 ]; then
    echo -e "${RED}❌ Accessibility review found $ERRORS critical issue(s)${NC}"
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Accessibility review found $WARNINGS warning(s)${NC}"
    echo "Consider addressing these issues to improve accessibility."
    exit 0
else
    echo -e "${GREEN}✅ Accessibility review passed!${NC}"
    echo ""
    echo "Recommendations:"
    echo "- Test with screen readers (NVDA, JAWS, VoiceOver)"
    echo "- Test keyboard navigation"
    echo "- Use automated tools (axe, Lighthouse)"
    echo "- Test with users who have disabilities"
    exit 0
fi
