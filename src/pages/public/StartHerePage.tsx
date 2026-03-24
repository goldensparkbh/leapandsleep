import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Wrench, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SEO } from '@/components/shared/SEO';
import { NewsletterForm } from '@/components/shared/NewsletterForm';

export function StartHerePage() {
  const steps = [
    {
      icon: BookOpen,
      title: 'Start the Leap',
      description: 'Begin with the fundamentals, first wins, and clear next steps.',
      link: '/section/start-the-leap',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      icon: Wrench,
      title: 'Build the Flow',
      description: 'Choose the right tools and turn them into repeatable workflows.',
      link: '/section/build-the-flow',
      color: 'bg-purple-100 text-purple-600',
    },
    {
      icon: Zap,
      title: 'Scale in Sleep',
      description: 'Layer automation and leverage so the business keeps moving offline.',
      link: '/section/scale-in-sleep',
      color: 'bg-amber-100 text-amber-600',
    },
  ];

  return (
    <>
      <SEO
        title="Start Here"
        description="New to LeapAndSleep? Start here for a step-by-step guide to building passive income and online business."
      />

      <div className="min-h-screen bg-[#F6F7F9] pt-24 pb-20">
        <div className="w-full px-6 lg:px-10">
          {/* Hero */}
          <div className="max-w-4xl mx-auto text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#B8B1F5]/20 text-[#B8B1F5] text-sm font-medium mb-6">
              Welcome to LeapAndSleep
            </span>
            <h1 className="text-4xl lg:text-6xl font-semibold text-[#0B0D10] tracking-[-0.02em] mb-6">
              Start Your Journey to <span className="text-[#B8B1F5]">Financial Freedom</span>
            </h1>
            <p className="text-xl text-[#6D727A] max-w-2xl mx-auto">
              New here? This page will guide you through everything you need to know 
              about building passive income and online business.
            </p>
          </div>

          {/* Steps */}
          <div className="max-w-5xl mx-auto mb-20">
            <h2 className="text-2xl font-semibold text-[#0B0D10] text-center mb-10">
              Your 3-Stage Path to Success
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {steps.map((step, index) => (
                <Link key={step.title} to={step.link}>
                  <div className="bg-white rounded-2xl p-6 shadow-[0_18px_50px_rgba(11,13,16,0.10)] border border-[rgba(11,13,16,0.08)] hover:-translate-y-1 transition-transform h-full">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${step.color}`}>
                        <step.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-mono text-[#6D727A]">Step {index + 1}</span>
                        </div>
                        <h3 className="text-lg font-semibold text-[#0B0D10] mb-2">{step.title}</h3>
                        <p className="text-sm text-[#6D727A]">{step.description}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Featured Content */}
          <div className="max-w-5xl mx-auto mb-20">
            <div className="bg-white rounded-[28px] p-8 lg:p-12 shadow-[0_18px_50px_rgba(11,13,16,0.10)] border border-[rgba(11,13,16,0.08)]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-2xl lg:text-3xl font-semibold text-[#0B0D10] mb-4">
                    Not Sure Where to Begin?
                  </h2>
                  <p className="text-[#6D727A] mb-6">
                    Start with our most popular beginner guide. It covers everything you need 
                    to know to start earning online, from choosing a niche to making your first dollar.
                  </p>
                  <Link to="/blog/how-to-start-earning-online">
                    <Button className="bg-[#B8B1F5] text-[#0B0D10] hover:bg-[#a59eef] rounded-full">
                      Read the Guide
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
                <div className="aspect-video rounded-2xl overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=450&fit=crop"
                    alt="Getting started"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-2xl font-semibold text-[#0B0D10] mb-4">
              Get Weekly Guidance
            </h2>
            <p className="text-[#6D727A] mb-6">
              Subscribe to our newsletter for step-by-step tips delivered to your inbox.
            </p>
            <NewsletterForm />
          </div>
        </div>
      </div>
    </>
  );
}
