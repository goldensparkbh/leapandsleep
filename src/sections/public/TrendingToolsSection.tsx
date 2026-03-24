import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, ExternalLink, Star } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import type { Tool } from '@/types';

gsap.registerPlugin(ScrollTrigger);

function ToolCard({ tool }: { tool: Tool }) {
  return (
    <div className="flex-shrink-0 w-[280px] lg:w-[22vw] group cursor-pointer">
      <Link to={`/tools/${tool.slug}`}>
        <div className="h-[34vh] rounded-[28px] overflow-hidden bg-white shadow-[0_18px_50px_rgba(11,13,16,0.10)] border border-[rgba(11,13,16,0.08)] p-6 flex flex-col transition-transform duration-300 group-hover:-translate-y-1.5">
          {/* Logo */}
          <div className="w-14 h-14 rounded-2xl overflow-hidden mb-4">
            <img
              src={tool.logo}
              alt={tool.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content */}
          <h3 className="text-lg font-semibold text-[#0B0D10] mb-2 group-hover:text-[#B8B1F5] transition-colors">
            {tool.name}
          </h3>
          <p className="text-sm text-[#6D727A] line-clamp-2 mb-4 flex-1">
            {tool.shortDescription}
          </p>

          {/* Rating & CTA */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-[#B8B1F5] text-[#B8B1F5]" />
              <span className="text-sm font-medium text-[#0B0D10]">{tool.editorRating}</span>
            </div>
            <span className="flex items-center gap-1 text-sm text-[#B8B1F5]">
              Visit
              <ExternalLink className="w-3 h-3" />
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}

export function TrendingToolsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const { getFeaturedTools } = useData();
  const tools = getFeaturedTools();

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    gsap.set(header, { opacity: 0, y: 18 });

    const animation = gsap.to(header, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: header,
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    });

    return () => {
      animation.kill();
      ScrollTrigger.getAll()
        .filter(st => st.trigger === header)
        .forEach(st => st.kill());
    };
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const scrollWidth = track.scrollWidth - section.offsetWidth + 100;
    if (scrollWidth <= 0) return;

    const animation = gsap.to(track, {
      x: -scrollWidth,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top 60%',
        end: `+=${scrollWidth}`,
        scrub: 1,
      },
    });

    return () => {
      animation.kill();
      ScrollTrigger.getAll()
        .filter(st => st.trigger === section)
        .forEach(st => st.kill());
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-[#F6F7F9] py-20 lg:py-28 z-[60] overflow-hidden"
    >
      {/* Header */}
      <div ref={headerRef} className="w-full px-6 lg:px-10 mb-10">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl lg:text-4xl font-semibold text-[#0B0D10] tracking-[-0.02em]">
            Trending tools
          </h2>
          <Link
            to="/tools"
            className="flex items-center gap-2 text-sm text-[#6D727A] hover:text-[#0B0D10] transition-colors"
          >
            View all
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Horizontal Track */}
      <div
        ref={trackRef}
        className="flex gap-6 pl-6 lg:pl-10 pr-6"
      >
        {tools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </section>
  );
}
