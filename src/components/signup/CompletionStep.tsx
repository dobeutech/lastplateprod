import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { SignupFormData } from '@/pages/signup';
import { CheckCircle2, Loader2, Sparkles, TrendingUp, Users, DollarSign } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface CompletionStepProps {
  formData: SignupFormData;
}

const ONBOARDING_TASKS = [
  { id: 'log_waste', title: 'Log your first waste entry', icon: Sparkles },
  { id: 'add_location', title: 'Add your restaurant location', icon: Users },
  { id: 'connect_vendor', title: 'Connect a vendor', icon: TrendingUp },
  { id: 'view_analytics', title: 'View your waste analytics dashboard', icon: DollarSign },
];

export function CompletionStep({ formData }: CompletionStepProps) {
  const [isCreating, setIsCreating] = useState(true);
  const [accountCreated, setAccountCreated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);

  const createAccount = useCallback(async () => {
    try {
      setIsCreating(true);
      setError(null);

      // 1. Create Supabase Auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            business_name: formData.businessName,
          },
        },
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('Failed to create user account');
      }

      // 2. Update user profile in database
      const { error: profileError } = await supabase
        .from('users')
        .update({
          first_name: formData.firstName,
          last_name: formData.lastName,
          business_name: formData.businessName,
          cuisine_type: formData.cuisineType,
          num_locations: formData.locationsCount,
          phone: formData.phone,
          email_marketing_opt_in: formData.emailMarketingOptIn,
          sms_marketing_opt_in: formData.smsMarketingOptIn,
          phone_verified: formData.phoneVerified,
          oauth_provider: formData.oauthProvider,
        })
        .eq('id', authData.user.id);

      if (profileError) {
        console.error('Profile update error:', profileError);
        // Don't throw - account is created, profile update is secondary
      }

      // 3. Send welcome email (handled by Supabase triggers or Edge Function)
      // TODO: Trigger welcome email via Edge Function

      setAccountCreated(true);
      toast.success('Account created successfully!');
    } catch (err: unknown) {
      console.error('Account creation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create account');
      toast.error('Failed to create account. Please try again.');
    } finally {
      setIsCreating(false);
    }
  }, [formData]);

  useEffect(() => {
    createAccount();
  }, [createAccount]);

  const toggleTask = (taskId: string) => {
    setCompletedTasks(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleGetStarted = () => {
    // Redirect to dashboard
    window.location.href = '/';
  };

  if (isCreating) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-lg font-medium">Creating your account...</p>
        <p className="text-sm text-muted-foreground">This will only take a moment</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <span className="text-3xl">❌</span>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-destructive">Account Creation Failed</h3>
            <p className="text-sm text-muted-foreground mt-2">{error}</p>
          </div>
        </div>
        <Button onClick={createAccount} className="w-full">
          Try Again
        </Button>
      </div>
    );
  }

  if (!accountCreated) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <CheckCircle2 className="w-12 h-12 text-primary" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold">Welcome to SavePlate, {formData.firstName}!</h3>
          <p className="text-muted-foreground">
            Your account has been created successfully. Let's get started reducing waste and saving money.
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-6 rounded-lg space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h4 className="font-semibold">What's Next?</h4>
        </div>
        <p className="text-sm text-muted-foreground">
          Complete these quick tasks to get the most out of SavePlate:
        </p>
        <div className="space-y-3">
          {ONBOARDING_TASKS.map((task) => {
            const Icon = task.icon;
            const isCompleted = completedTasks.includes(task.id);
            return (
              <div
                key={task.id}
                className="flex items-center space-x-3 p-3 rounded-lg bg-background hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => toggleTask(task.id)}
              >
                <Checkbox
                  checked={isCompleted}
                  onCheckedChange={() => toggleTask(task.id)}
                />
                <Icon className={`w-5 h-5 ${isCompleted ? 'text-primary' : 'text-muted-foreground'}`} />
                <Label
                  className={`flex-1 cursor-pointer ${
                    isCompleted ? 'line-through text-muted-foreground' : ''
                  }`}
                >
                  {task.title}
                </Label>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="text-center">
          <p className="text-2xl font-bold text-primary">$30K-$80K</p>
          <p className="text-xs text-muted-foreground">Avg. Annual Savings</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-primary">15-30%</p>
          <p className="text-xs text-muted-foreground">Waste Reduction</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-primary">24/7</p>
          <p className="text-xs text-muted-foreground">Support Available</p>
        </div>
      </div>

      <Button onClick={handleGetStarted} className="w-full h-12 text-base">
        Get Started →
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        {formData.emailMarketingOptIn && 'Check your email for a welcome message with setup tips. '}
        Need help? Visit our{' '}
        <a href="/knowledge-base" className="text-primary hover:underline">
          Knowledge Base
        </a>
        {' '}or contact support.
      </p>
    </div>
  );
}