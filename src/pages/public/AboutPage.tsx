import { SEO } from '@/components/shared/SEO';
import { NewsletterForm } from '@/components/shared/NewsletterForm';
import { useData } from '@/contexts/DataContext';

export function AboutPage() {
  const { siteSettings } = useData();

  return (
    <>
      <SEO
        title="About"
        description="Learn about LeapAndSleep - a modern guide to passive income, AI tools, and online business."
      />

      <div className="min-h-screen bg-[#F6F7F9] pt-24 pb-20">
        <div className="w-full px-6 lg:px-10">
          {/* Header */}
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h1 className="text-4xl lg:text-5xl font-semibold text-[#0B0D10] tracking-[-0.02em] mb-6">
              About {siteSettings.siteName}
            </h1>
            <p className="text-xl text-[#6D727A] max-w-2xl mx-auto">
              {siteSettings.tagline}
            </p>
          </div>

          {/* Mission */}
          <div className="max-w-4xl mx-auto mb-20">
            <div className="bg-white rounded-[28px] p-8 lg:p-12 shadow-[0_18px_50px_rgba(11,13,16,0.10)] border border-[rgba(11,13,16,0.08)]">
              <h2 className="text-2xl font-semibold text-[#0B0D10] mb-4">Our Mission</h2>
              <p className="text-[#6D727A] leading-relaxed mb-4">
                At LeapAndSleep, we believe that everyone deserves the opportunity to build 
                financial freedom through online business and passive income. Our mission is 
                to provide honest, actionable guidance that helps you navigate the world of 
                digital entrepreneurship.
              </p>
              <p className="text-[#6D727A] leading-relaxed">
                We cut through the noise and hype to bring you proven strategies, tested tools, 
                and real-world insights. No get-rich-quick schemes. No fluff. Just practical 
                advice that works.
              </p>
            </div>
          </div>

          {/* What We Cover */}
          <div className="max-w-5xl mx-auto mb-20">
            <h2 className="text-2xl font-semibold text-[#0B0D10] text-center mb-10">What We Cover</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: 'Start the Leap',
                  description: 'Foundations, first wins, and guided paths for getting your online income journey moving.',
                },
                {
                  title: 'Build the Flow',
                  description: 'Tools, workflows, and systems that help you create repeatable output without chaos.',
                },
                {
                  title: 'Scale in Sleep',
                  description: 'Automation, leverage, and compounding assets that keep working when you are offline.',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="bg-white rounded-2xl p-6 shadow-[0_18px_50px_rgba(11,13,16,0.10)] border border-[rgba(11,13,16,0.08)]"
                >
                  <h3 className="text-lg font-semibold text-[#0B0D10] mb-2">{item.title}</h3>
                  <p className="text-sm text-[#6D727A]">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Editorial Standards */}
          <div className="max-w-4xl mx-auto mb-20">
            <div className="bg-white rounded-[28px] p-8 lg:p-12 shadow-[0_18px_50px_rgba(11,13,16,0.10)] border border-[rgba(11,13,16,0.08)]">
              <h2 className="text-2xl font-semibold text-[#0B0D10] mb-4">Our Editorial Standards</h2>
              <ul className="space-y-4">
                {[
                  'We only recommend tools and strategies we have personally tested or thoroughly researched.',
                  'We are transparent about affiliate relationships and never let them influence our recommendations.',
                  'We regularly update our content to ensure accuracy and relevance.',
                  'We prioritize beginner-friendly content without sacrificing depth.',
                ].map((standard, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-[#B8B1F5] mt-2 flex-shrink-0" />
                    <span className="text-[#6D727A]">{standard}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Newsletter */}
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-2xl font-semibold text-[#0B0D10] mb-4">Join Our Community</h2>
            <p className="text-[#6D727A] mb-6">
              Subscribe to our newsletter for weekly insights on passive income and online business.
            </p>
            <NewsletterForm />
          </div>
        </div>
      </div>
    </>
  );
}
