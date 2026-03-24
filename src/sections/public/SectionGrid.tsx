import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PostSection } from '@/types';
import { getSectionLabel, getSectionDescription } from '@/utils/helpers';

gsap.registerPlugin(ScrollTrigger);

interface SectionGridProps {
  section: PostSection;
  pill: string;
  images: string[];
  zIndex: number;
}

export function SectionGrid({ section, pill, images, zIndex }: SectionGridProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const cardARef = useRef<HTMLDivElement>(null);
  const cardBRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const cardDRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);

  const title = getSectionLabel(section);
  const description = getSectionDescription(section);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: '+=130%',
          pin: true,
          scrub: 0.6,
        },
      });

      // ENTRANCE (0% - 30%)
      // Card A from left
      scrollTl.fromTo(
        cardARef.current,
        { x: '-50vw', opacity: 0 },
        { x: 0, opacity: 1, ease: 'none' },
        0
      );

      // Card B from right
      scrollTl.fromTo(
        cardBRef.current,
        { x: '50vw', opacity: 0 },
        { x: 0, opacity: 1, ease: 'none' },
        0
      );

      // Headline from bottom
      scrollTl.fromTo(
        headlineRef.current,
        { y: '40vh', opacity: 0 },
        { y: 0, opacity: 1, ease: 'none' },
        0.05
      );

      // Card D from bottom
      scrollTl.fromTo(
        cardDRef.current,
        { y: '60vh', opacity: 0 },
        { y: 0, opacity: 1, ease: 'none' },
        0.05
      );

      // Pill fade in
      scrollTl.fromTo(
        pillRef.current,
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, ease: 'none' },
        0.1
      );

      // SETTLE (30% - 70%) - hold positions

      // EXIT (70% - 100%)
      scrollTl.fromTo(
        cardARef.current,
        { x: 0, opacity: 1 },
        { x: '-18vw', opacity: 0.25, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(
        cardBRef.current,
        { x: 0, opacity: 1 },
        { x: '18vw', opacity: 0.25, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(
        headlineRef.current,
        { y: 0, opacity: 1 },
        { y: '12vh', opacity: 0.2, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(
        cardDRef.current,
        { y: 0, opacity: 1 },
        { y: '18vh', opacity: 0.25, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(
        pillRef.current,
        { opacity: 1 },
        { opacity: 0, ease: 'power2.in' },
        0.8
      );
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-screen bg-[#F6F7F9] overflow-hidden"
      style={{ zIndex }}
    >
      {/* Card A - Top Left */}
      <div
        ref={cardARef}
        className="absolute left-[6vw] top-[10vh] w-[44vw] h-[38vh] rounded-[28px] overflow-hidden shadow-[0_18px_50px_rgba(11,13,16,0.10)]"
      >
        <img
          src={images[0]}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Card B - Top Right */}
      <div
        ref={cardBRef}
        className="absolute left-[52vw] top-[10vh] w-[42vw] h-[38vh] rounded-[28px] overflow-hidden shadow-[0_18px_50px_rgba(11,13,16,0.10)]"
      >
        <img
          src={images[1]}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Headline Block - Bottom Left */}
      <div
        ref={headlineRef}
        className="absolute left-[6vw] top-[54vh] w-[44vw]"
      >
        <h2 className="text-[clamp(34px,3.6vw,56px)] font-semibold text-[#0B0D10] tracking-[-0.02em] leading-tight">
          {title}
        </h2>
        <p className="mt-4 text-lg text-[#6D727A] max-w-[36vw]">
          {description}
        </p>
        <div className="mt-6">
          <Link to={`/section/${section}`}>
            <Button
              variant="outline"
              className="rounded-full border-[#0B0D10] text-[#0B0D10] hover:bg-[#0B0D10] hover:text-[#F6F7F9]"
            >
              Explore
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Card D - Bottom Right */}
      <div
        ref={cardDRef}
        className="absolute left-[52vw] top-[54vh] w-[42vw] h-[36vh] rounded-[28px] overflow-hidden shadow-[0_18px_50px_rgba(11,13,16,0.10)]"
      >
        <img
          src={images[2]}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Pill */}
      <div
        ref={pillRef}
        className="absolute left-[6vw] top-[92vh]"
      >
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[rgba(11,13,16,0.08)] text-xs font-mono uppercase tracking-[0.08em] text-[#6D727A]">
          <span className="w-2 h-2 rounded-full bg-[#B8B1F5]" />
          {pill}
        </span>
      </div>
    </section>
  );
}
