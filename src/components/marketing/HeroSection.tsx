import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-muted/30 to-background py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <div className="space-y-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Restaurant Owners: Stop Losing{' '}
              <span className="bg-gradient-to-r from-destructive to-destructive/70 bg-clip-text text-transparent">
                $30K-$80K Annually
              </span>{' '}
              to Food Waste & Vendor Overcharges
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground">
              SavePlate helps multi-location restaurants save money, reduce waste, 
              and give back to their community - all in one platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="text-lg h-14 px-8 bg-gradient-to-r from-primary to-primary-glow hover:shadow-glow"
              >
                Start 14-Day Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg h-14 px-8"
              >
                <Calendar className="mr-2 h-5 w-5" />
                Book a Demo
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="text-primary">✓</span>
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <span className="text-primary">✓</span>
                14-day free trial
              </div>
              <div className="flex items-center gap-2">
                <span className="text-primary">✓</span>
                Cancel anytime
              </div>
            </div>
          </div>
          
          {/* Right: Visual */}
          <div className="relative">
            <div className="rounded-2xl border-2 border-primary/20 bg-card p-8 shadow-elegant">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Annual Savings</span>
                  <span className="text-xs text-primary">This Year</span>
                </div>
                <div className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  $47,000
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Waste Reduction</span>
                    <span className="font-semibold">$28,000</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Better Vendor Pricing</span>
                    <span className="font-semibold">$16,000</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax Deductions</span>
                    <span className="font-semibold">$3,000</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative glow */}
            <div className="absolute -top-4 -right-4 w-72 h-72 bg-primary/20 rounded-full blur-3xl -z-10" />
            <div className="absolute -bottom-4 -left-4 w-72 h-72 bg-accent/20 rounded-full blur-3xl -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
}
