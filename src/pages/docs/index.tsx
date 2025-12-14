import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Book, Code, Shield, Zap, Puzzle, Rocket, Users, GitBranch } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import SavePlateLogo from '@/components/SavePlateLogo';

interface DocSection {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  badge?: string;
}

const docSections: DocSection[] = [
  {
    title: 'Getting Started',
    description: 'Quick introduction to the SavePlate API, authentication, and making your first API call.',
    icon: <Rocket className="w-6 h-6" />,
    path: '/docs/getting-started',
  },
  {
    title: 'Authentication & Security',
    description: 'API keys, OAuth 2.0, security best practices, and SOC 2 compliance documentation.',
    icon: <Shield className="w-6 h-6" />,
    path: '/docs/authentication',
  },
  {
    title: 'REST API Reference',
    description: 'Complete REST API documentation with endpoints, parameters, and response schemas.',
    icon: <Code className="w-6 h-6" />,
    path: '/docs/api-reference',
  },
  {
    title: 'GraphQL API',
    description: 'GraphQL schema, queries, mutations, and interactive GraphQL Playground.',
    icon: <GitBranch className="w-6 h-6" />,
    path: '/docs/graphql',
    badge: 'Advanced',
  },
  {
    title: 'Integration Guides',
    description: 'Step-by-step guides for integrating with Square, Toast, Clover, and custom POS systems.',
    icon: <Puzzle className="w-6 h-6" />,
    path: '/docs/integrations',
  },
  {
    title: 'SDKs & Libraries',
    description: 'Official SDKs for JavaScript, Python, and other languages.',
    icon: <Book className="w-6 h-6" />,
    path: '/docs/sdks',
    badge: 'Coming Soon',
  },
  {
    title: 'Use Cases & Tutorials',
    description: 'Real-world examples, tutorials, and best practices for building with SavePlate.',
    icon: <Zap className="w-6 h-6" />,
    path: '/docs/tutorials',
  },
  {
    title: 'Vendor Partner Program',
    description: 'Join our partner program and build integrations for the SavePlate ecosystem.',
    icon: <Users className="w-6 h-6" />,
    path: '/docs/partners',
  },
];

const popularGuides = [
  { title: 'Making Your First API Call', path: '/docs/getting-started#first-call', time: '5 min' },
  { title: 'Setting Up OAuth 2.0', path: '/docs/authentication#oauth', time: '15 min' },
  { title: 'Square POS Integration', path: '/docs/integrations/square', time: '30 min' },
  { title: 'Building a Custom Dashboard', path: '/docs/tutorials/dashboard', time: '45 min' },
];

export default function DocsHomePage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <SavePlateLogo size="sm" variant="icon" />
              <div>
                <h1 className="text-xl font-bold text-foreground">SavePlate Developers</h1>
                <p className="text-xs text-muted-foreground">Build with the SavePlate API</p>
              </div>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/docs/api-reference">
                <Button variant="ghost">API Reference</Button>
              </Link>
              <Link to="/docs/getting-started">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Build with SavePlate
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Complete API documentation, guides, and resources to integrate food waste tracking,
            vendor management, and analytics into your applications.
          </p>

          {/* Search */}
          <div className="max-w-2xl mx-auto mb-8">
            <Input
              type="search"
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 text-lg"
            />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-primary mb-1">50+</div>
                <div className="text-sm text-muted-foreground">API Endpoints</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-primary mb-1">99.9%</div>
                <div className="text-sm text-muted-foreground">Uptime SLA</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-primary mb-1">24/7</div>
                <div className="text-sm text-muted-foreground">API Support</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Documentation Sections */}
      <section className="py-16 container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8">Documentation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {docSections.map((section) => (
            <Link key={section.path} to={section.path}>
              <Card className="h-full hover:shadow-elegant transition-all hover:border-primary/50">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      {section.icon}
                    </div>
                    {section.badge && (
                      <Badge variant="secondary">{section.badge}</Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl">{section.title}</CardTitle>
                  <CardDescription className="mt-2">
                    {section.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Guides */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Popular Guides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
            {popularGuides.map((guide) => (
              <Link key={guide.path} to={guide.path}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{guide.title}</h3>
                        <p className="text-sm text-muted-foreground">{guide.time} read</p>
                      </div>
                      <Book className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 container mx-auto px-4 text-center">
        <Card className="max-w-3xl mx-auto bg-gradient-to-r from-primary/10 to-primary-glow/10 border-primary/20">
          <CardContent className="p-12">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Create your API key and start building in minutes.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/settings">
                <Button size="lg">Get Your API Key</Button>
              </Link>
              <Link to="/docs/getting-started">
                <Button size="lg" variant="outline">View Quickstart</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-4">Documentation</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/docs/getting-started" className="hover:text-primary">Getting Started</Link></li>
                <li><Link to="/docs/api-reference" className="hover:text-primary">API Reference</Link></li>
                <li><Link to="/docs/graphql" className="hover:text-primary">GraphQL</Link></li>
                <li><Link to="/docs/changelog" className="hover:text-primary">Changelog</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Guides</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/docs/integrations" className="hover:text-primary">Integrations</Link></li>
                <li><Link to="/docs/tutorials" className="hover:text-primary">Tutorials</Link></li>
                <li><Link to="/docs/sdks" className="hover:text-primary">SDKs</Link></li>
                <li><Link to="/docs/authentication" className="hover:text-primary">Security</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="https://6dcbe7d4-9bd.db-pool-europe-west1.altan.ai/services/openapi.json" className="hover:text-primary">OpenAPI Spec</a></li>
                <li><Link to="/docs/partners" className="hover:text-primary">Partner Program</Link></li>
                <li><Link to="/knowledge-base" className="hover:text-primary">Support</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/" className="hover:text-primary">About</Link></li>
                <li><Link to="/" className="hover:text-primary">Contact</Link></li>
                <li><Link to="/" className="hover:text-primary">Privacy</Link></li>
                <li><Link to="/" className="hover:text-primary">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© 2025 SavePlate by Dobeu Tech Solutions. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
