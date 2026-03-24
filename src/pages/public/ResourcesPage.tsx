import { Link } from 'react-router-dom';
import { Download, FileText, ListChecks, Calculator, BookOpen, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SEO } from '@/components/shared/SEO';
import { useData } from '@/contexts/DataContext';
import type { Resource } from '@/types';

const typeIcons: Record<string, React.ReactNode> = {
  template: <FileText className="w-5 h-5" />,
  planner: <BookOpen className="w-5 h-5" />,
  checklist: <ListChecks className="w-5 h-5" />,
  guide: <BookOpen className="w-5 h-5" />,
  calculator: <Calculator className="w-5 h-5" />,
};

const typeLabels: Record<string, string> = {
  template: 'Template',
  planner: 'Planner',
  checklist: 'Checklist',
  guide: 'Guide',
  calculator: 'Calculator',
};

export function ResourcesPage() {
  const { getFeaturedResources } = useData();
  const resources = getFeaturedResources();

  return (
    <>
      <SEO
        title="Resources"
        description="Free templates, planners, checklists, and guides to help you build passive income and online business."
      />

      <div className="min-h-screen bg-[#F6F7F9] pt-24 pb-20">
        <div className="w-full px-6 lg:px-10">
          {/* Header */}
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h1 className="text-4xl lg:text-5xl font-semibold text-[#0B0D10] tracking-[-0.02em] mb-6">
              Resource Library
            </h1>
            <p className="text-xl text-[#6D727A] max-w-2xl mx-auto">
              Free templates, planners, and guides to accelerate your journey to financial freedom.
            </p>
          </div>

          {/* Resources Grid */}
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>

          {/* Coming Soon */}
          <div className="max-w-2xl mx-auto text-center mt-16">
            <p className="text-[#6D727A] mb-4">
              More resources coming soon. Subscribe to get notified.
            </p>
            <Link to="/">
              <Button variant="outline" className="rounded-full">
                Subscribe to Newsletter
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

function ResourceCard({ resource }: { resource: Resource }) {
  return (
    <div className="group bg-white rounded-[28px] overflow-hidden shadow-[0_18px_50px_rgba(11,13,16,0.10)] border border-[rgba(11,13,16,0.08)] transition-transform duration-300 hover:-translate-y-1.5">
      {/* Image */}
      <div className="aspect-[16/10] overflow-hidden">
        <img
          src={resource.image}
          alt={resource.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-[#B8B1F5]">{typeIcons[resource.type]}</span>
          <Badge variant="secondary" className="bg-[#F6F7F9] text-[#6D727A]">
            {typeLabels[resource.type]}
          </Badge>
        </div>

        <h3 className="text-lg font-semibold text-[#0B0D10] mb-2 group-hover:text-[#B8B1F5] transition-colors">
          {resource.title}
        </h3>

        <p className="text-sm text-[#6D727A] mb-4">{resource.description}</p>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-sm text-[#6D727A]">
            <Download className="w-4 h-4" />
            {resource.downloadCount.toLocaleString()} downloads
          </span>
          <Button
            size="sm"
            className="bg-[#B8B1F5] text-[#0B0D10] hover:bg-[#a59eef] rounded-full"
          >
            Download
          </Button>
        </div>
      </div>
    </div>
  );
}