import { Cookie } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import { CookieConsentModal } from './CookieConsentModal';
import { useState } from 'react';

export function CookieConsentBanner() {
  const { showBanner, acceptAll, rejectAll } = useCookieConsent();
  const [showModal, setShowModal] = useState(false);

  if (!showBanner) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t shadow-elegant p-4 md:p-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex items-start gap-3 flex-1">
              <Cookie className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">We use cookies to improve your experience</h3>
                <p className="text-sm text-muted-foreground">
                  We use cookies and similar technologies to enhance your experience, analyze traffic, and show you relevant content.
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowModal(true)}
                className="flex-1 md:flex-none"
              >
                Customize
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={rejectAll}
                className="flex-1 md:flex-none"
              >
                Reject All
              </Button>
              <Button
                size="sm"
                onClick={acceptAll}
                className="flex-1 md:flex-none"
              >
                Accept All
              </Button>
            </div>
          </div>
        </div>
      </div>

      <CookieConsentModal 
        open={showModal} 
        onOpenChange={setShowModal}
      />
    </>
  );
}
