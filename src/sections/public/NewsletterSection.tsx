import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { NewsletterForm } from '@/components/shared/NewsletterForm';

gsap.registerPlugin(ScrollTrigger);

export function NewsletterSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=130%',
          pin: true,
          scrub: 0.6,
        },
      });

      // ENTRANCE (0% - 30%)
      // Image from left
      scrollTl.fromTo(
        imageRef.current,
        { x: '-60vw', opacity: 0 },
        { x: 0, opacity: 1, ease: 'none' },
        0
      );

      // Content from right
      scrollTl.fromTo(
        contentRef.current,
        { x: '50vw', opacity: 0 },
        { x: 0, opacity: 1, ease: 'none' },
        0
      );

      // Form from bottom
      scrollTl.fromTo(
        formRef.current,
        { y: '18vh', opacity: 0 },
        { y: 0, opacity: 1, ease: 'none' },
        0.1
      );

      // Pill fade in
      scrollTl.fromTo(
        pillRef.current,
        { opacity: 0 },
        { opacity: 1, ease: 'none' },
        0.15
      );

      // SETTLE (30% - 70%) - hold

      // EXIT (70% - 100%)
      scrollTl.fromTo(
        imageRef.current,
        { x: 0, opacity: 1 },
        { x: '-18vw', opacity: 0.25, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(
        contentRef.current,
        { x: 0, opacity: 1 },
        { x: '12vw', opacity: 0.2, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(
        formRef.current,
        { y: 0, opacity: 1 },
        { y: '6vh', opacity: 0, ease: 'power2.in' },
        0.75
      );

      scrollTl.fromTo(
        pillRef.current,
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
      className="relative w-full h-screen bg-[#0B0D10] overflow-hidden z-[100]"
    >
      {/* Left Image Card */}
      <div
        ref={imageRef}
        className="absolute left-[6vw] top-[14vh] w-[34vw] h-[72vh] rounded-[28px] overflow-hidden"
      >
        <img
          src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=1000&fit=crop"
          alt="Newsletter"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right Content */}
      <div
        ref={contentRef}
        className="absolute left-[46vw] top-[20vh] w-[48vw]"
      >
        <h2 className="text-[clamp(34px,3.6vw,56px)] font-semibold text-[#F6F7F9] tracking-[-0.02em] leading-tight mb-4">
          Earn while you <span className="text-[#B8B1F5]">sleep</span>
        </h2>
        <p className="text-lg text-[#6D727A] max-w-md mb-8">
          One email a week. Tools, tactics, and calm strategies for online income.
        </p>

        {/* Form */}
        <div ref={formRef} className="max-w-md">
          <NewsletterForm variant="dark" showLabel={false} />
          <p className="mt-3 text-xs text-[#6D727A]">
            No spam. Unsubscribe anytime.
          </p>
        </div>
      </div>

      {/* Pill */}
      <div
        ref={pillRef}
        className="absolute left-[46vw] top-[74vh]"
      >
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(246,247,249,0.1)] border border-[rgba(246,247,249,0.2)] text-xs font-mono uppercase tracking-[0.08em] text-[#6D727A]">
          <span className="w-2 h-2 rounded-full bg-[#B8B1F5]" />
          Free
        </span>
      </div>
    </section>
  );
}
