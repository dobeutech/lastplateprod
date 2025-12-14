import { Card } from '@/components/ui/card';
import { Heart, TrendingDown } from 'lucide-react';

export function AltruismSection() {
  const stats = [
    {
      icon: Heart,
      value: '12,000 lbs',
      label: 'Food donated last month',
    },
    {
      icon: TrendingDown,
      value: '4.8 tons',
      label: 'CO₂ emissions prevented',
    },
  ];
  
  const benefits = [
    'Reduce landfill waste',
    'Donate excess food to local nonprofits',
    'Lower your carbon footprint',
    'Support your community',
    'Get tax deductions for it',
  ];
  
  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            It's Not Just About Dollars.{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              It's About Doing Good.
            </span>
          </h2>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <div className="space-y-6">
            <p className="text-lg text-muted-foreground leading-relaxed">
              Every year, restaurants waste 22-33 billion pounds of food while 1 in 8 Americans 
              face food insecurity. SavePlate helps you:
            </p>
            
            <ul className="space-y-3">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary text-sm">✓</span>
                  </span>
                  <span className="text-lg">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Right: Stats */}
          <div className="space-y-6">
            <div className="relative">
              <div className="w-full aspect-square max-w-md mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center p-8">
                <div className="text-center">
                  <Heart className="h-24 w-24 text-primary mx-auto mb-4" />
                  <p className="text-2xl font-bold">Making a Difference</p>
                  <p className="text-muted-foreground mt-2">Together</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card key={index} className="p-6 text-center border-2 hover:border-primary/50 transition-all">
                    <Icon className="h-8 w-8 text-primary mx-auto mb-3" />
                    <p className="text-2xl font-bold mb-1">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}