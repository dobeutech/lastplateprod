import { SavePlateLogo } from '@/components/SavePlateLogo';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface TermsOfServicePageProps {
  onBack?: () => void;
}

export default function TermsOfServicePage({ onBack }: TermsOfServicePageProps) {
  const lastUpdated = 'October 29, 2025';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <SavePlateLogo size="sm" variant="full" />
            {onBack && (
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">Last updated: {lastUpdated}</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p>
              By using SavePlate, you agree to these terms. If you don't agree, please do not use the service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p>
              SavePlate provides restaurant operations software including waste tracking, vendor management, 
              inventory management, analytics, and integrations with third-party systems.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Account Registration</h2>
            <ul className="list-disc pl-6">
              <li>Must be 18+ and authorized to bind your business</li>
              <li>Provide accurate information</li>
              <li>Keep account credentials secure</li>
              <li>Notify us immediately of any unauthorized access</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Subscription and Payment</h2>
            
            <h3 className="text-xl font-semibold mb-3">Free Trial</h3>
            <p>14 days, no credit card required</p>

            <h3 className="text-xl font-semibold mb-3 mt-4">Paid Plans</h3>
            <p>Billed monthly or annually per location</p>

            <h3 className="text-xl font-semibold mb-3 mt-4">Cancellation</h3>
            <p>Cancel anytime with no penalties</p>

            <h3 className="text-xl font-semibold mb-3 mt-4">Refunds</h3>
            <p>Pro-rated refunds for annual plans</p>

            <h3 className="text-xl font-semibold mb-3 mt-4">Payment Failures</h3>
            <p>Grace period provided, then service suspension until payment is resolved</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Acceptable Use</h2>
            
            <h3 className="text-xl font-semibold mb-3">You may:</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Use the service for restaurant operations</li>
              <li>Access your data via API</li>
              <li>Integrate with third-party systems</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">You may not:</h3>
            <ul className="list-disc pl-6">
              <li>Resell or white-label the service</li>
              <li>Scrape or bulk download data (except your own)</li>
              <li>Reverse engineer the platform</li>
              <li>Use for illegal purposes</li>
              <li>Submit false community pricing data</li>
              <li>Violate others' privacy</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Data Ownership</h2>
            <ul className="list-disc pl-6">
              <li><strong>Your Data:</strong> You own your restaurant data (waste logs, vendors, etc.)</li>
              <li><strong>Our Platform:</strong> We own the software and infrastructure</li>
              <li><strong>Community Data:</strong> Anonymized community pricing is shared with other users</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. API Terms</h2>
            <ul className="list-disc pl-6">
              <li>API keys are confidential</li>
              <li>Rate limits apply</li>
              <li>We may modify the API with reasonable notice</li>
              <li>Breaking changes: 90-day deprecation notice</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Integrations</h2>
            <p>
              Third-party integrations (Square, Toast, Clover, etc.) are subject to their own terms. 
              We are not liable for issues arising from third-party services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Warranty Disclaimer</h2>
            <p>
              Service provided "AS IS." We don't guarantee:
            </p>
            <ul className="list-disc pl-6">
              <li>100% uptime (though we strive for it!)</li>
              <li>Error-free operation</li>
              <li>Specific financial outcomes</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Limitation of Liability</h2>
            <p>We are not liable for:</p>
            <ul className="list-disc pl-6">
              <li>Indirect or consequential damages</li>
              <li>Loss of profits, data, or business</li>
              <li>Damages exceeding fees paid in the last 12 months</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Indemnification</h2>
            <p>You indemnify us against claims arising from:</p>
            <ul className="list-disc pl-6">
              <li>Your use of the service</li>
              <li>Your violation of these terms</li>
              <li>Your violation of laws or third-party rights</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. Termination</h2>
            
            <h3 className="text-xl font-semibold mb-3">We may terminate for:</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Violation of terms</li>
              <li>Non-payment</li>
              <li>Illegal activity</li>
              <li>At our discretion with 30-day notice</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">You may terminate:</h3>
            <p>Anytime via account settings</p>

            <h3 className="text-xl font-semibold mb-3 mt-4">Post-Termination:</h3>
            <ul className="list-disc pl-6">
              <li>Download your data within 30 days</li>
              <li>After 30 days, data is permanently deleted</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">13. Dispute Resolution</h2>
            <ul className="list-disc pl-6">
              <li><strong>Governing Law:</strong> European Union</li>
              <li><strong>Arbitration:</strong> Disputes resolved through good-faith negotiation first</li>
              <li><strong>Small Claims:</strong> You may pursue claims in small claims court</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">14. Changes to Terms</h2>
            <p>
              We may update these terms. Material changes will be announced with 30-day notice via email.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">15. Contact</h2>
            <p>
              For legal questions or concerns, contact us at:
            </p>
            <p className="mt-2">
              <strong>Email:</strong>{' '}
              <a href="mailto:legal@saveplate.com" className="text-primary hover:underline">
                legal@saveplate.com
              </a>
            </p>
            <p className="mt-1">
              <strong>Address:</strong> Dobeu Tech Solutions
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} SavePlate by Dobeu Tech Solutions. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
