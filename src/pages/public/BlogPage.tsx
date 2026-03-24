import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { SEO } from '@/components/shared/SEO';
import { useData } from '@/contexts/DataContext';
import { getCanonicalSection, SITE_SECTIONS } from '@/constants/sections';
import { formatDate, getSectionLabel } from '@/utils/helpers';
import type { Post } from '@/types';

export function BlogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const { publishedPosts, isLoading } = useData();

  const sectionFilterParam = searchParams.get('section');
  const sectionFilter = sectionFilterParam ? getCanonicalSection(sectionFilterParam) : null;

  const filteredPosts = publishedPosts.filter((post) => {
    if (sectionFilter && post.section !== sectionFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        post.title.toLowerCase().includes(query) ||
        post.summary.toLowerCase().includes(query) ||
        post.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }
    return true;
  });

  const clearFilters = () => {
    setSearchParams({});
    setSearchQuery('');
  };

  return (
    <>
      <SEO
        title="Blog"
        description="Explore our latest articles on passive income, AI tools, online business, and automation strategies."
      />

      <div className="min-h-screen bg-[#F6F7F9] pt-24 pb-20">
        <div className="w-full px-6 lg:px-10">
          {/* Header */}
          <div className="max-w-4xl mb-12">
            <h1 className="text-4xl lg:text-5xl font-semibold text-[#0B0D10] tracking-[-0.02em] mb-4">
              Blog
            </h1>
            <p className="text-lg text-[#6D727A]">
              Insights, strategies, and tools for building calm, automated income.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-10">
            <div className="flex-1 max-w-md">
              <Input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white border-[rgba(11,13,16,0.08)] rounded-full"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {SITE_SECTIONS.map((section) => (
                <button
                  key={section}
                  onClick={() => {
                    if (sectionFilter === section) {
                      searchParams.delete('section');
                    } else {
                      searchParams.set('section', section);
                    }
                    setSearchParams(searchParams);
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    sectionFilter === section
                      ? 'bg-[#B8B1F5] text-[#0B0D10]'
                      : 'bg-white text-[#6D727A] hover:text-[#0B0D10] border border-[rgba(11,13,16,0.08)]'
                  }`}
                >
                  {getSectionLabel(section)}
                </button>
              ))}
              {(sectionFilter || searchQuery) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-[#6D727A]"
                >
                  Clear filters
                </Button>
              )}
            </div>
          </div>

          {/* Posts Grid */}
          {isLoading ? (
            <div className="text-center py-20 text-[#6D727A]">Loading articles...</div>
          ) : filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-[#6D727A] mb-4">No articles found matching your criteria.</p>
              <Button onClick={clearFilters} variant="outline">
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function BlogCard({ post }: { post: Post }) {
  return (
    <Link to={`/blog/${post.slug}`}>
      <article className="group bg-white rounded-[28px] overflow-hidden shadow-[0_18px_50px_rgba(11,13,16,0.10)] border border-[rgba(11,13,16,0.08)] transition-transform duration-300 hover:-translate-y-1.5">
        {/* Image */}
        <div className="aspect-[16/10] overflow-hidden">
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <Badge variant="secondary" className="bg-[#F6F7F9] text-[#B8B1F5] hover:bg-[#F6F7F9]">
              {getSectionLabel(post.section)}
            </Badge>
            <span className="flex items-center gap-1 text-xs text-[#6D727A]">
              <Clock className="w-3 h-3" />
              {post.readingTime} min
            </span>
          </div>

          <h3 className="text-lg font-semibold text-[#0B0D10] mb-2 line-clamp-2 group-hover:text-[#B8B1F5] transition-colors">
            {post.title}
          </h3>

          <p className="text-sm text-[#6D727A] line-clamp-2 mb-4">
            {post.summary}
          </p>

          <div className="flex items-center justify-between">
            <span className="text-sm text-[#6D727A]">{formatDate(post.publishDate)}</span>
            <ArrowRight className="w-4 h-4 text-[#6D727A] group-hover:text-[#B8B1F5] transition-colors" />
          </div>
        </div>
      </article>
    </Link>
  );
}
