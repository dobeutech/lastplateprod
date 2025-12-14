import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ArrowRight, DollarSign } from 'lucide-react';

export function ROICalculator() {
  const [locations, setLocations] = useState<string>('2-5');
  
  const calculateSavings = () => {
    const baseWaste = 26000;
    const baseVendor = 16000;
    const baseTax = 2800;
    
    let multiplier = 1;
    switch (locations) {
      case '1':
        multiplier = 0.4;
        break;
      case '2-5':
        multiplier = 1;
        break;
      case '6-10':
        multiplier = 2.5;
        break;
      case '11+':
        multiplier = 5;
        break;
    }
    
    return {
      waste: Math.round(baseWaste * multiplier),
      vendor: Math.round(baseVendor * multiplier),
      tax: Math.round(baseTax * multiplier),
    };
  };
  
  const savings = calculateSavings();
  const total = savings.waste + savings.vendor + savings.tax;
  
  return (
    <section className="py-20 md:py-32 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            This Isn't a "Nice to Have." It's a Money Maker.
          </h2>
        </div>
        
        <Card className="max-w-2xl mx-auto border-2 shadow-elegant">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Calculate Your Savings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div>
              <label className="block text-sm font-semibold mb-3">
                How many locations do you operate?
              </label>
              <Select value={locations} onValueChange={setLocations}>
                <SelectTrigger className="h-14 text-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 location</SelectItem>
                  <SelectItem value="2-5">2-5 locations</SelectItem>
                  <SelectItem value="6-10">6-10 locations</SelectItem>
                  <SelectItem value="11+">11+ locations</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-4 p-6 rounded-xl bg-muted/50">
              <p className="text-lg font-semibold text-center mb-6">
                Your Estimated Annual Savings:
              </p>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 rounded-lg bg-background">
                  <span className="text-muted-foreground">💰 Waste Reduction:</span>
                  <span className="text-xl font-bold text-primary">
                    ${savings.waste.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 rounded-lg bg-background">
                  <span className="text-muted-foreground">💰 Better Vendor Pricing:</span>
                  <span className="text-xl font-bold text-primary">
                    ${savings.vendor.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 rounded-lg bg-background">
                  <span className="text-muted-foreground">💰 Tax Deductions:</span>
                  <span className="text-xl font-bold text-primary">
                    ${savings.tax.toLocaleString()}
                  </span>
                </div>
                
                <div className="border-t-2 border-border pt-3 mt-3">
                  <div className="flex justify-between items-center p-4 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10">
                    <span className="text-lg font-bold">🎯 Total Annual Savings:</span>
                    <span className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      ${total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <Button className="w-full h-14 text-lg bg-gradient-to-r from-primary to-accent hover:shadow-glow">
              <DollarSign className="mr-2 h-5 w-5" />
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
