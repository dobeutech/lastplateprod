import { Trash2, HelpCircle, FileSpreadsheet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function PainPointsSection() {
  const painPoints = [
    {
      icon: Trash2,
      title: 'Waste Eating Your Margins',
      description: 'The average restaurant wastes 4-11% of food purchased. That\'s $200-$300 per week per location going straight into the trash.',
      color: 'destructive',
    },
    {
      icon: HelpCircle,
      title: 'Vendor Pricing Mystery',
      description: 'Are you paying too much? Without market data, you have no idea if Sysco just raised prices 15% or if you\'re getting a fair deal.',
      color: 'secondary',
    },
    {
      icon: FileSpreadsheet,
      title: 'Spreadsheet Chaos',
      description: 'Managing inventory, vendors, and costs across multiple locations with spreadsheets? There\'s a better way.',
      color: 'accent',
    },
  ];

  return (
    <section className="py-20 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            We Get It. Running a Restaurant is Hard Enough.
          </h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {painPoints.map((point, index) => {
            const Icon = point.icon;
            return (
              <Card key={index} className="border-2 hover:shadow-elegant transition-all duration-300">
                <CardHeader>
                  <div className={`w-16 h-16 rounded-xl bg-${point.color}/10 flex items-center justify-center mb-4`}>
                    <Icon className={`h-8 w-8 text-${point.color}`} />
                  </div>
                  <CardTitle className="text-2xl">{point.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    {point.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
