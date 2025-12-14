import { Button } from '@/components/ui/button';
import { ArrowRight, Check } from 'lucide-react';

export function FinalCTASection() {
  const trustSignals = [
    'No credit card required',
    '14-day free trial',
    'Cancel anytime',
    'Free onboarding support',
    'SOC 2 compliant',
  ];
  
  return (
    <section className="py-20 md:py-32 bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            Ready to Save Money and Make a Difference?
          </h2>
          
          <p className="text-xl md:text-2xl text-muted-foreground">
            Join hundreds of restaurants already using SavePlate. No credit card required.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="text-lg h-16 px-12 bg-gradient-to-r from-primary to-accent hover:shadow-glow"
            >
              Start Your Free 14-Day Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
          
          <div className="grid sm:grid-cols-2 md:grid-cols-5 gap-4 pt-8">
            {trustSignals.map((signal, index) => (
              <div key={index} className="flex items-center justify-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-muted-foreground">{signal}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
