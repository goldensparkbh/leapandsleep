import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Star, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { SEO } from '@/components/shared/SEO';
import { useData } from '@/contexts/DataContext';
import type { Tool } from '@/types';

export function ToolsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { tools, toolCategories } = useData();

  const filteredTools = tools.filter((tool) => {
    if (selectedCategory && tool.categoryId !== selectedCategory) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        tool.name.toLowerCase().includes(query) ||
        tool.shortDescription.toLowerCase().includes(query) ||
        tool.keyFeatures.some((f) => f.toLowerCase().includes(query))
      );
    }
    return true;
  });

  return (
    <>
      <SEO
        title="Tools Directory"
        description="Discover the best tools for building passive income, online business, and automation. Curated reviews and recommendations."
      />

      <div className="min-h-screen bg-[#F6F7F9] pt-24 pb-20">
        <div className="w-full px-6 lg:px-10">
          {/* Header */}
          <div className="max-w-4xl mb-12">
            <h1 className="text-4xl lg:text-5xl font-semibold text-[#0B0D10] tracking-[-0.02em] mb-4">
              Tools Directory
            </h1>
            <p className="text-lg text-[#6D727A]">
              Discover the best tools for building passive income and online business.
            </p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-10">
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6D727A]" />
              <Input
                type="text"
                placeholder="Search tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white border-[rgba(11,13,16,0.08)] rounded-full pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === null
                    ? 'bg-[#B8B1F5] text-[#0B0D10]'
                    : 'bg-white text-[#6D727A] hover:text-[#0B0D10] border border-[rgba(11,13,16,0.08)]'
                }`}
              >
                All
              </button>
              {toolCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() =>
                    setSelectedCategory(
                      selectedCategory === category.id ? null : category.id
                    )
                  }
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-[#B8B1F5] text-[#0B0D10]'
                      : 'bg-white text-[#6D727A] hover:text-[#0B0D10] border border-[rgba(11,13,16,0.08)]'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Tools Grid */}
          {filteredTools.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-[#6D727A] mb-4">No tools found matching your criteria.</p>
              <Button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory(null);
                }}
                variant="outline"
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function ToolCard({ tool }: { tool: Tool }) {
  const { getAffiliateLinkById, toolCategories } = useData();
  const affiliateLink = getAffiliateLinkById(tool.affiliateLinkId);
  const category = toolCategories.find((c) => c.id === tool.categoryId);

  return (
    <div className="group bg-white rounded-[28px] overflow-hidden shadow-[0_18px_50px_rgba(11,13,16,0.10)] border border-[rgba(11,13,16,0.08)] transition-transform duration-300 hover:-translate-y-1.5">
      <Link to={`/tools/${tool.slug}`}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="w-14 h-14 rounded-2xl overflow-hidden">
              <img
                src={tool.logo}
                alt={tool.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-[#B8B1F5] text-[#B8B1F5]" />
              <span className="text-sm font-medium">{tool.editorRating}</span>
            </div>
          </div>

          {/* Content */}
          <h3 className="text-lg font-semibold text-[#0B0D10] mb-1 group-hover:text-[#B8B1F5] transition-colors">
            {tool.name}
          </h3>
          <p className="text-sm text-[#6D727A] mb-3">{tool.shortDescription}</p>

          {/* Category & Pricing */}
          <div className="flex items-center gap-2 mb-4">
            {category && (
              <Badge variant="secondary" className="bg-[#F6F7F9] text-[#6D727A]">
                {category.name}
              </Badge>
            )}
            <Badge variant="outline" className="text-[#B8B1F5] border-[#B8B1F5]">
              {tool.pricingType}
            </Badge>
          </div>

          {/* Features */}
          <ul className="space-y-1 mb-4">
            {tool.keyFeatures.slice(0, 3).map((feature, index) => (
              <li key={index} className="text-sm text-[#6D727A] flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-[#B8B1F5]" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </Link>

      {/* CTA */}
      <div className="px-6 pb-6">
        <a
          href={affiliateLink?.destinationUrl || '#'}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
        >
          <Button className="w-full bg-[#B8B1F5] text-[#0B0D10] hover:bg-[#a59eef] rounded-full">
            Visit Tool
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </a>
      </div>
    </div>
  );
}
