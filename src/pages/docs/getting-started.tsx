import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Copy, Check, ChevronRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import DocsLayout from '@/components/docs/DocsLayout';
import CodeBlock from '@/components/docs/CodeBlock';

const quickstartSteps = [
  {
    step: 1,
    title: 'Get Your API Key',
    description: 'Create an API key from your dashboard settings.',
    code: null,
    action: { label: 'Go to Settings', path: '/settings' },
  },
  {
    step: 2,
    title: 'Install the Client',
    description: 'Install the SavePlate client library (or use plain HTTP).',
    code: {
      bash: 'npm install @saveplate/api-client',
      python: 'pip install saveplate',
    },
  },
  {
    step: 3,
    title: 'Make Your First Request',
    description: 'Fetch waste logs for your location.',
    code: {
      javascript: `import { SavePlateClient } from '@saveplate/api-client';

const client = new SavePlateClient({
  apiKey: 'YOUR_API_KEY',
  baseUrl: 'https://6dcbe7d4-9bd.db-pool-europe-west1.altan.ai'
});

// Fetch waste logs
const wasteLogs = await client.wasteLogs.list({
  locationId: 'your-location-id',
  startDate: '2025-01-01',
  endDate: '2025-01-31'
});

console.log(wasteLogs);`,
      python: `from saveplate import SavePlateClient

client = SavePlateClient(
    api_key='YOUR_API_KEY',
    base_url='https://6dcbe7d4-9bd.db-pool-europe-west1.altan.ai'
)

# Fetch waste logs
waste_logs = client.waste_logs.list(
    location_id='your-location-id',
    start_date='2025-01-01',
    end_date='2025-01-31'
)

print(waste_logs)`,
      curl: `curl -X GET "https://6dcbe7d4-9bd.db-pool-europe-west1.altan.ai/rest/v1/waste_logs?location_id=eq.your-location-id&created_at=gte.2025-01-01&created_at=lte.2025-01-31&select=*" \\
  -H "apikey: YOUR_API_KEY" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
    },
  },
];

export default function GettingStartedPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <DocsLayout>
      <div className="max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Badge className="mb-4">Getting Started</Badge>
          <h1 className="text-4xl font-bold mb-4">Introduction to SavePlate API</h1>
          <p className="text-xl text-muted-foreground">
            Get started with the SavePlate API in minutes. This guide will walk you through
            authentication, making your first API call, and understanding rate limits.
          </p>
        </div>

        {/* Quick Navigation */}
        <Card className="mb-8 bg-muted/30">
          <CardHeader>
            <CardTitle>On This Page</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li><a href="#quickstart" className="text-primary hover:underline">Quickstart</a></li>
              <li><a href="#authentication" className="text-primary hover:underline">Authentication</a></li>
              <li><a href="#base-url" className="text-primary hover:underline">Base URL</a></li>
              <li><a href="#rate-limits" className="text-primary hover:underline">Rate Limits</a></li>
              <li><a href="#sandbox" className="text-primary hover:underline">Sandbox Environment</a></li>
              <li><a href="#next-steps" className="text-primary hover:underline">Next Steps</a></li>
            </ul>
          </CardContent>
        </Card>

        {/* Quickstart */}
        <section id="quickstart" className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Quickstart</h2>
          <p className="text-muted-foreground mb-6">
            Follow these steps to make your first API call in under 5 minutes.
          </p>

          <div className="space-y-8">
            {quickstartSteps.map((step) => (
              <Card key={step.step}>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      {step.step}
                    </div>
                    <CardTitle>{step.title}</CardTitle>
                  </div>
                  <CardDescription>{step.description}</CardDescription>
                </CardHeader>
                {step.code && (
                  <CardContent>
                    <Tabs defaultValue="javascript" className="w-full">
                      <TabsList>
                        {Object.keys(step.code).map((lang) => (
                          <TabsTrigger key={lang} value={lang} className="capitalize">
                            {lang === 'curl' ? 'cURL' : lang}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                      {Object.entries(step.code).map(([lang, code]) => (
                        <TabsContent key={lang} value={lang}>
                          <CodeBlock code={code} language={lang} />
                        </TabsContent>
                      ))}
                    </Tabs>
                  </CardContent>
                )}
                {step.action && (
                  <CardContent>
                    <Link to={step.action.path}>
                      <Button>
                        {step.action.label}
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </section>

        {/* Authentication */}
        <section id="authentication" className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Authentication</h2>
          <p className="text-muted-foreground mb-6">
            The SavePlate API uses API keys for authentication. You can create and manage your API keys
            from your dashboard settings.
          </p>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>API Key Authentication</CardTitle>
              <CardDescription>
                Include your API key in the request headers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CodeBlock
                code={`curl -X GET "https://6dcbe7d4-9bd.db-pool-europe-west1.altan.ai/rest/v1/waste_logs" \\
  -H "apikey: YOUR_API_KEY" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
                language="bash"
              />
            </CardContent>
          </Card>

          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
            <h3 className="font-semibold text-destructive mb-2">Keep Your API Keys Secure</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Never commit API keys to version control</li>
              <li>Use environment variables to store keys</li>
              <li>Rotate keys regularly</li>
              <li>Use different keys for different environments</li>
            </ul>
          </div>
        </section>

        {/* Base URL */}
        <section id="base-url" className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Base URL</h2>
          <p className="text-muted-foreground mb-6">
            All API requests should be made to the following base URL:
          </p>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg font-mono text-sm">
                <code>https://6dcbe7d4-9bd.db-pool-europe-west1.altan.ai</code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCopy('https://6dcbe7d4-9bd.db-pool-europe-west1.altan.ai', 'base-url')}
                >
                  {copiedCode === 'base-url' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <p><strong>PostgREST API:</strong> <code>/rest/v1/*</code></p>
                <p><strong>Custom Services:</strong> <code>/services/api/*</code></p>
                <p><strong>Storage:</strong> <code>/storage/v1/*</code></p>
                <p><strong>Auth:</strong> <code>/auth/v1/*</code></p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Rate Limits */}
        <section id="rate-limits" className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Rate Limits</h2>
          <p className="text-muted-foreground mb-6">
            API rate limits are enforced to ensure fair usage and system stability.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Free Tier</CardTitle>
                <CardDescription>For testing and development</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary mb-1">100</div>
                <div className="text-sm text-muted-foreground">requests per minute</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pro Tier</CardTitle>
                <CardDescription>For production applications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary mb-1">1,000</div>
                <div className="text-sm text-muted-foreground">requests per minute</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Enterprise</CardTitle>
                <CardDescription>Custom rate limits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary mb-1">Custom</div>
                <div className="text-sm text-muted-foreground">Contact sales</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Rate Limit Headers</CardTitle>
              <CardDescription>Track your usage with response headers</CardDescription>
            </CardHeader>
            <CardContent>
              <CodeBlock
                code={`X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1704067200`}
                language="http"
              />
            </CardContent>
          </Card>
        </section>

        {/* Sandbox Environment */}
        <section id="sandbox" className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Sandbox Environment</h2>
          <p className="text-muted-foreground mb-6">
            Test your integration safely without affecting production data.
          </p>

          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle>Sandbox Mode</CardTitle>
              <CardDescription>
                Add <code className="text-xs bg-background/50 px-1 py-0.5 rounded">X-Sandbox-Mode: true</code> header to your requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CodeBlock
                code={`curl -X POST "https://6dcbe7d4-9bd.db-pool-europe-west1.altan.ai/rest/v1/waste_logs" \\
  -H "apikey: YOUR_API_KEY" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "X-Sandbox-Mode: true" \\
  -H "Content-Type: application/json" \\
  -d '{
    "item_name": "Test Item",
    "quantity": 1.5,
    "unit": "lbs",
    "category": "produce",
    "cost": 12.50
  }'`}
                language="bash"
              />
              <p className="mt-4 text-sm text-muted-foreground">
                Sandbox data is automatically cleared every 24 hours.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Next Steps */}
        <section id="next-steps" className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Next Steps</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to="/docs/api-reference">
              <Card className="h-full hover:shadow-elegant transition-shadow hover:border-primary/50">
                <CardHeader>
                  <CardTitle>API Reference</CardTitle>
                  <CardDescription>
                    Explore all available endpoints and their parameters
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
            <Link to="/docs/authentication">
              <Card className="h-full hover:shadow-elegant transition-shadow hover:border-primary/50">
                <CardHeader>
                  <CardTitle>Authentication & Security</CardTitle>
                  <CardDescription>
                    Learn about OAuth 2.0, API scopes, and security best practices
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
            <Link to="/docs/integrations">
              <Card className="h-full hover:shadow-elegant transition-shadow hover:border-primary/50">
                <CardHeader>
                  <CardTitle>Integration Guides</CardTitle>
                  <CardDescription>
                    Step-by-step guides for POS systems and third-party tools
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
            <Link to="/docs/tutorials">
              <Card className="h-full hover:shadow-elegant transition-shadow hover:border-primary/50">
                <CardHeader>
                  <CardTitle>Tutorials & Use Cases</CardTitle>
                  <CardDescription>
                    Real-world examples and best practices
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </section>
      </div>
    </DocsLayout>
  );
}
