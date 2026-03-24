import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Download, FileText } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import type { Resource } from '@/types';

gsap.registerPlugin(ScrollTrigger);

function ResourceCard({ resource, index }: { resource: Resource; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    gsap.set(card, { opacity: 0, y: 40 });

    const animation = gsap.to(card, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      delay: index * 0.1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: card,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });

    return () => {
      animation.kill();
      ScrollTrigger.getAll()
        .filter(st => st.trigger === card)
        .forEach(st => st.kill());
    };
  }, [index]);

  const typeIcons: Record<string, React.ReactNode> = {
    template: <FileText className="w-4 h-4" />,
    planner: <FileText className="w-4 h-4" />,
    checklist: <FileText className="w-4 h-4" />,
    guide: <FileText className="w-4 h-4" />,
    calculator: <FileText className="w-4 h-4" />,
  };

  return (
    <div
      ref={cardRef}
      className="group cursor-pointer"
    >
      <Link to={`/resources/${resource.slug}`}>
        <div className="relative h-[52vh] rounded-[28px] overflow-hidden bg-white shadow-[0_18px_50px_rgba(11,13,16,0.10)] border border-[rgba(11,13,16,0.08)] transition-transform duration-300 group-hover:-translate-y-1.5">
          {/* Image */}
          <div className="h-[62%] overflow-hidden">
            <img
              src={resource.image}
              alt={resource.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>

          {/* Content */}
          <div className="h-[38%] p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[#B8B1F5]">{typeIcons[resource.type]}</span>
                <span className="text-xs font-mono uppercase tracking-[0.08em] text-[#6D727A]">
                  {resource.type}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-[#0B0D10] line-clamp-2 group-hover:text-[#B8B1F5] transition-colors">
                {resource.title}
              </h3>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-sm text-[#6D727A]">
                <Download className="w-4 h-4" />
                {resource.downloadCount.toLocaleString()} downloads
              </span>
              <ArrowRight className="w-4 h-4 text-[#6D727A] group-hover:text-[#B8B1F5] transition-colors" />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

export function ResourcesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const { getFeaturedResources } = useData();
  const resources = getFeaturedResources();

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

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-[#F6F7F9] py-20 lg:py-28 z-[90]"
    >
      <div className="w-full px-6 lg:px-10">
        {/* Header */}
        <div ref={headerRef} className="flex items-center justify-between mb-10">
          <h2 className="text-3xl lg:text-4xl font-semibold text-[#0B0D10] tracking-[-0.02em]">
            Resource library
          </h2>
          <Link
            to="/resources"
            className="flex items-center gap-2 text-sm text-[#6D727A] hover:text-[#0B0D10] transition-colors"
          >
            View all
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource, index) => (
            <ResourceCard key={resource.id} resource={resource} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
