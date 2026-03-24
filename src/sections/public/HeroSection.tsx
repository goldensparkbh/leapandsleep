import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

gsap.registerPlugin(ScrollTrigger);

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const subheadlineRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);
  const socialRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Auto-play entrance animation
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

      // Image card entrance
      tl.fromTo(
        imageRef.current,
        { opacity: 0, scale: 0.96, x: '-6vw' },
        { opacity: 1, scale: 1, x: 0, duration: 1 },
        0
      );

      // Headline entrance
      tl.fromTo(
        headlineRef.current?.querySelectorAll('.word') || [],
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.05 },
        0.2
      );

      // Subheadline entrance
      tl.fromTo(
        subheadlineRef.current,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.5 },
        0.4
      );

      // CTA entrance
      tl.fromTo(
        ctaRef.current,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.5 },
        0.5
      );

      // Meta pill entrance
      tl.fromTo(
        metaRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.4 },
        0.6
      );

      // Social proof entrance
      tl.fromTo(
        socialRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.4 },
        0.7
      );

      // Scroll-driven exit animation
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=130%',
          pin: true,
          scrub: 0.6,
          onLeaveBack: () => {
            // Reset all elements to visible when scrolling back to top
            gsap.set([imageRef.current, headlineRef.current, subheadlineRef.current, ctaRef.current, metaRef.current, socialRef.current], {
              opacity: 1,
              x: 0,
              y: 0,
              scale: 1,
            });
          },
        },
      });

      // EXIT phase (70% - 100%)
      scrollTl.fromTo(
        headlineRef.current,
        { x: 0, opacity: 1 },
        { x: '18vw', opacity: 0, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(
        subheadlineRef.current,
        { x: 0, opacity: 1 },
        { x: '12vw', opacity: 0, ease: 'power2.in' },
        0.72
      );

      scrollTl.fromTo(
        ctaRef.current,
        { y: 0, opacity: 1 },
        { y: '6vh', opacity: 0, ease: 'power2.in' },
        0.72
      );

      scrollTl.fromTo(
        imageRef.current,
        { x: 0, scale: 1, opacity: 1 },
        { x: '-18vw', scale: 0.98, opacity: 0.35, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(
        [metaRef.current, socialRef.current],
        { opacity: 1 },
        { opacity: 0, ease: 'power2.in' },
        0.8
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-screen bg-[#F6F7F9] overflow-hidden z-10"
    >
      {/* Hero Image Card */}
      <div
        ref={imageRef}
        className="absolute left-[6vw] top-[14vh] w-[34vw] h-[72vh] rounded-[28px] overflow-hidden shadow-[0_18px_50px_rgba(11,13,16,0.10)]"
      >
        <img
          src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=1000&fit=crop"
          alt="Modern workspace"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content Block */}
      <div className="absolute left-[46vw] top-[18vh] w-[48vw]">
        {/* Headline */}
        <div ref={headlineRef}>
          <h1 className="text-[clamp(44px,5vw,78px)] font-semibold text-[#0B0D10] leading-[0.95] tracking-[-0.02em]">
            <span className="word inline-block">Take</span>{' '}
            <span className="word inline-block">the</span>{' '}
            <span className="word inline-block text-[#B8B1F5]">leap</span>
          </h1>
        </div>

        {/* Subheadline */}
        <p
          ref={subheadlineRef}
          className="mt-8 text-lg lg:text-xl text-[#6D727A] max-w-[34vw] leading-relaxed"
        >
          A modern guide to passive income, AI tools, and online business.
        </p>

        {/* CTA Row */}
        <div ref={ctaRef} className="mt-10 flex items-center gap-4">
          <Link to="/start-here">
            <Button
              size="lg"
              className="bg-[#B8B1F5] text-[#0B0D10] hover:bg-[#a59eef] rounded-full px-8 h-12 text-base font-medium"
            >
              Start here
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
          <Link to="/tools">
            <Button
              variant="ghost"
              size="lg"
              className="text-[#0B0D10] hover:text-[#B8B1F5] hover:bg-transparent rounded-full px-6 h-12"
            >
              Browse tools
            </Button>
          </Link>
        </div>
      </div>

      {/* Meta Pill */}
      <div
        ref={metaRef}
        className="absolute left-[46vw] top-[74vh] flex items-center gap-2"
      >
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[rgba(11,13,16,0.08)] text-xs font-mono uppercase tracking-[0.08em] text-[#6D727A]">
          <span className="w-2 h-2 rounded-full bg-[#B8B1F5]" />
          Updated Aug 2025
        </span>
      </div>

      {/* Social Proof */}
      <p
        ref={socialRef}
        className="absolute left-[46vw] top-[80vh] text-sm text-[#6D727A] max-w-[40vw]"
      >
        Join <span className="text-[#0B0D10] font-medium">40,000+</span> readers building calm, automated income.
      </p>
    </section>
  );
}
