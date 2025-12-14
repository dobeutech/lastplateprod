import { useState, useEffect } from 'react';
import { WasteAuthProvider, useWasteAuth } from '@/lib/waste-auth';
import { IntercomProvider } from '@/lib/intercom';
import { WasteLoginPage } from '@/components/WasteLoginPage';
import { WasteNav } from '@/components/WasteNav';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { IntercomHelpButton } from '@/components/IntercomHelpButton';
import { CookieConsentBanner } from '@/components/CookieConsentBanner';
import MarketingHomePage from '@/pages/marketing-home';
import SignupPage from '@/pages/signup';
import QuickLogWaste from '@/pages/index';
import LocationDashboard from '@/pages/dashboard';
import MultiLocationDashboard from '@/pages/multi-location';
import ESGReportsPage from '@/pages/esg-reports';
import SettingsPage from '@/pages/settings';
import VendorsPage from '@/pages/vendors';
import PurchaseOrdersPage from '@/pages/purchase-orders';
import KnowledgeBasePage from '@/pages/knowledge-base';
import PrivacyPolicyPage from '@/pages/privacy';
import TermsOfServicePage from '@/pages/terms';
import { Toaster } from '@/components/ui/sonner';

function AppContent() {
  const { isAuthenticated, loading, userProfile } = useWasteAuth();
  const [currentPage, setCurrentPage] = useState('log');
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  useEffect(() => {
    // Default to appropriate page based on role
    if (userProfile) {
      if (userProfile.role === 'operator') {
        setCurrentPage('log');
      }
    }
  }, [userProfile]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // Show privacy policy page
  if (currentPage === 'privacy') {
    return <PrivacyPolicyPage onBack={() => setCurrentPage(isAuthenticated ? 'log' : 'marketing')} />;
  }

  // Show terms of service page
  if (currentPage === 'terms') {
    return <TermsOfServicePage onBack={() => setCurrentPage(isAuthenticated ? 'log' : 'marketing')} />;
  }

  // Show signup page when explicitly requested
  if (!isAuthenticated && showSignup) {
    return (
      <>
        <SignupPage />
        <CookieConsentBanner />
      </>
    );
  }

  // Show login page when explicitly requested
  if (!isAuthenticated && showLogin) {
    return (
      <>
        <WasteLoginPage />
        <CookieConsentBanner />
      </>
    );
  }

  // Show marketing homepage when not authenticated and not explicitly on login/signup page
  if (!isAuthenticated && !showLogin && !showSignup) {
    return (
      <>
        <MarketingHomePage 
          onSignIn={() => setShowLogin(true)} 
          onSignUp={() => setShowSignup(true)}
          onNavigate={setCurrentPage} 
        />
        <CookieConsentBanner />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <WasteNav currentPage={currentPage} onNavigate={setCurrentPage} />
      <main>
        {currentPage === 'log' && <QuickLogWaste />}
        {currentPage === 'dashboard' && userProfile?.location_id && (
          <LocationDashboard locationId={userProfile.location_id} />
        )}
        {currentPage === 'multi-location' && 
          (userProfile?.role === 'manager' || userProfile?.role === 'admin') && (
          <MultiLocationDashboard />
        )}
        {currentPage === 'vendors' && 
          (userProfile?.role === 'manager' || userProfile?.role === 'admin') && (
          <VendorsPage locationId={userProfile.location_id || undefined} />
        )}
        {currentPage === 'purchase-orders' && 
          (userProfile?.role === 'manager' || userProfile?.role === 'admin') && userProfile.location_id && userProfile.restaurant_id && (
          <PurchaseOrdersPage 
            locationId={userProfile.location_id} 
            restaurantId={userProfile.restaurant_id}
          />
        )}
        {currentPage === 'knowledge-base' && <KnowledgeBasePage />}
        {currentPage === 'esg' && userProfile?.role === 'admin' && <ESGReportsPage />}
        {currentPage === 'settings' && userProfile?.role === 'admin' && <SettingsPage />}
      </main>
      <MobileBottomNav currentPage={currentPage} onNavigate={setCurrentPage} />
      <IntercomHelpButton variant="floating" />
      <CookieConsentBanner />
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <WasteAuthProvider>
      <IntercomProvider>
        <AppContent />
      </IntercomProvider>
    </WasteAuthProvider>
  );
}

export default App;
