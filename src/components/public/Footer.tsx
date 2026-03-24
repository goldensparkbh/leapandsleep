import { Link } from 'react-router-dom';
import { Twitter, Facebook, Instagram, Youtube, Linkedin } from 'lucide-react';
import { BrandLogo } from '@/components/shared/BrandLogo';
import { NewsletterForm } from '@/components/shared/NewsletterForm';
import { useData } from '@/contexts/DataContext';
import { SITE_SECTIONS } from '@/constants/sections';
import { getSectionLabel } from '@/utils/helpers';

export function Footer() {
  const { siteSettings } = useData();

  const sectionLinks = SITE_SECTIONS.map((section) => ({
    label: getSectionLabel(section),
    href: `/section/${section}`,
  }));

  const legalLinks = [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Affiliate Disclosure', href: '/affiliate-disclosure' },
    { label: 'Cookie Policy', href: '/cookies' },
  ];

  const socialLinks = [
    { icon: Twitter, href: siteSettings.socialLinks.twitter, label: 'Twitter' },
    { icon: Facebook, href: siteSettings.socialLinks.facebook, label: 'Facebook' },
    { icon: Instagram, href: siteSettings.socialLinks.instagram, label: 'Instagram' },
    { icon: Youtube, href: siteSettings.socialLinks.youtube, label: 'YouTube' },
    { icon: Linkedin, href: siteSettings.socialLinks.linkedin, label: 'LinkedIn' },
  ].filter(link => link.href);

  return (
    <footer className="bg-[#F6F7F9] border-t border-[rgba(11,13,16,0.08)]">
      <div className="w-full px-6 lg:px-10 py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-6">
            <BrandLogo className="inline-flex" imageClassName="h-11" />
            <p className="text-[#6D727A] text-sm max-w-xs">
              {siteSettings.tagline}
            </p>
            <div className="space-y-2">
              <p className="text-sm text-[#0B0D10] font-medium">Contact</p>
              <a
                href="mailto:hello@leapandsleep.com"
                className="text-sm text-[#6D727A] transition-colors hover:text-[#0B0D10]"
              >
                hello@leapandsleep.com
              </a>
            </div>

            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(11,13,16,0.08)] text-[#6D727A] transition-colors hover:border-[#0B0D10] hover:text-[#0B0D10]"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="grid grid-cols-2 gap-8 lg:col-span-4">
            <div className="space-y-4">
              <p className="text-sm font-medium text-[#0B0D10]">Sections</p>
              <nav className="flex flex-col gap-3">
                {sectionLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="text-sm text-[#6D727A] transition-colors hover:text-[#0B0D10]"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="space-y-4">
              <p className="text-sm font-medium text-[#0B0D10]">Legal</p>
              <nav className="flex flex-col gap-3">
                {legalLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="text-sm text-[#6D727A] transition-colors hover:text-[#0B0D10]"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          {/* Newsletter Column */}
          <div className="space-y-4 lg:col-span-4">
            <p className="text-sm font-medium text-[#0B0D10]">Stay updated</p>
            <p className="text-sm text-[#6D727A]">
              One email a week. Tools, tactics, and calm strategies for online income.
            </p>
            <NewsletterForm variant="minimal" />
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-[rgba(11,13,16,0.08)] pt-8 sm:flex-row">
          <p className="text-sm text-[#6D727A]">
            (c) {new Date().getFullYear()} {siteSettings.siteName}. All rights reserved.
          </p>
          <p className="text-xs text-[#6D727A]">
            {siteSettings.affiliateDisclaimer}
          </p>
        </div>
      </div>
    </footer>
  );
}
