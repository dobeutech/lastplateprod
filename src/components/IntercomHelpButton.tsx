import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIntercom } from '@/lib/intercom';
import { cn } from '@/lib/utils';

interface IntercomHelpButtonProps {
  variant?: 'default' | 'outline' | 'ghost' | 'floating';
  className?: string;
  text?: string;
}

export function IntercomHelpButton({ 
  variant = 'default', 
  className,
  text = 'Get Help'
}: IntercomHelpButtonProps) {
  const { show } = useIntercom();

  if (variant === 'floating') {
    return (
      <button
        onClick={show}
        className={cn(
          'fixed bottom-6 right-6 z-50',
          'w-14 h-14 rounded-full',
          'bg-primary text-primary-foreground',
          'shadow-elegant hover:shadow-glow',
          'flex items-center justify-center',
          'transition-all duration-300',
          'hover:scale-110',
          'md:bottom-8 md:right-8',
          className
        )}
        aria-label="Open support chat"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    );
  }

  return (
    <Button
      variant={variant === 'default' ? 'default' : variant}
      onClick={show}
      className={cn('gap-2', className)}
    >
      <MessageCircle className="h-4 w-4" />
      {text}
    </Button>
  );
}
