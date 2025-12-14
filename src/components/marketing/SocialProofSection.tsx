import { Card, CardContent } from '@/components/ui/card';
import { Quote } from 'lucide-react';

export function SocialProofSection() {
  const testimonials = [
    {
      quote: "SavePlate helped us cut food waste by 40% in 3 months. That's $18,000 back in our pocket.",
      author: "Demo Restaurant Owner",
      company: "Coastal Eats Restaurant Group",
    },
    {
      quote: "The community pricing feature alone paid for itself. We were overpaying for chicken by 12%!",
      author: "Demo Owner",
      company: "Multi-location operator",
    },
    {
      quote: "Finally, I can see what's happening at all my locations without calling managers every day.",
      author: "Demo Owner",
      company: "8-location chain",
    },
  ];
  
  return (
    <section className="py-20 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Trusted by Restaurant Owners Like You
          </h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-2 hover:shadow-card transition-all">
              <CardContent className="pt-6">
                <Quote className="h-8 w-8 text-primary mb-4" />
                <p className="text-lg mb-6 leading-relaxed">
                  "{testimonial.quote}"
                </p>
                <div className="border-t pt-4">
                  <p className="font-semibold">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.company}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4">Trusted by restaurant groups including:</p>
          <div className="flex flex-wrap justify-center gap-8 items-center">
            <div className="px-6 py-3 rounded-lg bg-card border">
              <span className="font-semibold text-lg">Coastal Eats</span>
            </div>
            <div className="px-6 py-3 rounded-lg bg-card border">
              <span className="font-semibold text-lg">Demo Restaurant Co.</span>
            </div>
            <div className="px-6 py-3 rounded-lg bg-card border">
              <span className="font-semibold text-lg">Sample Bistro Group</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
