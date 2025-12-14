import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { SavePlateLogo } from '../SavePlateLogo';
import { Badge } from '../ui/badge';
import { Check } from 'lucide-react';

/**
 * SavePlate Brand Implementation Guide
 * 
 * Quick reference for developers implementing SavePlate brand across the platform
 */
export function BrandGuide() {
  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <SavePlateLogo variant="full" size="xl" />
        <h1 className="text-4xl font-bold">Brand Implementation Guide</h1>
        <p className="text-xl text-muted-foreground">
          Quick reference for maintaining brand consistency
        </p>
      </div>

      {/* Quick Start */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Start</CardTitle>
          <CardDescription>Import and use SavePlate components</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg font-mono text-sm">
            <div className="text-primary">// Import brand components</div>
            <div>import &#123; SavePlateLogo, HeroSection, FeatureCards &#125; from '@/components/brand';</div>
            <br />
            <div className="text-primary">// Use in your component</div>
            <div>&lt;SavePlateLogo variant="full" size="md" /&gt;</div>
            <div>&lt;HeroSection /&gt;</div>
            <div>&lt;FeatureCards /&gt;</div>
          </div>
        </CardContent>
      </Card>

      {/* Color Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Color Usage - CRITICAL RULES</CardTitle>
          <CardDescription>Always use design system tokens, never direct colors</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* DO */}
          <div>
            <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
              <Check className="w-5 h-5" /> DO - Use Semantic Tokens
            </h3>
            <div className="bg-muted p-4 rounded-lg font-mono text-sm space-y-1">
              <div>&lt;Button variant="default"&gt;Click&lt;/Button&gt;</div>
              <div>&lt;div className="bg-primary text-primary-foreground"&gt;</div>
              <div>&lt;div className="text-foreground bg-background"&gt;</div>
            </div>
          </div>

          {/* DON'T */}
          <div>
            <h3 className="font-semibold text-destructive mb-2 flex items-center gap-2">
              ❌ DON'T - Direct Color Classes
            </h3>
            <div className="bg-destructive/10 p-4 rounded-lg font-mono text-sm space-y-1">
              <div className="text-destructive">// NEVER DO THIS:</div>
              <div className="line-through">&lt;Button className="bg-green-500"&gt;</div>
              <div className="line-through">&lt;div className="text-white bg-blue-600"&gt;</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Component Variants */}
      <Card>
        <CardHeader>
          <CardTitle>Component Patterns</CardTitle>
          <CardDescription>How to use SavePlate components effectively</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Logo Usage */}
          <div className="space-y-2">
            <h3 className="font-semibold">Logo Component</h3>
            <div className="bg-muted p-4 rounded-lg space-y-2 font-mono text-sm">
              <div>// Navigation header</div>
              <div>&lt;SavePlateLogo variant="full" size="md" /&gt;</div>
              <br />
              <div>// App icon / Favicon</div>
              <div>&lt;SavePlateLogo variant="icon" size="sm" /&gt;</div>
              <br />
              <div>// Hero sections</div>
              <div>&lt;SavePlateLogo variant="full" size="xl" /&gt;</div>
              <br />
              <div>// Dark backgrounds</div>
              <div>&lt;SavePlateLogo variant="full" size="md" color="white" /&gt;</div>
            </div>
          </div>

          {/* Buttons */}
          <div className="space-y-2">
            <h3 className="font-semibold">Buttons with Brand Colors</h3>
            <div className="bg-muted p-4 rounded-lg space-y-2 font-mono text-sm">
              <div>// Primary actions (uses SavePlate green)</div>
              <div>&lt;Button&gt;Save Changes&lt;/Button&gt;</div>
              <br />
              <div>// Secondary actions (uses warm orange)</div>
              <div>&lt;Button variant="secondary"&gt;Learn More&lt;/Button&gt;</div>
              <br />
              <div>// Gradient hero buttons</div>
              <div>&lt;Button className="bg-gradient-to-r from-primary to-primary/90"&gt;</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File Structure */}
      <Card>
        <CardHeader>
          <CardTitle>Brand Assets Location</CardTitle>
          <CardDescription>Where to find brand-related files</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 font-mono text-sm">
            <div className="flex items-start gap-2">
              <Badge variant="outline">Component</Badge>
              <span className="text-muted-foreground">src/components/SavePlateLogo.tsx</span>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline">Design System</Badge>
              <span className="text-muted-foreground">src/index.css</span>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline">Tailwind Config</Badge>
              <span className="text-muted-foreground">tailwind.config.js</span>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline">Brand Components</Badge>
              <span className="text-muted-foreground">src/components/brand/</span>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline">Favicon</Badge>
              <span className="text-muted-foreground">public/favicon.svg</span>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline">Meta Tags</Badge>
              <span className="text-muted-foreground">index.html</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Design Tokens */}
      <Card>
        <CardHeader>
          <CardTitle>CSS Design Tokens</CardTitle>
          <CardDescription>Available in src/index.css</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 font-mono text-sm">
            <div className="space-y-2">
              <h3 className="font-semibold">Colors</h3>
              <div className="text-muted-foreground space-y-1">
                <div>--primary (Fresh Green)</div>
                <div>--secondary (Warm Orange)</div>
                <div>--accent (Deep Blue)</div>
                <div>--foreground (Charcoal)</div>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Gradients</h3>
              <div className="text-muted-foreground space-y-1">
                <div>--gradient-primary</div>
                <div>--gradient-secondary</div>
                <div>--gradient-hero</div>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Shadows</h3>
              <div className="text-muted-foreground space-y-1">
                <div>--shadow-elegant</div>
                <div>--shadow-card</div>
                <div>--shadow-glow</div>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Transitions</h3>
              <div className="text-muted-foreground space-y-1">
                <div>--transition-smooth</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Brand Voice */}
      <Card>
        <CardHeader>
          <CardTitle>Brand Voice & Messaging</CardTitle>
          <CardDescription>How SavePlate communicates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-primary/10 rounded-lg">
              <h3 className="font-semibold mb-2">Tagline</h3>
              <p className="text-sm">Save Food. Save Money. Save the Planet.</p>
            </div>
            <div className="p-4 bg-accent/10 rounded-lg">
              <h3 className="font-semibold mb-2">Value Proposition</h3>
              <p className="text-sm">$30K-$80K annual savings in under 30 seconds</p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Key Messages</h3>
            <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
              <li>You're not just saving money, you're making a difference</li>
              <li>Built by people who understand restaurants</li>
              <li>Data that helps you act, not just report</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Implementation Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>New Page Checklist</CardTitle>
          <CardDescription>Ensure brand consistency when creating new pages</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {[
              'Use SavePlateLogo in header/navigation',
              'Apply brand color tokens (not direct colors)',
              'Use semantic HTML (header, main, section, footer)',
              'Include proper meta tags and SEO',
              'Test both light and dark modes',
              'Use shadow-elegant for cards',
              'Apply gradients for hero sections',
              'Maintain 200-300 lines per component max'
            ].map((item, index) => (
              <li key={index} className="flex items-start gap-2">
                <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
