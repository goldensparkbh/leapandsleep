import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SEO } from '@/components/shared/SEO';
import { useData } from '@/contexts/DataContext';
import { getCanonicalSection } from '@/constants/sections';
import { formatDate, getSectionLabel, getSectionDescription } from '@/utils/helpers';

export function SectionPage() {
  const { section } = useParams<{ section: string }>();
  const { getPostsBySection, getFeaturedTools, isLoading } = useData();
  const canonicalSection = section ? getCanonicalSection(section) : null;

  if (section && canonicalSection && canonicalSection !== section) {
    return <Navigate to={`/section/${canonicalSection}`} replace />;
  }

  if (!canonicalSection) {
    return (
      <div className="min-h-screen bg-[#F6F7F9] pt-24 pb-20">
        <div className="w-full px-6 lg:px-10 text-center">
          <h1 className="text-4xl font-semibold text-[#0B0D10] mb-4">Section Not Found</h1>
          <p className="text-[#6D727A] mb-6">The section you&apos;re looking for doesn&apos;t exist.</p>
          <Link to="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const posts = getPostsBySection(canonicalSection);
  const title = getSectionLabel(canonicalSection);
  const description = getSectionDescription(canonicalSection);

  const featuredTools = (canonicalSection === 'build-the-flow' || canonicalSection === 'scale-in-sleep')
    ? getFeaturedTools().slice(0, 4)
    : [];

  return (
    <>
      <SEO
        title={title}
        description={description}
      />

      <div className="min-h-screen bg-[#F6F7F9] pt-24 pb-20">
        <div className="w-full px-6 lg:px-10">
          {/* Header */}
          <div className="max-w-4xl mb-12">
            <h1 className="text-4xl lg:text-5xl font-semibold text-[#0B0D10] tracking-[-0.02em] mb-4">
              {title}
            </h1>
            <p className="text-lg text-[#6D727A]">{description}</p>
          </div>

          {/* Featured Tools */}
          {featuredTools.length > 0 && (
            <div className="mb-16">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-[#0B0D10]">Featured Tools</h2>
                <Link to="/tools" className="text-sm text-[#6D727A] hover:text-[#0B0D10] flex items-center gap-1">
                  View all <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredTools.map((tool) => (
                  <Link key={tool.id} to={`/tools/${tool.slug}`}>
                    <div className="bg-white rounded-2xl p-6 shadow-[0_18px_50px_rgba(11,13,16,0.10)] border border-[rgba(11,13,16,0.08)] hover:-translate-y-1 transition-transform">
                      <div className="w-12 h-12 rounded-xl overflow-hidden mb-4">
                        <img src={tool.logo} alt={tool.name} className="w-full h-full object-cover" />
                      </div>
                      <h3 className="font-semibold text-[#0B0D10] mb-1">{tool.name}</h3>
                      <p className="text-sm text-[#6D727A] line-clamp-2">{tool.shortDescription}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Articles */}
          <div>
            <h2 className="text-2xl font-semibold text-[#0B0D10] mb-6">Latest Articles</h2>
            {isLoading ? (
              <div className="text-center py-20 bg-white rounded-[28px]">
                <p className="text-[#6D727A]">Loading articles...</p>
              </div>
            ) : posts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <Link key={post.id} to={`/blog/${post.slug}`}>
                    <article className="group bg-white rounded-[28px] overflow-hidden shadow-[0_18px_50px_rgba(11,13,16,0.10)] border border-[rgba(11,13,16,0.08)] transition-transform duration-300 hover:-translate-y-1.5">
                      <div className="aspect-[16/10] overflow-hidden">
                        <img
                          src={post.featuredImage}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-xs font-mono uppercase tracking-[0.08em] text-[#B8B1F5]">
                            {getSectionLabel(post.section)}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-[#6D727A]">
                            <Clock className="w-3 h-3" />
                            {post.readingTime} min
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-[#0B0D10] line-clamp-2 group-hover:text-[#B8B1F5] transition-colors">
                          {post.title}
                        </h3>
                        <div className="mt-4 text-sm text-[#6D727A]">{formatDate(post.publishDate)}</div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-[28px]">
                <p className="text-[#6D727A]">No articles yet in this section.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
