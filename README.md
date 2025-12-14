# Restaurant Management System

A comprehensive, production-ready restaurant management application built with React, TypeScript, and modern web technologies. This system provides multi-location inventory tracking, vendor management, purchase order workflows with multi-tier approvals, and ML-powered analytics.

## 🌟 Features

### Core Functionality

#### 1. **Advanced Inventory Management**
- Real-time stock tracking with automatic alerts
- Low-stock notifications when items reach reorder points
- Expiration date monitoring with advance warnings (7 days)
- FIFO (First In, First Out) rotation tracking
- Barcode support for quick item identification
- Category-based organization and filtering
- Comprehensive search functionality
- Stock value calculations and reporting

#### 2. **Multi-Tier Purchase Order System**
- Hierarchical approval workflow: Staff → Manager → Admin
- Order creation with multiple items and vendors
- Status tracking through entire lifecycle
- Rejection with reason documentation
- Order history and audit trail
- Expected vs actual delivery tracking
- Tax calculation and total management

#### 3. **Vendor Management**
- Complete vendor database with contact information
- Rating system for performance tracking
- Average delivery time monitoring
- Category-based vendor organization
- Payment terms documentation
- Vendor comparison capabilities
- Historical ordering data

#### 4. **ML-Powered Analytics**
- **Demand Forecasting**: Linear regression-based prediction for next 7 days
- **Sales Trend Analysis**: Visual charts showing revenue patterns
- **Waste Pattern Identification**: Analysis by reason (expiration, spoilage, damage, overproduction)
- **Inventory Valuation**: Real-time total inventory value calculation
- **Top Selling Items**: Revenue and quantity-based rankings
- **Cost Optimization**: Spending trends and recommendations
- **Predictive Alerts**: Proactive notifications based on historical patterns

#### 5. **Role-Based Access Control**
Five distinct user roles with granular permissions:

- **Owner**: Full system access, all locations
- **Admin**: User management, order approval, multi-location view
- **Regional Manager**: Cross-location oversight, order approval
- **Manager**: Single location management, order approval
- **Staff**: Inventory updates, create orders

#### 6. **Multi-Location Support**
- Location-based data segregation
- Cross-location reporting for regional managers
- Independent inventory management per location
- Location-specific order tracking
- Consolidated analytics across locations

#### 7. **24/7 Customer Support with Intercom**
- **FIN AI Chatbot**: Intelligent automated support available 24/7
- **User Segmentation**:
  - **Visitors (not logged in)**: Sales/outreach mode with FIN handling product questions, pricing inquiries, and demo requests
  - **Logged-in Members**: Context-aware support with user data, role information, and usage history
  - **Role-based routing**: Different support experiences for operators, managers, and admins
- **Proactive Messaging**:
  - New user onboarding assistance
  - Feature adoption prompts
  - Context-aware help based on current page
  - Usage analytics for targeted support
- **Event Tracking**:
  - Waste logging events
  - Vendor management actions
  - Purchase order creation
  - Feature usage analytics
- **Floating Help Button**: Always-accessible support chat in bottom-right corner
- **Office Hours Support**:
  - **Business Hours (Mon-Fri, 9 AM - 6 PM ET)**: Live agent support with <5 min response time SLA
  - **Off Hours**: FIN AI chatbot provides immediate answers, complex issues queued for next business day

## 🏗️ Architecture

### Technology Stack

**Frontend Framework:**
- React 19 with TypeScript
- Vite for blazing-fast development
- Tailwind CSS v4 for styling
- shadcn/ui component library (v4)

**State Management:**
- React Hooks (useState, useEffect, useContext)
- Spark KV Store for persistent data
- Context API for authentication

**Data Visualization:**
- Recharts for interactive charts
- Custom KPI cards with trend indicators
- Responsive data tables

**UI Components:**
- 40+ pre-installed shadcn components
- Phosphor Icons for consistent iconography
- Sonner for toast notifications
- Framer Motion for smooth animations

### Project Structure

