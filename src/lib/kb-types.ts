/**
 * Knowledge Base Type Definitions
 */

export interface KBArticle {
  id: string;
  category: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  video_url?: string;
  helpful_count: number;
  not_helpful_count: number;
  views: number;
  search_keywords: string[];
  related_articles: string[];
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface KBFeedback {
  id: string;
  article_id: string;
  user_id: string;
  helpful: boolean;
  feedback_text?: string;
  created_at: string;
}

export interface KBCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  articleCount?: number;
}

export const KB_CATEGORIES: KBCategory[] = [
  {
    id: 'getting-started',
    name: 'Getting Started',
    icon: 'Rocket',
    description: 'Quick start guides and platform introduction'
  },
  {
    id: 'waste-tracking',
    name: 'Waste Tracking',
    icon: 'Trash2',
    description: 'Learn how to log and analyze food waste'
  },
  {
    id: 'vendor-management',
    name: 'Vendor Management',
    icon: 'Users',
    description: 'Managing vendors and purchase orders'
  },
  {
    id: 'inventory-management',
    name: 'Inventory Management',
    icon: 'Package',
    description: 'Track inventory and set par levels'
  },
  {
    id: 'analytics-insights',
    name: 'Analytics & Insights',
    icon: 'BarChart3',
    description: 'Understanding your data and reports'
  },
  {
    id: 'integrations',
    name: 'Integrations',
    icon: 'Plug',
    description: 'Connect with POS and other systems'
  },
  {
    id: 'alerts-notifications',
    name: 'Alerts & Notifications',
    icon: 'Bell',
    description: 'Configure alerts and notifications'
  },
  {
    id: 'esg-tax',
    name: 'ESG & Tax Benefits',
    icon: 'Leaf',
    description: 'Generate reports and claim deductions'
  },
  {
    id: 'billing-subscription',
    name: 'Billing & Subscription',
    icon: 'CreditCard',
    description: 'Manage your account and payments'
  },
  {
    id: 'troubleshooting',
    name: 'Troubleshooting',
    icon: 'AlertCircle',
    description: 'Common issues and solutions'
  },
  {
    id: 'best-practices',
    name: 'Best Practices',
    icon: 'Award',
    description: 'Tips for maximizing platform value'
  },
  {
    id: 'security-privacy',
    name: 'Security & Privacy',
    icon: 'Shield',
    description: 'Data protection and security features'
  }
];
