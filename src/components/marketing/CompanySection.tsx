import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Smartphone, Users, Zap, ArrowRight } from 'lucide-react';

export function CompanySection() {
  const roadmapItems = [
    {
      quarter: 'Q1 2026',
      icon: Smartphone,
      title: 'Mobile App',
      description: 'iOS & Android apps for on-the-go waste logging',
    },
    {
      quarter: 'Q2 2026',
      icon: Users,
      title: 'Labor Cost Optimization',
      description: 'AI-powered labor scheduling and cost management',
    },
    {
      quarter: 'Q3 2026',
      icon: Zap,
      title: 'Menu Engineering AI',
      description: 'Data-driven menu optimization for maximum profitability',
    },
  ];
  
  return (
    <section className="py-20 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Built by People Who Care
          </h2>
        </div>
        
        <div className="max-w-3xl mx-auto mb-16">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-2xl">Our Mission</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg text-muted-foreground leading-relaxed">
                SavePlate was founded after seeing firsthand how much good food goes to waste 
                while communities struggle with hunger. We're on a mission to make restaurant 
                operations more profitable AND more sustainable.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Our platform combines cutting-edge ML technology with a deep understanding of 
                restaurant operations to deliver real, measurable savings while making a positive 
                impact on communities.
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-center mb-8">Product Roadmap</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {roadmapItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <Card key={index} className="border hover:border-primary/50 transition-all">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <span className="text-sm font-semibold text-primary">{item.quarter}</span>
                    </div>
                    <CardTitle className="text-xl">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
        
        <div className="text-center">
          <Button variant="outline" size="lg" className="gap-2">
            View Full Roadmap
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
