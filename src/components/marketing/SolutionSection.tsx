import { Clock, TrendingUp, Brain, RefreshCw, Heart, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function SolutionSection() {
  const features = [
    {
      icon: Clock,
      title: '30-Second Waste Tracking',
      description: 'Log waste in under 30 seconds. AI categorizes it. You see where money\'s leaking.',
      badge: null,
    },
    {
      icon: TrendingUp,
      title: 'Community Pricing Intelligence',
      description: 'Are you overpaying? Compare your prices to market average anonymously. Save $10K-$30K/year.',
      badge: '🔥',
    },
    {
      icon: Brain,
      title: 'ML Spend Predictions',
      description: 'Know what you\'ll spend next Tuesday. Plan better. Order smarter. 94% accuracy.',
      badge: null,
    },
    {
      icon: RefreshCw,
      title: 'Automated POS Integration',
      description: 'Connect Square, Toast, or Clover. Automatically reconcile sales vs inventory every night.',
      badge: null,
    },
    {
      icon: Heart,
      title: 'Tax Benefits + Donations',
      description: 'Find nearby food banks. Log donations. Get tax write-offs. Feed your community.',
      badge: null,
    },
    {
      icon: Building2,
      title: 'Multi-Location Analytics',
      description: '3 locations or 30? See everything in one dashboard. Identify best practices. Share wins.',
      badge: null,
    },
  ];

  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            One Platform. Complete Visibility.{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Real Savings.
            </span>
          </h2>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="border hover:border-primary/50 transition-all duration-300 hover:shadow-card">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    {feature.badge && (
                      <Badge variant="secondary" className="text-base">
                        {feature.badge}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
