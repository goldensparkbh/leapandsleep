import { SEO } from '@/components/shared/SEO';

export function PrivacyPage() {
  return (
    <>
      <SEO title="Privacy Policy" description="LeapAndSleep Privacy Policy" />
      <LegalLayout title="Privacy Policy">
        <p className="text-[#6D727A] mb-4">
          At LeapAndSleep, we take your privacy seriously. This Privacy Policy explains how we 
          collect, use, and protect your personal information.
        </p>
        
        <h2 className="text-xl font-semibold text-[#0B0D10] mt-8 mb-4">Information We Collect</h2>
        <p className="text-[#6D727A] mb-4">
          We collect information you provide directly to us, such as when you subscribe to our 
          newsletter, contact us, or use our services. This may include your name, email address, 
          and any other information you choose to provide.
        </p>
        
        <h2 className="text-xl font-semibold text-[#0B0D10] mt-8 mb-4">How We Use Your Information</h2>
        <p className="text-[#6D727A] mb-4">
          We use the information we collect to provide, maintain, and improve our services, 
          to communicate with you, and to personalize your experience.
        </p>
        
        <h2 className="text-xl font-semibold text-[#0B0D10] mt-8 mb-4">Cookies</h2>
        <p className="text-[#6D727A] mb-4">
          We use cookies and similar technologies to enhance your experience on our website. 
          You can control cookies through your browser settings.
        </p>
        
        <h2 className="text-xl font-semibold text-[#0B0D10] mt-8 mb-4">Contact Us</h2>
        <p className="text-[#6D727A]">
          If you have any questions about this Privacy Policy, please contact us at{' '}
          <a href="mailto:hello@leapandsleep.com" className="text-[#B8B1F5] hover:underline">
            hello@leapandsleep.com
          </a>
          .
        </p>
      </LegalLayout>
    </>
  );
}

export function TermsPage() {
  return (
    <>
      <SEO title="Terms of Service" description="LeapAndSleep Terms of Service" />
      <LegalLayout title="Terms of Service">
        <p className="text-[#6D727A] mb-4">
          By accessing and using LeapAndSleep, you agree to be bound by these Terms of Service.
        </p>
        
        <h2 className="text-xl font-semibold text-[#0B0D10] mt-8 mb-4">Use of Content</h2>
        <p className="text-[#6D727A] mb-4">
          All content on this website is for informational purposes only. You may not reproduce, 
          distribute, or transmit any content without our prior written permission.
        </p>
        
        <h2 className="text-xl font-semibold text-[#0B0D10] mt-8 mb-4">Affiliate Disclosure</h2>
        <p className="text-[#6D727A] mb-4">
          Some links on this website are affiliate links. We may earn a commission if you make 
          a purchase through these links, at no additional cost to you.
        </p>
        
        <h2 className="text-xl font-semibold text-[#0B0D10] mt-8 mb-4">Disclaimer</h2>
        <p className="text-[#6D727A] mb-4">
          The information provided on this website does not constitute financial advice. 
          Results may vary and depend on individual effort and circumstances.
        </p>
        
        <h2 className="text-xl font-semibold text-[#0B0D10] mt-8 mb-4">Contact</h2>
        <p className="text-[#6D727A]">
          For questions about these terms, contact us at{' '}
          <a href="mailto:hello@leapandsleep.com" className="text-[#B8B1F5] hover:underline">
            hello@leapandsleep.com
          </a>
          .
        </p>
      </LegalLayout>
    </>
  );
}

export function AffiliateDisclosurePage() {
  return (
    <>
      <SEO title="Affiliate Disclosure" description="LeapAndSleep Affiliate Disclosure" />
      <LegalLayout title="Affiliate Disclosure">
        <p className="text-[#6D727A] mb-4">
          LeapAndSleep is reader-supported. When you purchase through links on our site, we may 
          earn an affiliate commission at no additional cost to you.
        </p>
        
        <h2 className="text-xl font-semibold text-[#0B0D10] mt-8 mb-4">What This Means</h2>
        <p className="text-[#6D727A] mb-4">
          We recommend products and services that we believe will provide value to our readers. 
          Some of these recommendations include affiliate links, which means we may receive a 
          small commission if you make a purchase.
        </p>
        
        <h2 className="text-xl font-semibold text-[#0B0D10] mt-8 mb-4">Our Commitment</h2>
        <p className="text-[#6D727A] mb-4">
          Our recommendations are based on thorough research and personal experience. We never 
          let affiliate relationships influence our editorial content or recommendations. We 
          only recommend products we genuinely believe in.
        </p>
        
        <h2 className="text-xl font-semibold text-[#0B0D10] mt-8 mb-4">Transparency</h2>
        <p className="text-[#6D727A]">
          We believe in full transparency. Affiliate links are clearly marked, and we disclose 
          our affiliate relationships upfront. If you have any questions about our affiliate 
          relationships, please contact us.
        </p>
      </LegalLayout>
    </>
  );
}

export function CookiePolicyPage() {
  return (
    <>
      <SEO title="Cookie Policy" description="LeapAndSleep Cookie Policy" />
      <LegalLayout title="Cookie Policy">
        <p className="text-[#6D727A] mb-4">
          This Cookie Policy explains how LeapAndSleep uses cookies and similar technologies.
        </p>
        
        <h2 className="text-xl font-semibold text-[#0B0D10] mt-8 mb-4">What Are Cookies</h2>
        <p className="text-[#6D727A] mb-4">
          Cookies are small text files that are stored on your device when you visit a website. 
          They help websites remember your preferences and improve your browsing experience.
        </p>
        
        <h2 className="text-xl font-semibold text-[#0B0D10] mt-8 mb-4">How We Use Cookies</h2>
        <p className="text-[#6D727A] mb-4">
          We use cookies to understand how you use our website, to improve your experience, 
          and to personalize content and advertisements.
        </p>
        
        <h2 className="text-xl font-semibold text-[#0B0D10] mt-8 mb-4">Managing Cookies</h2>
        <p className="text-[#6D727A]">
          You can control cookies through your browser settings. Please note that disabling 
          cookies may affect the functionality of our website.
        </p>
      </LegalLayout>
    </>
  );
}

function LegalLayout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F6F7F9] pt-24 pb-20">
      <div className="w-full px-6 lg:px-10">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl lg:text-5xl font-semibold text-[#0B0D10] tracking-[-0.02em] mb-10">
            {title}
          </h1>
          <div className="prose prose-lg max-w-none">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
