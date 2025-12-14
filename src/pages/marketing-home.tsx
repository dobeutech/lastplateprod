import { MarketingNav } from '@/components/marketing/MarketingNav';
import { HeroSection } from '@/components/marketing/HeroSection';
import { PainPointsSection } from '@/components/marketing/PainPointsSection';
import { SolutionSection } from '@/components/marketing/SolutionSection';
import { ROICalculator } from '@/components/marketing/ROICalculator';
import { SocialProofSection } from '@/components/marketing/SocialProofSection';
import { AltruismSection } from '@/components/marketing/AltruismSection';
import { CompanySection } from '@/components/marketing/CompanySection';
import { FinalCTASection } from '@/components/marketing/FinalCTASection';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';

interface MarketingHomePageProps {
  onSignIn: () => void;
  onSignUp?: () => void;
  onNavigate?: (page: string) => void;
}

export default function MarketingHomePage({ onSignIn, onSignUp, onNavigate }: MarketingHomePageProps) {
  const handleGetStarted = () => {
    // Default to signup for new users, fallback to sign in if no signup handler
    if (onSignUp) {
      onSignUp();
    } else {
      onSignIn();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <MarketingNav onSignIn={onSignIn} onSignUp={onSignUp} />
      <HeroSection onGetStarted={handleGetStarted} />
      <PainPointsSection />
      <SolutionSection />
      <ROICalculator />
      <SocialProofSection />
      <AltruismSection />
      <CompanySection />
      <FinalCTASection onGetStarted={handleGetStarted} />
      <MarketingFooter onNavigate={onNavigate} />
    </div>
  );
}
