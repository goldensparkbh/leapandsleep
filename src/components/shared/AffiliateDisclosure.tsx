import { Info } from 'lucide-react';

interface AffiliateDisclosureProps {
  variant?: 'inline' | 'box' | 'minimal';
  className?: string;
}

export function AffiliateDisclosure({ variant = 'box', className = '' }: AffiliateDisclosureProps) {
  const { siteSettings } = { siteSettings: { affiliateDisclaimer: 'Some links on this site are affiliate links. We may earn a commission if you make a purchase through these links, at no additional cost to you.' } };

  if (variant === 'minimal') {
    return (
      <p className={`text-xs text-[#6D727A] ${className}`}>
        * Affiliate links. <a href="/affiliate-disclosure" className="underline hover:text-[#0B0D10]">Learn more</a>
      </p>
    );
  }

  if (variant === 'inline') {
    return (
      <p className={`text-sm text-[#6D727A] ${className}`}>
        {siteSettings.affiliateDisclaimer}{' '}
        <a href="/affiliate-disclosure" className="underline hover:text-[#0B0D10]">
          Read our full disclosure
        </a>
      </p>
    );
  }

  return (
    <div className={`bg-[#F6F7F9] border border-[rgba(11,13,16,0.08)] rounded-2xl p-4 flex gap-3 ${className}`}>
      <Info className="w-5 h-5 text-[#B8B1F5] flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-sm text-[#0B0D10]">{siteSettings.affiliateDisclaimer}</p>
        <a 
          href="/affiliate-disclosure" 
          className="text-sm text-[#6D727A] underline hover:text-[#0B0D10] mt-1 inline-block"
        >
          Read our full disclosure
        </a>
      </div>
    </div>
  );
}