```
src/
├── components/
│   ├── ui/                    # shadcn UI components (40+ components)
│   ├── views/                 # Main application views
│   │   ├── inventory-view.tsx
│   │   ├── orders-view.tsx
│   │   ├── vendors-view.tsx
│   │   └── analytics-view.tsx
│   ├── header.tsx             # App header with location selector
│   ├── sidebar.tsx            # Navigation sidebar
│   ├── login-page.tsx         # Authentication interface
│   └── kpi-card.tsx          # Reusable KPI display component
├── lib/
│   ├── types.ts              # TypeScript type definitions
│   ├── permissions.ts        # Role-based permission logic
│   ├── analytics.ts          # ML algorithms and analytics functions
│   ├── auth-context.tsx      # Authentication context provider
│   └── utils.ts              # Utility functions
├── App.tsx                   # Main application component
├── index.css                 # Theme and global styles
└── main.tsx                  # Application entry point
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone or access the project**
   ```bash
   cd /workspaces/spark-template
   ```

2. **Install dependencies** (if not already installed)
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to the URL shown in terminal (typically `http://localhost:5173`)

## 👤 Demo Accounts

The application comes with 5 pre-configured demo accounts demonstrating different permission levels:

| Role | Username | Password | Capabilities |
|------|----------|----------|-------------|
| **Owner** | `owner` | any | Full system access, all features |
| **Admin** | `admin` | any | Approve orders, manage users, view all locations |
| **Regional Manager** | `regional` | any | Multi-location oversight, approve orders |
| **Manager** | `manager` | any | Location management, approve orders |
| **Staff** | `staff` | any | Update inventory, create orders |

*Note: Any password works for demo purposes*

## 📊 Data Model

### Key Entities

**User**
- ID, username, name, role, email
- Location assignment
- Role-based permissions

**Location**
- ID, name, address, city, state
- Manager assignment

**Inventory Item**
- ID, name, category, stock levels
- Cost tracking, reorder points
- Expiration dates, FIFO tracking
- Location assignment

**Vendor**
- ID, name, contact information
- Rating, delivery time averages
- Categories, payment terms

**Purchase Order**
- Order number, vendor, location
- Line items with quantities and pricing
- Status workflow tracking
- Approval chain documentation

**Sales Data**
- Date, item, quantity sold, revenue
- Location tracking
- Historical trend data

**Waste Data**
- Date, item, quantity, reason
- Cost impact calculation
- Pattern analysis data

## 🔐 Permission Matrix

| Feature | Staff | Manager | Regional | Admin | Owner |
|---------|-------|---------|----------|-------|-------|
| View Inventory | ✅ | ✅ | ✅ | ✅ | ✅ |
| Edit Inventory | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create Orders | ✅ | ✅ | ✅ | ✅ | ✅ |
| Approve Orders | ❌ | ✅ | ✅ | ✅ | ✅ |
| Edit Vendors | ❌ | ✅ | ✅ | ✅ | ✅ |
| View Analytics | ❌ | ✅ | ✅ | ✅ | ✅ |
| Multi-Location | ❌ | ❌ | ✅ | ✅ | ✅ |
| Manage Users | ❌ | ❌ | ❌ | ✅ | ✅ |

## 🧪 Sample Data

The application includes comprehensive seed data:

- **3 Locations**: Downtown Restaurant, Marina District, Mission Branch
- **5 Users**: One for each role level
- **12 Inventory Items**: Across categories (Produce, Meat, Dairy, Seafood, Dry Goods)
- **4 Vendors**: With varying ratings and delivery times
- **5 Purchase Orders**: In different approval states
- **21 Sales Records**: 7 days of data for 3 items
- **5 Waste Records**: Various reasons demonstrating analytics
- **5 Active Alerts**: Low stock, expiration, and approval requests

## 📈 Analytics & Machine Learning

### Demand Forecasting Algorithm

The system implements linear regression for demand prediction:

```typescript
y = mx + b
where:
  y = predicted quantity
  x = time period
  m = slope (trend)
  b = intercept (baseline)
```

**Confidence Score**: R² (coefficient of determination) shows prediction accuracy
**Trend Detection**: Identifies increasing, decreasing, or stable demand patterns

### Waste Analysis

Aggregates waste data by reason:
- Expiration (date-based spoilage)
- Spoilage (quality degradation)
- Damage (physical issues)
- Overproduction (excess preparation)

Calculates:
- Total cost impact by reason
- Percentage distribution
- Trending patterns over time

### Inventory Optimization

**Reorder Point Calculation**:
```
Reorder Point = (Avg Daily Sales × Lead Time) + Safety Stock
```

