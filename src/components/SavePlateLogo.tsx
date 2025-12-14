import { cn } from '@/lib/utils';

interface SavePlateLogoProps {
  variant?: 'full' | 'icon' | 'wordmark';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  color?: 'default' | 'white' | 'monochrome';
}

export function SavePlateLogo({ 
  variant = 'full', 
  size = 'md',
  className,
  color = 'default'
}: SavePlateLogoProps) {
  const sizeClasses = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-12',
    xl: 'h-16',
  };

  const iconSizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  // Color schemes
  const primaryColor = color === 'white' ? '#FFFFFF' : color === 'monochrome' ? 'currentColor' : '#10B981';
  const secondaryColor = color === 'white' ? '#FFFFFF' : color === 'monochrome' ? 'currentColor' : '#F59E0B';

  // Icon Only - Plate with upward arrow + heart
  const LogoIcon = () => (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(iconSizeClasses[size], className)}
    >
      {/* Plate base */}
      <circle cx="24" cy="28" r="16" fill={primaryColor} opacity="0.15" />
      <circle cx="24" cy="28" r="14" stroke={primaryColor} strokeWidth="2.5" fill="none" />
      
      {/* Upward arrow (reducing waste) */}
      <path
        d="M24 14V32M24 14L20 18M24 14L28 18"
        stroke={primaryColor}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Heart accent (altruism) */}
      <path
        d="M24 22C24 22 20 19 17 21C14 23 14 26 17 29C20 32 24 35 24 35C24 35 28 32 31 29C34 26 34 23 31 21C28 19 24 22 24 22Z"
        fill={secondaryColor}
        opacity="0.9"
        transform="translate(7, -10) scale(0.35)"
      />
    </svg>
  );

  // Wordmark Only
  const LogoWordmark = () => (
    <svg
      viewBox="0 0 180 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(sizeClasses[size], 'w-auto', className)}
    >
      <text
        x="0"
        y="24"
        fill={color === 'white' ? '#FFFFFF' : color === 'monochrome' ? 'currentColor' : '#1F2937'}
        fontSize="28"
        fontWeight="700"
        fontFamily="Inter, sans-serif"
        letterSpacing="-0.02em"
      >
        SavePlate
      </text>
    </svg>
  );

  // Full Logo - Icon + Wordmark
  const LogoFull = () => (
    <div className={cn('flex items-center gap-3', className)}>
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={iconSizeClasses[size]}
      >
        {/* Plate base */}
        <circle cx="24" cy="28" r="16" fill={primaryColor} opacity="0.15" />
        <circle cx="24" cy="28" r="14" stroke={primaryColor} strokeWidth="2.5" fill="none" />
        
        {/* Upward arrow (reducing waste) */}
        <path
          d="M24 14V32M24 14L20 18M24 14L28 18"
          stroke={primaryColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Heart accent (altruism) */}
        <path
          d="M24 22C24 22 20 19 17 21C14 23 14 26 17 29C20 32 24 35 24 35C24 35 28 32 31 29C34 26 34 23 31 21C28 19 24 22 24 22Z"
          fill={secondaryColor}
          opacity="0.9"
          transform="translate(7, -10) scale(0.35)"
        />
      </svg>
      <span 
        className={cn(
          'font-bold tracking-tight',
          size === 'sm' && 'text-lg',
          size === 'md' && 'text-2xl',
          size === 'lg' && 'text-3xl',
          size === 'xl' && 'text-4xl',
          color === 'white' ? 'text-white' : color === 'monochrome' ? 'text-current' : 'text-foreground'
        )}
      >
        SavePlate
      </span>
    </div>
  );

  if (variant === 'icon') return <LogoIcon />;
  if (variant === 'wordmark') return <LogoWordmark />;
  return <LogoFull />;
}