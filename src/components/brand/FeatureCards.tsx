import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { cn } from '@/lib/utils';
import { Leaf, DollarSign, TrendingDown, BarChart3, Users, Shield } from 'lucide-react';

interface Feature {
  title: string;
  description: string;
  icon?: React.ReactNode;
  iconColor?: 'primary' | 'secondary' | 'accent';
}

interface FeatureCardsProps {
  features?: Feature[];
  columns?: 2 | 3 | 4;
  className?: string;
}

/**
 * SavePlate Feature Cards Component
 * Displays key features with icons in a grid layout
 */
export function FeatureCards({
  features = DEFAULT_FEATURES,
  columns = 3,
  className
}: FeatureCardsProps) {
  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4'
  };

  return (
    <div className={cn('grid gap-6', gridCols[columns], className)}>
      {features.map((feature, index) => (
        <Card
          key={index}
          className="shadow-elegant hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
        >
          <CardHeader>
            {feature.icon && (
              <div className={cn(
                'w-12 h-12 rounded-lg flex items-center justify-center mb-3',
                feature.iconColor === 'primary' && 'bg-primary/10 text-primary',
                feature.iconColor === 'secondary' && 'bg-secondary/10 text-secondary',
                feature.iconColor === 'accent' && 'bg-accent/10 text-accent',
                !feature.iconColor && 'bg-primary/10 text-primary'
              )}>
                {feature.icon}
              </div>
            )}
            <CardTitle className="text-lg">{feature.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{feature.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * Default SavePlate Features
 */
const DEFAULT_FEATURES: Feature[] = [
  {
    title: 'Reduce Waste',
    description: 'Track and analyze food waste in under 30 seconds with our mobile-first platform',
    icon: <Leaf className="w-6 h-6" />,
    iconColor: 'primary'
  },
  {
    title: 'Save Money',
    description: 'Achieve $30K-$80K annual savings through intelligent waste reduction and vendor optimization',
    icon: <DollarSign className="w-6 h-6" />,
    iconColor: 'secondary'
  },
  {
    title: 'Save Planet',
    description: 'Contribute to sustainability goals with comprehensive ESG reporting and impact tracking',
    icon: <TrendingDown className="w-6 h-6" />,
    iconColor: 'accent'
  },
  {
    title: 'Smart Analytics',
    description: 'ML-powered insights predict waste patterns and optimize inventory management',
    icon: <BarChart3 className="w-6 h-6" />,
    iconColor: 'primary'
  },
  {
    title: 'Vendor Intelligence',
    description: 'Anonymous community pricing data helps you negotiate better deals and reduce costs',
    icon: <Users className="w-6 h-6" />,
    iconColor: 'accent'
  },
  {
    title: 'Enterprise Ready',
    description: 'Secure, scalable platform with role-based access and multi-location support',
    icon: <Shield className="w-6 h-6" />,
    iconColor: 'secondary'
  }
];

/**
 * ROI-Focused Features
 */
export function ROIFeatures() {
  const roiFeatures: Feature[] = [
    {
      title: '$30K-$80K Savings',
      description: 'Average annual cost reduction per location',
      icon: <DollarSign className="w-6 h-6" />,
      iconColor: 'secondary'
    },
    {
      title: '30-Second Logging',
      description: 'Fastest waste tracking in the industry',
      icon: <TrendingDown className="w-6 h-6" />,
      iconColor: 'primary'
    },
    {
      title: 'Real-Time Insights',
      description: 'Actionable analytics, not just reports',
      icon: <BarChart3 className="w-6 h-6" />,
      iconColor: 'accent'
    }
  ];

  return <FeatureCards features={roiFeatures} columns={3} />;
}
