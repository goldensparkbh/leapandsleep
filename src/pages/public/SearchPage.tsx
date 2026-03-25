import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, X, Clock, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SEO } from '@/components/shared/SEO';
import { useData } from '@/contexts/DataContext';
import type { Post, Tool } from '@/types';

export function SearchPage() {
  const [query, setQuery] = useState('');
  const { publishedPosts, tools, isLoading } = useData();

  const filteredPosts = query
    ? publishedPosts.filter(
        (post) =>
          post.title.toLowerCase().includes(query.toLowerCase()) ||
          post.summary.toLowerCase().includes(query.toLowerCase()) ||
          post.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()))
      )
    : [];

  const filteredTools = query
    ? tools.filter(
        (tool) =>
          tool.name.toLowerCase().includes(query.toLowerCase()) ||
          tool.shortDescription.toLowerCase().includes(query.toLowerCase()) ||
          tool.keyFeatures.some((f) => f.toLowerCase().includes(query.toLowerCase()))
      )
    : [];

  const totalResults = filteredPosts.length + filteredTools.length;

  return (
    <>
      <SEO
        title="Search"
        description="Search articles, tools, and resources on LeapAndSleep."
      />

      <div className="min-h-screen bg-[#F6F7F9] pt-24 pb-20">
        <div className="w-full px-6 lg:px-10">
          {/* Header */}
          <div className="max-w-3xl mx-auto text-center mb-10">
            <h1 className="text-4xl lg:text-5xl font-semibold text-[#0B0D10] tracking-[-0.02em] mb-6">
              Search
            </h1>
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6D727A]" />
              <Input
                type="text"
                placeholder="Search articles, tools, and more..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="bg-white border-[rgba(11,13,16,0.08)] rounded-full pl-12 pr-12 h-14 text-lg"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                >
                  <X className="w-5 h-5 text-[#6D727A]" />
                </button>
              )}
            </div>
          </div>

          {/* Results */}
          {query && (
            <div className="max-w-4xl mx-auto">
              <p className="text-[#6D727A] mb-6">
                {totalResults} result{totalResults !== 1 ? 's' : ''} for &quot;{query}&quot;
              </p>

              {isLoading ? (
                <div className="text-center py-20 text-[#6D727A]">Searching articles...</div>
              ) : totalResults > 0 ? (
                <Tabs defaultValue="all" className="space-y-6">
                  <TabsList className="bg-white p-1 rounded-full">
                    <TabsTrigger value="all" className="rounded-full px-6">
                      All ({totalResults})
                    </TabsTrigger>
                    <TabsTrigger value="articles" className="rounded-full px-6">
                      Articles ({filteredPosts.length})
                    </TabsTrigger>
                    <TabsTrigger value="tools" className="rounded-full px-6">
                      Tools ({filteredTools.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="all" className="space-y-4">
                    {filteredPosts.map((post) => (
                      <PostResult key={post.id} post={post} />
                    ))}
                    {filteredTools.map((tool) => (
                      <ToolResult key={tool.id} tool={tool} />
                    ))}
                  </TabsContent>

                  <TabsContent value="articles" className="space-y-4">
                    {filteredPosts.map((post) => (
                      <PostResult key={post.id} post={post} />
                    ))}
                  </TabsContent>

                  <TabsContent value="tools" className="space-y-4">
                    {filteredTools.map((tool) => (
                      <ToolResult key={tool.id} tool={tool} />
                    ))}
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="text-center py-20">
                  <p className="text-[#6D727A] mb-4">No results found.</p>
                  <p className="text-sm text-[#6D727A]">
                    Try different keywords or browse our{' '}
                    <Link to="/blog" className="text-[#B8B1F5] hover:underline">
                      articles
                    </Link>{' '}
                    or{' '}
                    <Link to="/tools" className="text-[#B8B1F5] hover:underline">
                      tools
                    </Link>
                    .
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Popular Searches */}
          {!query && (
            <div className="max-w-2xl mx-auto text-center">
              <p className="text-[#6D727A] mb-4">Popular searches</p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  'affiliate marketing',
                  'passive income',
                  'AI tools',
                  'email marketing',
                  'website builders',
                  'Notion',
                  'ConvertKit',
                ].map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-4 py-2 rounded-full bg-white text-[#6D727A] hover:text-[#0B0D10] border border-[rgba(11,13,16,0.08)] transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function PostResult({ post }: { post: Post }) {
  return (
    <Link to={`/blog/${post.slug}`}>
      <div className="bg-white rounded-2xl p-6 shadow-[0_18px_50px_rgba(11,13,16,0.10)] border border-[rgba(11,13,16,0.08)] hover:-translate-y-0.5 transition-transform">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
            <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="secondary" className="bg-[#F6F7F9] text-[#B8B1F5]">
                Article
              </Badge>
              <span className="text-xs text-[#6D727A] flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {post.readingTime} min
              </span>
            </div>
            <h3 className="font-semibold text-[#0B0D10]">{post.title}</h3>
          </div>
          <ArrowRight className="w-5 h-5 text-[#6D727A] flex-shrink-0" />
        </div>
      </div>
    </Link>
  );
}

function ToolResult({ tool }: { tool: Tool }) {
  return (
    <Link to={`/tools/${tool.slug}`}>
      <div className="bg-white rounded-2xl p-6 shadow-[0_18px_50px_rgba(11,13,16,0.10)] border border-[rgba(11,13,16,0.08)] hover:-translate-y-0.5 transition-transform">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
            <img src={tool.logo} alt={tool.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="secondary" className="bg-[#F6F7F9] text-[#B8B1F5]">
                Tool
              </Badge>
              <span className="text-xs text-[#6D727A]">{tool.pricingType}</span>
            </div>
            <h3 className="font-semibold text-[#0B0D10] mb-1">{tool.name}</h3>
            <p className="text-sm text-[#6D727A] line-clamp-2">{tool.shortDescription}</p>
          </div>
          <ArrowRight className="w-5 h-5 text-[#6D727A] flex-shrink-0" />
        </div>
      </div>
    </Link>
  );
}
