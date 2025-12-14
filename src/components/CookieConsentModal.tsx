import { useState, useEffect } from 'react';
import { Shield, BarChart3, Megaphone, Users } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import { CookieConsent } from '@/lib/cookie-consent-types';

interface CookieConsentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CookieConsentModal({ open, onOpenChange }: CookieConsentModalProps) {
  const { consent, saveConsent, acceptAll } = useCookieConsent();
  const [preferences, setPreferences] = useState<CookieConsent>(consent);

  useEffect(() => {
    setPreferences(consent);
  }, [consent, open]);

  const handleSave = () => {
    saveConsent(preferences);
    onOpenChange(false);
  };

  const handleAcceptAll = () => {
    acceptAll();
    onOpenChange(false);
  };

  const categories = [
    {
      id: 'necessary' as const,
      icon: Shield,
      title: 'Strictly Necessary',
      description: 'Essential for the website to function properly. These cookies cannot be disabled.',
      items: ['Authentication', 'Security', 'Load balancing'],
      disabled: true,
    },
    {
      id: 'analytics' as const,
      icon: BarChart3,
      title: 'Analytics & Performance',
      description: 'Help us understand how visitors interact with our website.',
      items: ['Google Analytics', 'Hotjar heatmaps', 'Error tracking (Sentry)'],
      disabled: false,
    },
    {
      id: 'marketing' as const,
      icon: Megaphone,
      title: 'Marketing & Advertising',
      description: 'Used to deliver personalized advertisements and measure campaign effectiveness.',
      items: ['Google Ads retargeting', 'Facebook Pixel', 'LinkedIn Insight Tag'],
      disabled: false,
    },
    {
      id: 'third_party' as const,
      icon: Users,
      title: 'Third-Party Services',
      description: 'Enable third-party services like support chat and embedded content.',
      items: ['Intercom chat widget', 'Embedded videos (YouTube)'],
      disabled: false,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cookie Preferences</DialogTitle>
          <DialogDescription>
            Manage your cookie preferences. You can enable or disable different types of cookies below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <div key={category.id} className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <Icon className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Label 
                          htmlFor={category.id}
                          className="font-semibold"
                        >
                          {category.title}
                        </Label>
                        {category.disabled && (
                          <span className="text-xs text-muted-foreground italic">
                            Always on
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {category.description}
                      </p>
                      <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                        {category.items.map((item) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <Switch
                    id={category.id}
                    checked={preferences[category.id]}
                    onCheckedChange={(checked) =>
                      setPreferences({ ...preferences, [category.id]: checked })
                    }
                    disabled={category.disabled}
                  />
                </div>
                {category.id !== 'third_party' && <Separator />}
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            onClick={handleSave}
            className="flex-1"
          >
            Save Preferences
          </Button>
          <Button
            onClick={handleAcceptAll}
            className="flex-1"
          >
            Accept All
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
