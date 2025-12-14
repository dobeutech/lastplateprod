import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { SignupFormData } from '@/pages/signup';
import { toast } from 'sonner';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Smartphone, RefreshCw } from 'lucide-react';

interface PhoneVerificationStepProps {
  formData: SignupFormData;
  updateFormData: (data: Partial<SignupFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function PhoneVerificationStep({ formData, updateFormData, onNext, onBack }: PhoneVerificationStepProps) {
  const [code, setCode] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const sendVerificationCode = useCallback(async () => {
    // TODO: Integrate with Twilio/SMS service via Supabase Edge Function
    console.log('Sending SMS verification code to:', formData.phone);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success(`Verification code sent to ${formData.phone}`);
  }, [formData.phone]);

  useEffect(() => {
    // Send initial SMS code when component mounts
    sendVerificationCode();
  }, [sendVerificationCode]);

  useEffect(() => {
    if (countdown > 0 && !canResend) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCanResend(true);
    }
  }, [countdown, canResend]);

  const handleResendCode = async () => {
    setIsResending(true);
    await sendVerificationCode();
    setCountdown(60);
    setCanResend(false);
    setIsResending(false);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (code.length !== 6) {
      toast.error('Please enter a 6-digit code');
      return;
    }

    // TODO: Verify code with backend
    console.log('Verifying code:', code);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock verification (in production, verify against database)
    if (code === '123456' || code.length === 6) {
      updateFormData({
        phoneVerified: true,
        verificationCode: code,
      });
      toast.success('Phone number verified successfully!');
      onNext();
    } else {
      toast.error('Invalid verification code. Please try again.');
    }
  };

  const handleSkip = () => {
    updateFormData({ phoneVerified: false });
    toast.info('Phone verification skipped. You can verify later in settings.');
    onNext();
  };

  // If no phone number, allow skip
  if (!formData.phone) {
    updateFormData({ phoneVerified: false });
    onNext();
    return null;
  }

  return (
    <form onSubmit={handleVerify} className="space-y-6">
      <div className="flex justify-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Smartphone className="w-8 h-8 text-primary" />
        </div>
      </div>

      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          We've sent a 6-digit verification code to
        </p>
        <p className="font-medium">{formData.phone}</p>
        <p className="text-xs text-muted-foreground">
          Please enter the code below to verify your phone number
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col items-center space-y-2">
          <Label>Verification Code</Label>
          <InputOTP
            maxLength={6}
            value={code}
            onChange={(value) => setCode(value)}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <div className="text-center">
          {!canResend ? (
            <p className="text-sm text-muted-foreground">
              Didn't receive the code? Resend in {countdown}s
            </p>
          ) : (
            <Button
              type="button"
              variant="link"
              onClick={handleResendCode}
              disabled={isResending}
              className="text-primary"
            >
              {isResending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                'Resend Code'
              )}
            </Button>
          )}
        </div>
      </div>

      <div className="bg-muted/50 p-4 rounded-lg space-y-2">
        <p className="text-sm font-medium">Why verify your phone?</p>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>Receive instant price alerts (avg. $2.5K/month savings)</li>
          <li>Get critical notifications about vendor issues</li>
          <li>Enable two-factor authentication for security</li>
          <li>Password recovery via SMS</li>
        </ul>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button type="button" variant="ghost" onClick={handleSkip} className="flex-1">
          Skip for Now
        </Button>
        <Button type="submit" className="flex-1" disabled={code.length !== 6}>
          Verify
        </Button>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        Standard messaging rates may apply. You can opt-out anytime.
      </p>
    </form>
  );
}