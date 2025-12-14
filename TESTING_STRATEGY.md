# Testing Strategy - Restaurant Management System

## Overview

This document outlines the testing strategy for ensuring quality and reliability of the Restaurant Management System before production deployment.

## Testing Pyramid

```
                 /\
                /  \
               /E2E \
              /------\
             /        \
            /Integration\
           /------------\
          /              \
         /   Unit Tests   \
        /------------------\
```

**Target Coverage**:
- Unit Tests: 80% code coverage
- Integration Tests: 70% coverage
- E2E Tests: Critical user journeys

## 1. Unit Testing

### Tools & Framework
- **Test Runner**: Vitest (fast, Vite-native)
- **Assertions**: Vitest built-in matchers
- **Mocking**: Vitest mocking utilities
- **Coverage**: c8 (built into Vitest)

### Setup

```bash
npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom jsdom
```

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'c8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData.ts'
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
```

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});
```

### Unit Test Examples

#### Analytics Functions

```typescript
// src/lib/__tests__/analytics.test.ts
import { describe, it, expect } from 'vitest';
import { 
  calculateLinearRegression, 
  forecastDemand,
  identifyWastePatterns 
} from '../analytics';

describe('calculateLinearRegression', () => {
  it('should calculate correct slope and intercept for increasing trend', () => {
    const xValues = [1, 2, 3, 4, 5];
    const yValues = [2, 4, 6, 8, 10];
    
    const result = calculateLinearRegression(xValues, yValues);
    
    expect(result.slope).toBeCloseTo(2, 2);
    expect(result.intercept).toBeCloseTo(0, 2);
    expect(result.r2).toBeCloseTo(1, 2); // Perfect correlation
  });

  it('should handle empty arrays', () => {
    const result = calculateLinearRegression([], []);
    
    expect(result.slope).toBe(0);
    expect(result.intercept).toBe(0);
    expect(result.r2).toBe(0);
  });

  it('should calculate correct r2 for imperfect correlation', () => {
    const xValues = [1, 2, 3, 4, 5];
    const yValues = [2, 3, 6, 7, 11]; // Some noise
    
    const result = calculateLinearRegression(xValues, yValues);
    
    expect(result.r2).toBeGreaterThan(0.8);
    expect(result.r2).toBeLessThanOrEqual(1);
  });
});

describe('forecastDemand', () => {
  it('should return null for insufficient data', () => {
    const salesData = [
      { id: '1', date: '2024-01-01', locationId: 'loc-1', inventoryItemId: 'item-1', itemName: 'Item', quantitySold: 10, revenue: 100 }
    ];
    
    const result = forecastDemand(salesData, 'item-1', 7);
    
    expect(result).toBeNull();
  });

  it('should forecast increasing trend correctly', () => {
    const salesData = [
      { id: '1', date: '2024-01-01', locationId: 'loc-1', inventoryItemId: 'item-1', itemName: 'Item', quantitySold: 10, revenue: 100 },
      { id: '2', date: '2024-01-02', locationId: 'loc-1', inventoryItemId: 'item-1', itemName: 'Item', quantitySold: 12, revenue: 120 },
      { id: '3', date: '2024-01-03', locationId: 'loc-1', inventoryItemId: 'item-1', itemName: 'Item', quantitySold: 14, revenue: 140 },
      { id: '4', date: '2024-01-04', locationId: 'loc-1', inventoryItemId: 'item-1', itemName: 'Item', quantitySold: 16, revenue: 160 }
    ];
    
    const result = forecastDemand(salesData, 'item-1', 7);
    
    expect(result).not.toBeNull();
    expect(result?.trend).toBe('increasing');
    expect(result?.predicted).toBeGreaterThan(16);
  });
});

describe('identifyWastePatterns', () => {
  it('should aggregate waste by reason', () => {
    const wasteData = [
      { id: '1', date: '2024-01-01', locationId: 'loc-1', inventoryItemId: 'item-1', itemName: 'Item', quantityWasted: 5, reason: 'expiration' as const, costImpact: 50 },
      { id: '2', date: '2024-01-02', locationId: 'loc-1', inventoryItemId: 'item-2', itemName: 'Item2', quantityWasted: 3, reason: 'expiration' as const, costImpact: 30 },
      { id: '3', date: '2024-01-03', locationId: 'loc-1', inventoryItemId: 'item-3', itemName: 'Item3', quantityWasted: 2, reason: 'spoilage' as const, costImpact: 20 }
    ];
    
    const result = identifyWastePatterns(wasteData);
    
    expect(result).toHaveLength(2);
    expect(result[0].reason).toBe('expiration');
    expect(result[0].quantity).toBe(8);
    expect(result[0].cost).toBe(80);
    expect(result[0].percentage).toBeCloseTo(80, 0);
  });
});
```

