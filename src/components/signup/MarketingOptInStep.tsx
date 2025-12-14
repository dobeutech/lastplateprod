import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { SignupFormData } from '@/pages/signup';
import { toast } from 'sonner';
import { Mail, MessageSquare, TrendingUp, Bell, DollarSign } from 'lucide-react';

interface MarketingOptInStepProps {
  formData: SignupFormData;
  updateFormData: (data: Partial<SignupFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function MarketingOptInStep({ formData, updateFormData, onNext, onBack }: MarketingOptInStepProps) {
  const [emailOptIn, setEmailOptIn] = useState(formData.emailMarketingOptIn);
  const [smsOptIn, setSmsOptIn] = useState(formData.smsMarketingOptIn);
  const [phone, setPhone] = useState(formData.phone || '');
  const [phoneError, setPhoneError] = useState('');

  const validatePhone = (phone: string) => {
    // Simple phone validation (US format)
    const phoneRegex = /^\+?1?\s*\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/;
    return phoneRegex.test(phone);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // If SMS opt-in is selected, phone is required
    if (smsOptIn && !phone.trim()) {
      setPhoneError('Phone number is required for SMS notifications');
      return;
    }

    if (smsOptIn && !validatePhone(phone)) {
      setPhoneError('Please enter a valid phone number');
      return;
    }

    updateFormData({
      emailMarketingOptIn: emailOptIn,
      smsMarketingOptIn: smsOptIn,
      phone: phone.trim() || undefined,
    });

    toast.success('Preferences saved');
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Stay informed about waste reduction tips, industry insights, and pricing changes that can save you thousands annually.
        </p>

        {/* Email Opt-in */}
        <div className="flex items-start space-x-3 p-4 rounded-lg border bg-card">
          <Checkbox
            id="emailOptIn"
            checked={emailOptIn}
            onCheckedChange={(checked) => setEmailOptIn(checked as boolean)}
            className="mt-1"
          />
          <div className="flex-1 space-y-1">
            <Label htmlFor="emailOptIn" className="font-medium cursor-pointer">
              Email Updates
            </Label>
            <p className="text-sm text-muted-foreground">
              Get weekly waste reduction tips, ROI reports, and industry best practices
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="w-3 h-3 mr-1" />
                Insights
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <DollarSign className="w-3 h-3 mr-1" />
                Savings Tips
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <Mail className="w-3 h-3 mr-1" />
                Monthly Digest
              </div>
            </div>
          </div>
        </div>

        {/* SMS Opt-in */}
        <div className="flex items-start space-x-3 p-4 rounded-lg border bg-card">
          <Checkbox
            id="smsOptIn"
            checked={smsOptIn}
            onCheckedChange={(checked) => setSmsOptIn(checked as boolean)}
            className="mt-1"
          />
          <div className="flex-1 space-y-1">
            <Label htmlFor="smsOptIn" className="font-medium cursor-pointer">
              SMS Alerts
            </Label>
            <p className="text-sm text-muted-foreground">
              Get instant alerts for price changes, vendor pricing spikes, and critical notifications
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              <div className="flex items-center text-xs text-muted-foreground">
                <Bell className="w-3 h-3 mr-1" />
                Price Alerts
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <MessageSquare className="w-3 h-3 mr-1" />
                Real-time
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <DollarSign className="w-3 h-3 mr-1" />
                Cost Savings
              </div>
            </div>
          </div>
        </div>

        {/* Conditional Phone Input */}
        {smsOptIn && (
          <div className="space-y-2 pl-11">
            <Label htmlFor="phone">
              Phone Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setPhoneError('');
              }}
              className={phoneError ? 'border-destructive' : ''}
            />
            {phoneError && <p className="text-sm text-destructive">{phoneError}</p>}
            <p className="text-xs text-muted-foreground">
              We'll send you a verification code in the next step
            </p>
          </div>
        )}
      </div>

      <div className="bg-muted/50 p-4 rounded-lg text-sm text-muted-foreground">
        <p className="font-medium text-foreground mb-2">Why stay connected?</p>
        <ul className="space-y-1 list-disc list-inside">
          <li>Average savings of $2,500/month from pricing alerts</li>
          <li>Weekly tips that reduce waste by 15-30%</li>
          <li>Early access to new features and community pricing</li>
          <li>Unsubscribe anytime with one click</li>
        </ul>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button type="submit" className="flex-1">
          {smsOptIn ? 'Continue to Verification' : 'Skip Verification'}
        </Button>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        You can change these preferences anytime in your account settings
      </p>
    </form>
  );
}
