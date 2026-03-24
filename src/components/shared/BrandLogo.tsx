import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { cn } from '@/lib/utils';

interface BrandLogoProps {
  to?: string;
  className?: string;
  imageClassName?: string;
  textClassName?: string;
}

export function BrandLogo({
  to = '/',
  className,
  imageClassName,
  textClassName,
}: BrandLogoProps) {
  const { siteSettings } = useData();
  const [hasImageError, setHasImageError] = useState(false);
  const showImage = Boolean(siteSettings.logo) && !hasImageError;

  return (
    <Link
      to={to}
      aria-label={siteSettings.siteName}
      className={cn('inline-flex items-center transition-opacity hover:opacity-80', className)}
    >
      {showImage ? (
        <img
          src={siteSettings.logo}
          alt={siteSettings.siteName}
          className={cn('h-9 w-auto object-contain', imageClassName)}
          onError={() => setHasImageError(true)}
        />
      ) : (
        <span
          className={cn(
            'font-mono text-sm uppercase tracking-[0.08em] text-[#0B0D10]',
            textClassName
          )}
        >
          {siteSettings.siteName}
        </span>
      )}
    </Link>
  );
}
