import { SavePlateLogo } from '../SavePlateLogo';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
  actions?: React.ReactNode;
  className?: string;
}

/**
 * SavePlate Hero Section Component
 * Use this for marketing pages, landing sections, or feature intros
 */
export function HeroSection({
  title = 'Save Food. Save Money. Save the Planet.',
  subtitle = 'Track waste in under 30 seconds and save $30K-$80K annually',
  showLogo = true,
  actions,
  className
}: HeroSectionProps) {
  return (
    <section className={cn(
      'relative overflow-hidden bg-gradient-to-br from-background via-background to-muted',
      'py-20 px-4',
      className
    )}>
      <div className="max-w-4xl mx-auto text-center space-y-8">
        {/* Logo */}
        {showLogo && (
          <div className="flex justify-center animate-fade-in">
            <SavePlateLogo variant="full" size="xl" />
          </div>
        )}

        {/* Title */}
        <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight animate-fade-in-up">
          <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            {title}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto animate-fade-in-up">
          {subtitle}
        </p>

        {/* Actions */}
        {actions && (
          <div className="flex flex-wrap gap-4 justify-center animate-fade-in-up">
            {actions}
          </div>
        )}

        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        </div>
      </div>
    </section>
  );
}

/**
 * Default Hero with CTA buttons
 */
export function DefaultHero() {
  return (
    <HeroSection
      actions={
        <>
          <Button size="lg" className="shadow-elegant">
            Get Started
          </Button>
          <Button size="lg" variant="outline">
            Learn More
          </Button>
        </>
      }
    />
  );
}