**Economic Order Quantity (EOQ)**:
```
EOQ = √((2 × Annual Demand × Order Cost) / Holding Cost per Unit)
```

## 🎨 Design System

### Color Palette

The application uses a triadic color scheme with carefully selected OKLCH values:

- **Primary (Deep Teal)**: `oklch(0.45 0.12 210)` - Stability, inventory features
- **Secondary (Warm Coral)**: `oklch(0.65 0.15 25)` - Vendor/ordering
- **Accent (Energetic Amber)**: `oklch(0.70 0.15 75)` - Alerts, CTAs
- **Analytics Purple**: `oklch(0.50 0.13 290)` - Insights, reports

All color pairings meet WCAG AA accessibility standards (4.5:1 contrast minimum).

### Typography

**Font**: Inter - optimized for UI legibility
- H1: 32px SemiBold, tight tracking
- H2: 24px SemiBold, tight tracking
- H3: 18px Medium
- Body: 14px Regular, relaxed line-height
- Small: 12px Regular

### Spacing System

Consistent Tailwind spacing scale:
- Layout gutters: `gap-6` (24px)
- Card padding: `p-6` (24px)
- Form fields: `space-y-4` (16px)
- Table cells: `px-4 py-3`

## 🔄 Workflow Examples

### Creating a Purchase Order

1. Staff member navigates to **Purchase Orders**
2. Clicks **Create Order**
3. Selects vendor from dropdown
4. Adds inventory items with quantities and prices
4. Reviews total (subtotal + 8% tax)
5. Submits order → Status: **Pending Manager**
6. Manager reviews and approves → Status: **Pending Admin**
7. Admin final approval → Status: **Approved**
8. Order placed with vendor → Status: **Ordered**
9. Delivery received → Status: **Delivered**

### Inventory Alert Flow

1. System checks stock levels every time inventory updates
2. When `currentStock <= reorderPoint`:
   - Alert created with severity (warning/critical)
   - Notification appears in header badge
   - Alert listed in alerts section
3. Staff/Manager creates purchase order for item
4. After order approved and delivered, stock replenished
   - Alert auto-resolves when stock above reorder point

## 📱 Responsive Design

**Desktop (1024px+)**:
- Three-column layout: Sidebar | Main Content | Info Panel
- Full tables with all columns visible
- Side-by-side charts and KPIs

**Tablet (768px - 1023px)**:
- Two-column: Collapsible Sidebar | Main Content
- Horizontal scroll on wide tables
- Stacked charts

**Mobile (<768px)**:
- Single column layout
- Hamburger menu for navigation
- Bottom tab bar for main sections
- Card-based views replace tables
- Simplified charts with drill-down

## 🔧 Customization

### Adding a New User

Edit the KV store data for `users` key:

```typescript
{
  id: "user-new",
  username: "newuser",
  name: "New User",
  role: "staff", // or manager, regional_manager, admin, owner
  locationId: "loc-1",
  email: "newuser@restaurant.com"
}
```

### Adding a New Location

Edit the KV store data for `locations` key:

```typescript
{
  id: "loc-new",
  name: "New Location Name",
  address: "123 Street",
  city: "City",
  state: "ST",
  managerId: "user-id"
}
```

### Modifying Permissions

Edit `src/lib/permissions.ts` and adjust the `getRolePermissions` function to change what each role can access.

## 💬 Intercom Setup & Configuration

### Prerequisites

1. **Create Intercom Account**:
   - Sign up at https://www.intercom.com
   - Create a workspace for "Dobeu Tech Solutions" (or your company name)
   - Navigate to Settings → Installation → Web

2. **Get Your Intercom App ID**:
   - In Intercom dashboard: Settings → Installation → Web
   - Copy your App ID (format: `abc12345`)

### Environment Configuration

