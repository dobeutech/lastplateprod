import { SavePlateLogo } from '@/components/SavePlateLogo';
import { useCookieConsent } from '@/hooks/useCookieConsent';

interface MarketingFooterProps {
  onNavigate?: (page: string) => void;
}

export function MarketingFooter({ onNavigate }: MarketingFooterProps) {
  const { openPreferences } = useCookieConsent();

  const handleLinkClick = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
    }
  };

  const footerLinks = {
    product: [
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Integrations', href: '#integrations' },
      { label: 'Roadmap', href: '#roadmap' },
    ],
    resources: [
      { label: 'Blog', href: '#blog' },
      { label: 'Knowledge Base', onClick: () => handleLinkClick('knowledge-base') },
      { label: 'Developer Docs', href: '#docs' },
      { label: 'API Reference', href: '#api' },
    ],
    company: [
      { label: 'About', href: '#about' },
      { label: 'Team', href: '#team' },
      { label: 'Careers', href: '#careers' },
      { label: 'Contact', href: '#contact' },
    ],
    legal: [
      { label: 'Privacy Policy', onClick: () => handleLinkClick('privacy') },
      { label: 'Terms of Service', onClick: () => handleLinkClick('terms') },
      { label: 'Cookie Preferences', onClick: openPreferences },
      { label: 'GDPR', href: '#gdpr' },
    ],
  };

  return (
    <footer className="bg-card border-t py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Logo & Tagline */}
          <div className="col-span-2 md:col-span-1">
            <SavePlateLogo size="md" variant="full" />
            <p className="text-sm text-muted-foreground mt-4">
              Save Food. Save Money. Save the Planet.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  {link.onClick ? (
                    <button
                      onClick={link.onClick}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
                    >
                      {link.label}
                    </button>
                  ) : link.href ? (
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  {link.onClick ? (
                    <button
                      onClick={link.onClick}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
                    >
                      {link.label}
                    </button>
                  ) : link.href ? (
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} SavePlate by Dobeu Tech Solutions. All rights reserved.
            </p>

            <div className="flex gap-6">
              <a href="#linkedin" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                LinkedIn
              </a>
              <a href="#twitter" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Twitter/X
              </a>
              <a href="#facebook" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Facebook
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}