#### Permission Functions

```typescript
// src/lib/__tests__/permissions.test.ts
import { describe, it, expect } from 'vitest';
import { 
  getRolePermissions, 
  canApproveOrder, 
  getNextOrderStatus,
  calculateReorderRecommendation 
} from '../permissions';

describe('getRolePermissions', () => {
  it('should grant staff basic permissions only', () => {
    const permissions = getRolePermissions('staff');
    
    expect(permissions.canViewInventory).toBe(true);
    expect(permissions.canEditInventory).toBe(true);
    expect(permissions.canCreateOrders).toBe(true);
    expect(permissions.canApproveOrders).toBe(false);
    expect(permissions.canViewAnalytics).toBe(false);
    expect(permissions.canManageUsers).toBe(false);
  });

  it('should grant owner all permissions', () => {
    const permissions = getRolePermissions('owner');
    
    expect(permissions.canViewInventory).toBe(true);
    expect(permissions.canEditInventory).toBe(true);
    expect(permissions.canCreateOrders).toBe(true);
    expect(permissions.canApproveOrders).toBe(true);
    expect(permissions.canViewAnalytics).toBe(true);
    expect(permissions.canManageUsers).toBe(true);
    expect(permissions.canViewAllLocations).toBe(true);
  });
});

describe('canApproveOrder', () => {
  it('should allow manager to approve pending_manager orders', () => {
    expect(canApproveOrder('manager', 'pending_manager')).toBe(true);
  });

  it('should not allow manager to approve pending_admin orders', () => {
    expect(canApproveOrder('manager', 'pending_admin')).toBe(false);
  });

  it('should allow admin to approve pending_admin orders', () => {
    expect(canApproveOrder('admin', 'pending_admin')).toBe(true);
  });

  it('should not allow staff to approve any orders', () => {
    expect(canApproveOrder('staff', 'pending_manager')).toBe(false);
    expect(canApproveOrder('staff', 'pending_admin')).toBe(false);
  });
});

describe('calculateReorderRecommendation', () => {
  it('should recommend reorder when stock is below reorder point', () => {
    const result = calculateReorderRecommendation(
      10,  // currentStock
      5,   // avgDailySales
      3,   // leadTimeDays
      3    // safetyStockDays
    );
    
    expect(result.shouldReorder).toBe(true);
    expect(result.recommendedQuantity).toBeGreaterThan(0);
  });

  it('should not recommend reorder when stock is sufficient', () => {
    const result = calculateReorderRecommendation(
      100, // currentStock
      5,   // avgDailySales
      3,   // leadTimeDays
      3    // safetyStockDays
    );
    
    expect(result.shouldReorder).toBe(false);
    expect(result.recommendedQuantity).toBe(0);
  });
});
```

#### Component Tests

```typescript
// src/components/__tests__/kpi-card.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { KpiCard } from '../kpi-card';

describe('KpiCard', () => {
  it('should render title and value', () => {
    render(
      <KpiCard 
        title="Total Sales" 
        value="$5,000" 
        icon={<div>Icon</div>} 
      />
    );
    
    expect(screen.getByText('Total Sales')).toBeInTheDocument();
    expect(screen.getByText('$5,000')).toBeInTheDocument();
  });

  it('should render positive trend', () => {
    render(
      <KpiCard 
        title="Sales" 
        value="$5,000" 
        trend={15} 
        icon={<div>Icon</div>} 
      />
    );
    
    expect(screen.getByText(/15%/)).toBeInTheDocument();
  });

  it('should render negative trend', () => {
    render(
      <KpiCard 
        title="Waste" 
        value="$500" 
        trend={-10} 
        icon={<div>Icon</div>} 
      />
    );
    
    expect(screen.getByText(/-10%/)).toBeInTheDocument();
  });
});
```

### Run Unit Tests