1. **Create `.env` file** in project root (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

2. **Add your Intercom App ID**:
   ```env
   VITE_INTERCOM_APP_ID=your_intercom_app_id_here
   ```

3. **Restart development server** to load new environment variables:
   ```bash
   npm run dev
   ```

### Intercom Dashboard Configuration

#### 1. Business Hours Setup

Navigate to **Settings → Messenger → Office Hours**:

- **Business Hours**: Monday-Friday, 9 AM - 6 PM ET
  - Enable "Show office hours to customers"
  - Set expected response time: "Within 5 minutes"
  
- **Off Hours**: Evenings, weekends
  - Enable "Show automated responses during off hours"
  - Set up custom away message

#### 2. FIN AI Chatbot Configuration

Navigate to **Settings → Fin AI Agent**:

1. **Enable FIN**: Turn on FIN AI agent
2. **Train FIN with Knowledge Base**:
   - Import help articles and documentation
   - Add FAQs for common questions:
     - How to log waste quickly?
     - How to create purchase orders?
     - How to manage vendors?
     - How to view analytics?
     - Billing and subscription questions
     - Troubleshooting common issues

3. **Set FIN Behavior**:
   - **Visitor Mode**: Focus on product education and sales
     - "Hi! Interested in reducing food waste? Ask me anything!"
   - **Member Mode**: Focus on support and help
     - "I see you're on the Analytics page. Need help?"
   
4. **Escalation Rules**:
   - Escalate to live agent when FIN confidence < 70%
   - Escalate immediately for billing/payment issues
   - Escalate for feature requests to product team

#### 3. User Segmentation

Navigate to **Settings → People → Segments**:

Create segments for targeted messaging:

- **Visitors**: `user_id is unknown`
  - Use for sales and lead generation
  
- **Operators**: `role is operator`
  - Focus on waste logging help
  
- **Managers**: `role is manager`
  - Focus on analytics and vendor management
  
- **Admins**: `role is admin`
  - Focus on advanced features and reporting

#### 4. Proactive Messages

Navigate to **Messages → New Message → In-app**:

**Onboarding Series** (triggered on first login):
1. Day 1: "Welcome! Let me show you how to log waste in under 30 seconds"
2. Day 3: "Have you tried the analytics dashboard yet?"
3. Day 7: "You're doing great! Here are some advanced features..."

**Feature Adoption** (triggered by usage patterns):
- "I noticed you haven't tried community pricing yet. It can save you thousands!"
- "Your waste logs are excellent. Want to see trend analysis?"

**Churn Prevention** (triggered by inactivity):
- "Your usage is down this week - everything OK? I'm here to help!"

**Upsell Opportunities** (triggered by plan limits):
- "You're using 95% of your plan limits. Consider upgrading for unlimited access."

#### 5. Conversation Routing Rules

Navigate to **Settings → Inbox → Assignment Rules**:

1. **Sales Inquiries** (from visitors):
   - Tag: `sales`
   - Route to: Sales team
   - SLA: Response within 1 hour

2. **Technical Support** (from members):
   - Tag: `technical`
   - Route to: Support team
   - SLA: Response within 5 minutes (business hours)

3. **Billing Questions**:
   - Tag: `billing`
   - Route to: Finance team
   - SLA: Response within 2 hours

4. **Feature Requests**:
   - Tag: `feature-request`
   - Route to: Product team
   - SLA: Response within 24 hours

### Event Tracking Reference

The application automatically tracks these events for proactive support:

| Event Name | Triggered When | Metadata Sent |
|-----------|---------------|---------------|
| `page-visit` | User navigates to any page | `page_name`, `role` |
| `feature-used` | User uses a specific feature | `feature_name`, custom metadata |
| `waste-logged` | User logs waste | `category`, `amount`, `timestamp` |
| `vendor-action` | User creates/updates/deletes vendor | `action`, `vendor_id` |
| `purchase-order` | User creates/manages purchase order | `action`, `order_id`, `total` |

**Use these events for:**
- Creating custom segments in Intercom
- Triggering proactive messages
- Building usage reports
- Identifying power users and struggling users

### Custom Implementation

#### Adding Event Tracking to New Pages

```typescript
import { useIntercomMessaging } from '@/lib/intercom';

function YourNewPage() {
  const { trackPageVisit, trackFeatureUsage } = useIntercomMessaging();

  useEffect(() => {
    trackPageVisit('Your Page Name');
  }, [trackPageVisit]);

  const handleFeatureUse = () => {
    trackFeatureUsage('feature-name', { custom: 'metadata' });
  };

  return <div>Your page content</div>;
}
```

#### Programmatically Opening Support Chat

```typescript
import { useIntercom } from '@/lib/intercom';

function YourComponent() {
  const { show } = useIntercom();

  return (
    <button onClick={show}>
      Get Help
    </button>
  );
}
```

#### Using the Help Button Component

```typescript
import { IntercomHelpButton } from '@/components/IntercomHelpButton';

// Floating button (default)
<IntercomHelpButton variant="floating" />

// Inline button
<IntercomHelpButton variant="default" text="Need Help?" />

// Outline button
<IntercomHelpButton variant="outline" text="Contact Support" />

// Ghost button
<IntercomHelpButton variant="ghost" text="Ask a Question" />
```

### Analytics & Reporting

In Intercom Dashboard → Reports:

**Track these metrics:**
- **FIN Resolution Rate**: % of conversations resolved by FIN without human intervention
  - Target: >70% for common questions
  
- **Response Time**: Average time to first response
  - Target: <5 minutes during business hours
  
- **Customer Satisfaction (CSAT)**: Post-conversation surveys
  - Target: >90% satisfaction rate
  
- **Most Common Questions**: Identify documentation gaps
  - Use to improve knowledge base and UI
  
- **Peak Support Hours**: When do most conversations happen?
  - Use to optimize staffing

**Create Custom Reports:**
1. Conversations by user role (operator/manager/admin)
2. Feature usage trends from event tracking
3. Time to resolution by issue type
4. Conversion rate: visitor → trial signup

### SMS Support (Optional)

While Intercom can send SMS, **SMS** (???)...

**Intercom SMS Use Cases:**
- Support message notifications
- Important updates and announcements
- Marketing campaigns (with opt-in)

**Twilio SMS Use Cases (recommended):**
- Authentication codes
- Password resets
- Critical system alerts

### Best Practices

1. **Keep Knowledge Base Updated**:
   - Add new articles when users ask repeated questions
   - Update articles when features change
   - Include screenshots and step-by-step guides

2. **Monitor FIN Performance**:
   - Review conversations FIN couldn't handle
   - Train FIN with correct answers
   - Adjust confidence thresholds

3. **Use Tags Consistently**:
   - Create standard tag taxonomy
   - Train support team on proper tagging
   - Use tags for reporting and routing

4. **Respond Promptly**:
   - Set realistic SLAs and meet them
   - Use saved replies for common questions
   - Escalate complex issues quickly

5. **Collect Feedback**:
   - Enable CSAT surveys after conversations
   - Review negative feedback weekly
   - Act on feedback to improve product

## 🐛 Troubleshooting

**Issue**: Permissions not working correctly
- **Solution**: Logout and login again to refresh permissions. Check user role in localStorage.

**Issue**: Intercom widget not appearing
- **Solution**: 
  1. Check that `VITE_INTERCOM_APP_ID` is set in `.env` file
  2. Restart development server after adding environment variable
  3. Check browser console for errors
  4. Verify App ID is correct in Intercom dashboard (Settings → Installation → Web)

**Issue**: Intercom showing "YOUR_INTERCOM_APP_ID" error
- **Solution**: 
  1. Create `.env` file in project root
  2. Add `VITE_INTERCOM_APP_ID=your_actual_app_id`
  3. Replace `your_actual_app_id` with your real Intercom App ID
  4. Restart development server: `npm run dev`

**Issue**: User data not showing in Intercom conversations
- **Solution**:
  1. Ensure user is logged in (check Supabase auth)
  2. Verify user profile data exists in database
  3. Check browser console for Intercom boot errors
  4. Refresh page after login

**Issue**: Events not tracking in Intercom
- **Solution**:
  1. Open browser console and check for `window.Intercom` availability
  2. Verify Intercom script loaded successfully (Network tab)
  3. Check that you're calling track methods after Intercom boots
  4. View Intercom Dashboard → Settings → Event Logs to confirm events

**Issue**: FIN not responding correctly
- **Solution**:
  1. Train FIN with more knowledge base articles
  2. Check FIN configuration in Intercom dashboard
  3. Review conversation logs to see what FIN couldn't answer
  4. Ensure knowledge base articles are published and indexed

## 🚀 Future Enhancements

## 📝 License

This is a demonstration project created for educational and prototyping purposes.

## 🤝 Support

For questions or issues:
1. Check the troubleshooting section above
2. Review the PRD.md for detailed specifications
3. Examine the inline code comments
4. Test with different user roles to understand permissions

---

**Built with ❤️ using React, TypeScript, and Modern Web Technologies**