import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';

gsap.registerPlugin(ScrollTrigger);

export function FeaturedComparisonSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const { getFeaturedComparisons } = useData();
  const comparison = getFeaturedComparisons()[0];

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=120%',
          pin: true,
          scrub: 0.6,
        },
      });

      // ENTRANCE (0% - 30%)
      // Card from bottom
      scrollTl.fromTo(
        cardRef.current,
        { y: '80vh', scale: 0.96, opacity: 0 },
        { y: 0, scale: 1, opacity: 1, ease: 'none' },
        0
      );

      // Text from left
      scrollTl.fromTo(
        textRef.current,
        { x: '-20vw', opacity: 0 },
        { x: 0, opacity: 1, ease: 'none' },
        0.05
      );

      // Image from right
      scrollTl.fromTo(
        imageRef.current,
        { x: '20vw', opacity: 0 },
        { x: 0, opacity: 1, ease: 'none' },
        0.05
      );

      // SETTLE (30% - 70%) - hold

      // EXIT (70% - 100%)
      scrollTl.fromTo(
        cardRef.current,
        { x: 0, opacity: 1 },
        { x: '-18vw', opacity: 0.25, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(
        textRef.current,
        { y: 0, opacity: 1 },
        { y: '8vh', opacity: 0.2, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(
        imageRef.current,
        { x: 0, opacity: 1 },
        { x: '10vw', opacity: 0.25, ease: 'power2.in' },
        0.7
      );
    }, section);

    return () => ctx.revert();
  }, []);

  if (!comparison) return null;

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-screen bg-[#F6F7F9] overflow-hidden z-[70]"
    >
      {/* Large Comparison Card */}
      <div
        ref={cardRef}
        className="absolute left-[6vw] top-[12vh] w-[88vw] h-[76vh] rounded-[28px] overflow-hidden bg-white shadow-[0_18px_50px_rgba(11,13,16,0.10)] border border-[rgba(11,13,16,0.08)]"
      >
        <div className="flex h-full">
          {/* Left Text Block */}
          <div
            ref={textRef}
            className="w-[52%] p-10 lg:p-16 flex flex-col justify-center"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F6F7F9] border border-[rgba(11,13,16,0.08)] text-xs font-mono uppercase tracking-[0.08em] text-[#6D727A] mb-6 w-fit">
              <span className="w-2 h-2 rounded-full bg-[#B8B1F5]" />
              Featured Comparison
            </span>

            <h2 className="text-[clamp(28px,3vw,48px)] font-semibold text-[#0B0D10] tracking-[-0.02em] leading-tight mb-4">
              {comparison.title}
            </h2>

            <p className="text-lg text-[#6D727A] mb-8 max-w-md">
              {comparison.description}
            </p>

            <Link to={`/compare/${comparison.slug}`}>
              <Button
                size="lg"
                className="bg-[#B8B1F5] text-[#0B0D10] hover:bg-[#a59eef] rounded-full px-8 w-fit"
              >
                Read the comparison
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>

          {/* Right Image */}
          <div
            ref={imageRef}
            className="w-[48%] h-full"
          >
            <img
              src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=1000&fit=crop"
              alt={comparison.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