```json
// package.json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

## 2. Integration Testing

### Tools
- **React Testing Library**: Test component interactions
- **MSW (Mock Service Worker)**: Mock API calls
- **Vitest**: Test runner

### Setup

```bash
npm install -D msw
```

```typescript
// src/test/mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  rest.get('/api/inventory', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        { id: '1', name: 'Item 1', currentStock: 100, /* ... */ }
      ])
    );
  }),
  
  rest.post('/api/orders', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({ id: 'order-1', status: 'pending_manager' })
    );
  })
];
```

```typescript
// src/test/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

### Integration Test Examples

```typescript
// src/components/views/__tests__/inventory-view.integration.test.tsx
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InventoryView } from '../inventory-view';
import { server } from '@/test/mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('InventoryView Integration', () => {
  it('should load and display inventory items', async () => {
    render(<InventoryView locationId="loc-1" />);
    
    await waitFor(() => {
      expect(screen.getByText('Item 1')).toBeInTheDocument();
    });
  });

  it('should filter inventory by search term', async () => {
    const user = userEvent.setup();
    render(<InventoryView locationId="loc-1" />);
    
    const searchInput = screen.getByPlaceholderText(/search/i);
    await user.type(searchInput, 'Item 1');
    
    await waitFor(() => {
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.queryByText('Item 2')).not.toBeInTheDocument();
    });
  });

  it('should update stock quantity', async () => {
    const user = userEvent.setup();
    render(<InventoryView locationId="loc-1" />);
    
    await waitFor(() => {
      expect(screen.getByText('Item 1')).toBeInTheDocument();
    });
    
    const updateButton = screen.getByRole('button', { name: /update stock/i });
    await user.click(updateButton);
    
    const input = screen.getByLabelText(/new stock/i);
    await user.clear(input);
    await user.type(input, '150');
    
    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText(/stock updated/i)).toBeInTheDocument();
    });
  });
});
```

## 3. End-to-End Testing

### Tools
- **Playwright**: Browser automation
- **@playwright/test**: E2E test runner

### Setup

```bash
npm install -D @playwright/test
npx playwright install
```

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

