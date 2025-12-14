import { SavePlateLogo } from '@/components/SavePlateLogo';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface PrivacyPolicyPageProps {
  onBack?: () => void;
}

export default function PrivacyPolicyPage({ onBack }: PrivacyPolicyPageProps) {
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
          <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: {lastUpdated}</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p>
              SavePlate ("we," "us," "our") respects your privacy. This policy explains how we collect, 
              use, and protect your personal information when you use our restaurant operations platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold mb-3">Account Information</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Name, email, and phone number (if provided)</li>
              <li>Business name and number of locations</li>
              <li>Payment information (stored by Stripe, not by us)</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">Usage Data</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Waste logs, purchase orders, and inventory records</li>
              <li>POS integration data (sales, menu items)</li>
              <li>Analytics (page views, feature usage)</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">Automatically Collected Information</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>IP address, browser type, and device information</li>
              <li>Cookies (see our Cookie Policy)</li>
              <li>Log files (for security and debugging)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6">
              <li>Provide and improve the service</li>
              <li>Process payments</li>
              <li>Send transactional emails (account notifications, alerts)</li>
              <li>Send marketing emails (only if you opt in)</li>
              <li>Analyze usage to improve features</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Data Sharing</h2>
            
            <h3 className="text-xl font-semibold mb-3">We DO share with:</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Service providers (hosting, analytics, support)</li>
              <li>Payment processors (Stripe)</li>
              <li>As required by law or legal process</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">We DO NOT:</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Sell your personal data to third parties</li>
              <li>Share your specific business data with competitors</li>
              <li>Use your data for purposes you haven't consented to</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">Community Pricing</h3>
            <p>
              When you submit prices to our community pricing feature, we anonymize the data 
              (no restaurant name, only region and segment) to help the community make better purchasing decisions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
            <ul className="list-disc pl-6">
              <li>Encryption at rest and in transit (TLS 1.3)</li>
              <li>SOC 2 Type II compliance</li>
              <li>Regular security audits</li>
              <li>Role-based access control</li>
              <li>Automatic backups</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Access:</strong> Request a copy of your data</li>
              <li><strong>Correction:</strong> Update inaccurate information</li>
              <li><strong>Deletion:</strong> Request account deletion ("right to be forgotten")</li>
              <li><strong>Portability:</strong> Export your data in machine-readable format</li>
              <li><strong>Opt-Out:</strong> Unsubscribe from marketing emails</li>
            </ul>
            <p>
              To exercise these rights, contact us at{' '}
              <a href="mailto:privacy@saveplate.com" className="text-primary hover:underline">
                privacy@saveplate.com
              </a>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Data Retention</h2>
            <ul className="list-disc pl-6">
              <li><strong>Account data:</strong> Retained while your account is active</li>
              <li><strong>After deletion:</strong> 30-day grace period, then permanently deleted</li>
              <li><strong>Aggregated analytics:</strong> Retained indefinitely (anonymized)</li>
              <li><strong>Legal hold:</strong> Retained as required by law</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Children's Privacy</h2>
            <p>
              Our service is not intended for individuals under 18. We do not knowingly collect 
              data from children.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. International Transfers</h2>
            <p>
              Data is stored in Europe (EU-West). If you're accessing from outside the EU, 
              we comply with GDPR via Standard Contractual Clauses.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Changes to This Policy</h2>
            <p>
              We may update this policy from time to time. Material changes will be notified via 
              email to your registered email address.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Contact Us</h2>
            <p>
              For privacy-related questions or concerns, contact us at:
            </p>
            <p className="mt-2">
              <strong>Email:</strong>{' '}
              <a href="mailto:privacy@saveplate.com" className="text-primary hover:underline">
                privacy@saveplate.com
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
