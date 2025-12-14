import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SavePlateLogo } from '@/components/SavePlateLogo';
import { Progress } from '@/components/ui/progress';
import { Check } from 'lucide-react';

// Step components
import { OAuthStep } from '@/components/signup/OAuthStep';
import { BasicInfoStep } from '@/components/signup/BasicInfoStep';
import { BusinessInfoStep } from '@/components/signup/BusinessInfoStep';
import { MarketingOptInStep } from '@/components/signup/MarketingOptInStep';
import { PhoneVerificationStep } from '@/components/signup/PhoneVerificationStep';
import { CompletionStep } from '@/components/signup/CompletionStep';

export interface SignupFormData {
  // OAuth
  oauthProvider?: 'google' | 'linkedin' | 'x';
  oauthData?: {
    providerId: string;
    email: string;
    name: string;
    profilePicture?: string;
  };
  
  // Basic Info (Step 2)
  email: string;
  password: string;
  
  // Business Info (Step 3)
  firstName: string;
  lastName: string;
  businessName: string;
  cuisineType: string;
  locationsCount: string;
  
  // Marketing (Step 4)
  emailMarketingOptIn: boolean;
  smsMarketingOptIn: boolean;
  phone?: string;
  
  // Phone Verification (Step 5)
  phoneVerified: boolean;
  verificationCode?: string;
}

const TOTAL_STEPS = 6;

export default function SignupPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<SignupFormData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    businessName: '',
    cuisineType: '',
    locationsCount: '1',
    emailMarketingOptIn: false,
    smsMarketingOptIn: false,
    phoneVerified: false,
  });

  const updateFormData = (data: Partial<SignupFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const progressPercentage = (currentStep / TOTAL_STEPS) * 100;

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <OAuthStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
          />
        );
      case 2:
        return (
          <BasicInfoStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 3:
        return (
          <BusinessInfoStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 4:
        return (
          <MarketingOptInStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 5:
        return (
          <PhoneVerificationStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 6:
        return <CompletionStep formData={formData} />;
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return 'Choose Sign Up Method';
      case 2:
        return 'Account Information';
      case 3:
        return 'Business Details';
      case 4:
        return 'Stay Connected';
      case 5:
        return 'Verify Your Phone';
      case 6:
        return 'Welcome to SavePlate!';
      default:
        return '';
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 1:
        return 'Sign up quickly with your social account or create a new account';
      case 2:
        return 'Set up your login credentials';
      case 3:
        return 'Tell us about your restaurant';
      case 4:
        return 'Get tips, updates, and pricing alerts';
      case 5:
        return 'Secure your account with SMS verification';
      case 6:
        return "You're all set! Let's start reducing waste.";
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-elegant">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <SavePlateLogo variant="full" size="lg" />
          </div>
          
          {/* Progress Indicator */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Step {currentStep} of {TOTAL_STEPS}</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          {/* Step Indicators */}
          <div className="flex items-center justify-between px-4">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((step) => (
              <div key={step} className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    step < currentStep
                      ? 'bg-primary text-primary-foreground'
                      : step === currentStep
                      ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {step < currentStep ? <Check className="w-4 h-4" /> : step}
                </div>
                {step < TOTAL_STEPS && (
                  <div
                    className={`hidden sm:block w-12 h-0.5 mt-4 ${
                      step < currentStep ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="text-center">
            <CardTitle className="text-2xl">{getStepTitle()}</CardTitle>
            <CardDescription className="mt-2">{getStepDescription()}</CardDescription>
          </div>
        </CardHeader>

        <CardContent>{renderStep()}</CardContent>
      </Card>
    </div>
  );
}