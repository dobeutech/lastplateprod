import { SavePlateLogo } from './SavePlateLogo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

/**
 * SavePlate Brand Showcase
 * Demonstrates the brand identity elements and design system
 * Use this as a reference for maintaining brand consistency
 */
export function BrandShowcase() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <SavePlateLogo variant="full" size="xl" />
          <h1 className="text-4xl font-bold text-foreground">SavePlate Brand Guidelines</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Save Food. Save Money. Save the Planet.
          </p>
        </div>

        {/* Logo Variations */}
        <Card>
          <CardHeader>
            <CardTitle>Logo Variations</CardTitle>
            <CardDescription>Available logo formats for different use cases</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Full Logo */}
            <div className="space-y-3">
              <h3 className="font-semibold">Full Logo</h3>
              <div className="flex flex-wrap gap-6 items-center p-6 bg-muted rounded-lg">
                <SavePlateLogo variant="full" size="sm" />
                <SavePlateLogo variant="full" size="md" />
                <SavePlateLogo variant="full" size="lg" />
                <SavePlateLogo variant="full" size="xl" />
              </div>
            </div>

            {/* Icon Only */}
            <div className="space-y-3">
              <h3 className="font-semibold">Icon Only</h3>
              <div className="flex flex-wrap gap-6 items-center p-6 bg-muted rounded-lg">
                <SavePlateLogo variant="icon" size="sm" />
                <SavePlateLogo variant="icon" size="md" />
                <SavePlateLogo variant="icon" size="lg" />
                <SavePlateLogo variant="icon" size="xl" />
              </div>
            </div>

            {/* Wordmark Only */}
            <div className="space-y-3">
              <h3 className="font-semibold">Wordmark Only</h3>
              <div className="flex flex-wrap gap-6 items-center p-6 bg-muted rounded-lg">
                <SavePlateLogo variant="wordmark" size="sm" />
                <SavePlateLogo variant="wordmark" size="md" />
                <SavePlateLogo variant="wordmark" size="lg" />
                <SavePlateLogo variant="wordmark" size="xl" />
              </div>
            </div>

            {/* Dark Background */}
            <div className="space-y-3">
              <h3 className="font-semibold">On Dark Background</h3>
              <div className="flex flex-wrap gap-6 items-center p-6 bg-foreground rounded-lg">
                <SavePlateLogo variant="full" size="md" color="white" />
                <SavePlateLogo variant="icon" size="md" color="white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Color Palette */}
        <Card>
          <CardHeader>
            <CardTitle>Color Palette</CardTitle>
            <CardDescription>SavePlate brand colors with HSL values</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              {/* Primary - Fresh Green */}
              <div className="space-y-2">
                <div className="h-24 rounded-lg bg-primary shadow-elegant" />
                <h3 className="font-semibold">Fresh Green</h3>
                <p className="text-sm text-muted-foreground">#10B981</p>
                <p className="text-xs font-mono">HSL(160 84% 39%)</p>
                <p className="text-xs">Growth, sustainability, savings</p>
              </div>

              {/* Secondary - Warm Orange */}
              <div className="space-y-2">
                <div className="h-24 rounded-lg bg-secondary" />
                <h3 className="font-semibold">Warm Orange</h3>
                <p className="text-sm text-muted-foreground">#F59E0B</p>
                <p className="text-xs font-mono">HSL(38 92% 50%)</p>
                <p className="text-xs">Food, energy, warmth</p>
              </div>

              {/* Accent - Deep Blue */}
              <div className="space-y-2">
                <div className="h-24 rounded-lg bg-accent" />
                <h3 className="font-semibold">Deep Blue</h3>
                <p className="text-sm text-muted-foreground">#3B82F6</p>
                <p className="text-xs font-mono">HSL(217 91% 60%)</p>
                <p className="text-xs">Trust, professionalism, data</p>
              </div>

              {/* Neutral - Charcoal */}
              <div className="space-y-2">
                <div className="h-24 rounded-lg bg-foreground" />
                <h3 className="font-semibold">Charcoal</h3>
                <p className="text-sm text-muted-foreground">#1F2937</p>
                <p className="text-xs font-mono">HSL(217 28% 17%)</p>
                <p className="text-xs">Text, headers, structure</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gradients */}
        <Card>
          <CardHeader>
            <CardTitle>Brand Gradients</CardTitle>
            <CardDescription>Pre-defined gradients for consistent visual appeal</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="h-24 rounded-lg" style={{ background: 'var(--gradient-primary)' }} />
                <h3 className="font-semibold">Primary Gradient</h3>
                <p className="text-xs font-mono">--gradient-primary</p>
              </div>
              <div className="space-y-2">
                <div className="h-24 rounded-lg" style={{ background: 'var(--gradient-secondary)' }} />
                <h3 className="font-semibold">Secondary Gradient</h3>
                <p className="text-xs font-mono">--gradient-secondary</p>
              </div>
              <div className="space-y-2">
                <div className="h-24 rounded-lg" style={{ background: 'var(--gradient-hero)' }} />
                <h3 className="font-semibold">Hero Gradient</h3>
                <p className="text-xs font-mono">--gradient-hero</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Component Examples */}
        <Card>
          <CardHeader>
            <CardTitle>UI Components</CardTitle>
            <CardDescription>SavePlate-themed components in action</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Buttons */}
            <div className="space-y-3">
              <h3 className="font-semibold">Buttons</h3>
              <div className="flex flex-wrap gap-3">
                <Button>Primary Action</Button>
                <Button variant="secondary">Secondary Action</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
              </div>
            </div>

            {/* Badges */}
            <div className="space-y-3">
              <h3 className="font-semibold">Badges</h3>
              <div className="flex flex-wrap gap-3">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Alert</Badge>
              </div>
            </div>

            {/* Cards */}
            <div className="space-y-3">
              <h3 className="font-semibold">Feature Cards</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="shadow-elegant">
                  <CardHeader>
                    <CardTitle className="text-lg">Reduce Waste</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Track and analyze food waste in under 30 seconds
                    </p>
                  </CardContent>
                </Card>
                <Card className="shadow-elegant">
                  <CardHeader>
                    <CardTitle className="text-lg">Save Money</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      $30K-$80K annual savings through smart analytics
                    </p>
                  </CardContent>
                </Card>
                <Card className="shadow-elegant">
                  <CardHeader>
                    <CardTitle className="text-lg">Save Planet</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Contribute to sustainability and ESG goals
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Typography */}
        <Card>
          <CardHeader>
            <CardTitle>Typography</CardTitle>
            <CardDescription>Font system and hierarchy</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Heading 1 - Inter Bold</h1>
              <p className="text-sm text-muted-foreground">4xl / Bold / -2% letter-spacing</p>
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-2">Heading 2 - Inter Bold</h2>
              <p className="text-sm text-muted-foreground">3xl / Bold</p>
            </div>
            <div>
              <h3 className="text-2xl font-semibold mb-2">Heading 3 - Inter Semibold</h3>
              <p className="text-sm text-muted-foreground">2xl / Semibold</p>
            </div>
            <div>
              <p className="text-base mb-2">Body Text - Inter Regular</p>
              <p className="text-sm text-muted-foreground">base / Regular / Readable and clean</p>
            </div>
          </CardContent>
        </Card>

        {/* Brand Voice */}
        <Card>
          <CardHeader>
            <CardTitle>Brand Voice</CardTitle>
            <CardDescription>How SavePlate communicates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-primary">We are:</h3>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li>Friendly but professional</li>
                  <li>Optimistic and empowering</li>
                  <li>Data-driven and practical</li>
                  <li>Mission-focused (save food, money, planet)</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-destructive">We are not:</h3>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li>Corporate jargon or pushy</li>
                  <li>Guilt-tripping or preachy</li>
                  <li>Overly technical or complicated</li>
                  <li>Just another analytics tool</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Messages */}
        <Card>
          <CardHeader>
            <CardTitle>Key Messages</CardTitle>
            <CardDescription>Core messaging pillars</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-primary/10 border-l-4 border-primary rounded">
                <p className="font-medium text-primary">
                  "You're not just saving money, you're making a difference"
                </p>
                <p className="text-sm text-muted-foreground mt-1">Altruistic value proposition</p>
              </div>
              <div className="p-4 bg-accent/10 border-l-4 border-accent rounded">
                <p className="font-medium text-accent">
                  "Built by people who understand restaurants"
                </p>
                <p className="text-sm text-muted-foreground mt-1">Industry expertise and empathy</p>
              </div>
              <div className="p-4 bg-secondary/10 border-l-4 border-secondary rounded">
                <p className="font-medium text-secondary">
                  "Data that helps you act, not just report"
                </p>
                <p className="text-sm text-muted-foreground mt-1">Actionable insights focus</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