### E2E Test Examples

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should login as manager', async ({ page }) => {
    await page.goto('/');
    
    await page.fill('input[type="text"]', 'manager');
    await page.fill('input[type="password"]', 'demo');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/');
    await expect(page.locator('text=Welcome')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/');
    
    await page.fill('input[type="text"]', 'nonexistent');
    await page.fill('input[type="password"]', 'wrong');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    await page.goto('/');
    
    // Login first
    await page.fill('input[type="text"]', 'staff');
    await page.fill('input[type="password"]', 'demo');
    await page.click('button[type="submit"]');
    
    // Logout
    await page.click('[aria-label="User menu"]');
    await page.click('text=Logout');
    
    await expect(page.locator('text=Sign in')).toBeVisible();
  });
});
```

```typescript
// e2e/inventory.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Inventory Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('input[type="text"]', 'staff');
    await page.fill('input[type="password"]', 'demo');
    await page.click('button[type="submit"]');
    
    await page.click('text=Inventory');
  });

  test('should display inventory items', async ({ page }) => {
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('tbody tr')).toHaveCount(await page.locator('tbody tr').count());
  });

  test('should search inventory', async ({ page }) => {
    await page.fill('input[placeholder*="Search"]', 'Chicken');
    
    const rows = page.locator('tbody tr');
    await expect(rows).toHaveCountGreaterThan(0);
    
    const firstRow = rows.first();
    await expect(firstRow).toContainText('Chicken');
  });

  test('should add new inventory item', async ({ page }) => {
    await page.click('button:has-text("Add Item")');
    
    await page.fill('input[name="name"]', 'Test Item');
    await page.fill('input[name="currentStock"]', '100');
    await page.fill('input[name="costPerUnit"]', '5.99');
    await page.selectOption('select[name="category"]', 'Dry Goods');
    
    await page.click('button:has-text("Save")');
    
    await expect(page.locator('text=Item added successfully')).toBeVisible();
  });

  test('should update stock quantity', async ({ page }) => {
    const firstRow = page.locator('tbody tr').first();
    await firstRow.locator('button:has-text("Update")').click();
    
    await page.fill('input[name="quantity"]', '150');
    await page.click('button:has-text("Save")');
    
    await expect(page.locator('text=Stock updated')).toBeVisible();
  });
});
```

```typescript
// e2e/orders.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Purchase Order Workflow', () => {
  test('staff creates order -> manager approves -> admin approves', async ({ browser }) => {
    // Staff creates order
    const staffContext = await browser.newContext();
    const staffPage = await staffContext.newPage();
    await staffPage.goto('/');
    await staffPage.fill('input[type="text"]', 'staff');
    await staffPage.fill('input[type="password"]', 'demo');
    await staffPage.click('button[type="submit"]');
    await staffPage.click('text=Orders');
    await staffPage.click('button:has-text("Create Order")');
    
    await staffPage.selectOption('select[name="vendor"]', { index: 0 });
    await staffPage.click('button:has-text("Add Item")');
    await staffPage.selectOption('select[name="item"]', { index: 0 });
    await staffPage.fill('input[name="quantity"]', '50');
    await staffPage.fill('input[name="unitPrice"]', '10');
    await staffPage.click('button:has-text("Submit Order")');
    
    await expect(staffPage.locator('text=Order created')).toBeVisible();
    const orderId = await staffPage.locator('[data-order-id]').getAttribute('data-order-id');
    
    await staffContext.close();
    
    // Manager approves
    const managerContext = await browser.newContext();
    const managerPage = await managerContext.newPage();
    await managerPage.goto('/');
    await managerPage.fill('input[type="text"]', 'manager');
    await managerPage.fill('input[type="password"]', 'demo');
    await managerPage.click('button[type="submit"]');
    await managerPage.click('text=Orders');
    
    await managerPage.click(`[data-order-id="${orderId}"] button:has-text("Approve")`);
    await expect(managerPage.locator('text=pending_admin')).toBeVisible();
    
    await managerContext.close();
    
    // Admin approves
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();
    await adminPage.goto('/');
    await adminPage.fill('input[type="text"]', 'admin');
    await adminPage.fill('input[type="password"]', 'demo');
    await adminPage.click('button[type="submit"]');
    await adminPage.click('text=Orders');
    
    await adminPage.click(`[data-order-id="${orderId}"] button:has-text("Approve")`);
    await expect(adminPage.locator('text=approved')).toBeVisible();
    
    await adminContext.close();
  });
});
```

## 4. Accessibility Testing

### Tools
- **axe-core**: Automated accessibility testing
- **@axe-core/playwright**: Playwright integration

### Setup

```bash
npm install -D @axe-core/playwright
```

```typescript
// e2e/accessibility.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('should not have accessibility violations on login page', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should not have accessibility violations on inventory page', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[type="text"]', 'staff');
    await page.fill('input[type="password"]', 'demo');
    await page.click('button[type="submit"]');
    await page.click('text=Inventory');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
```

## 5. Performance Testing

### Lighthouse CI

```bash
npm install -D @lhci/cli
```

```javascript
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run preview',
      url: ['http://localhost:4173'],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['warn', { minScore: 0.9 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
```

## 6. CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npx playwright test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/

  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npx @lhci/cli@0.12.x autorun
```

## 7. Test Data Management

### Mock Data

```typescript
// src/test/mockData.ts
import { User, InventoryItem, PurchaseOrder } from '@/lib/types';

export const mockUsers: User[] = [
  {
    id: 'user-1',
    username: 'teststaff',
    name: 'Test Staff',
    role: 'staff',
    locationId: 'loc-1',
    email: 'staff@test.com'
  },
  // ... more users
];

export const mockInventory: InventoryItem[] = [
  {
    id: 'item-1',
    name: 'Test Item',
    category: 'Produce',
    currentStock: 100,
    unit: 'kg',
    reorderPoint: 20,
    reorderQuantity: 50,
    costPerUnit: 5.99,
    locationId: 'loc-1',
    lastUpdated: '2024-01-01T00:00:00Z',
    updatedBy: 'user-1'
  },
  // ... more items
];
```

## 8. Testing Checklist

### Before Each Release
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] All E2E tests pass
- [ ] Code coverage > 80%
- [ ] No accessibility violations
- [ ] Lighthouse performance score > 90
- [ ] Manual smoke tests completed
- [ ] Cross-browser testing completed

### Critical User Journeys to Test
- [ ] User login/logout
- [ ] Staff updates inventory
- [ ] Staff creates purchase order
- [ ] Manager approves order
- [ ] Admin approves order
- [ ] Order flows through complete workflow
- [ ] Analytics display correctly
- [ ] Vendor management works
- [ ] Permissions are enforced
- [ ] Location filtering works

---

**Last Updated**: 2025-10-27  
**Version**: 1.0
