import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, Star, Check, X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SEO } from '@/components/shared/SEO';
import { AffiliateDisclosure } from '@/components/shared/AffiliateDisclosure';
import { useData } from '@/contexts/DataContext';

export function ToolPage() {
  const { slug } = useParams<{ slug: string }>();
  const { getToolBySlug, getAffiliateLinkById, toolCategories } = useData();
  const tool = getToolBySlug(slug || '');

  if (!tool) {
    return <Navigate to="/404" replace />;
  }

  const affiliateLink = getAffiliateLinkById(tool.affiliateLinkId);
  const category = toolCategories.find((c) => c.id === tool.categoryId);
  const alternatives = tool.alternatives
    .map((id) => getToolBySlug(id))
    .filter(Boolean)
    .slice(0, 3);

  return (
    <>
      <SEO
        title={`${tool.name} Review - ${tool.shortDescription}`}
        description={tool.fullDescription}
      />

      <div className="min-h-screen bg-[#F6F7F9] pt-24 pb-20">
        <div className="w-full px-6 lg:px-10">
          {/* Back Button */}
          <Link to="/tools">
            <Button variant="ghost" className="text-[#6D727A] hover:text-[#0B0D10] -ml-4 mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to tools
            </Button>
          </Link>

          {/* Header */}
          <div className="bg-white rounded-[28px] p-8 lg:p-12 shadow-[0_18px_50px_rgba(11,13,16,0.10)] border border-[rgba(11,13,16,0.08)] mb-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Logo & Basic Info */}
              <div className="flex-1">
                <div className="flex items-center gap-6 mb-6">
                  <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-2xl overflow-hidden">
                    <img
                      src={tool.logo}
                      alt={tool.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h1 className="text-3xl lg:text-4xl font-semibold text-[#0B0D10] tracking-[-0.02em]">
                      {tool.name}
                    </h1>
                    <p className="text-[#6D727A] mt-1">{tool.shortDescription}</p>
                    <div className="flex items-center gap-3 mt-3">
                      {category && (
                        <Badge variant="secondary" className="bg-[#F6F7F9]">
                          {category.name}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-[#B8B1F5] border-[#B8B1F5]">
                        {tool.pricingType}
                      </Badge>
                    </div>
                  </div>
                </div>

                <p className="text-[#6D727A] leading-relaxed max-w-2xl">
                  {tool.fullDescription}
                </p>
              </div>

              {/* Rating & CTA */}
              <div className="lg:w-72 flex flex-col justify-center">
                <div className="bg-[#F6F7F9] rounded-2xl p-6 text-center">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Star className="w-6 h-6 fill-[#B8B1F5] text-[#B8B1F5]" />
                    <span className="text-3xl font-semibold text-[#0B0D10]">
                      {tool.editorRating}
                    </span>
                    <span className="text-[#6D727A]">/5</span>
                  </div>
                  <p className="text-sm text-[#6D727A] mb-4">Editor Rating</p>
                  <a
                    href={affiliateLink?.destinationUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="w-full bg-[#B8B1F5] text-[#0B0D10] hover:bg-[#a59eef] rounded-full">
                      Visit Tool
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </a>
                  {tool.couponCode && (
                    <div className="mt-4 p-3 bg-white rounded-xl border border-dashed border-[#B8B1F5]">
                      <p className="text-xs text-[#6D727A]">Use code</p>
                      <p className="text-lg font-mono font-medium text-[#B8B1F5]">
                        {tool.couponCode}
                      </p>
                      <p className="text-xs text-[#6D727A]">{tool.couponOffer}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Content Tabs */}
          <Tabs defaultValue="features" className="space-y-8">
            <TabsList className="bg-white p-1 rounded-full">
              <TabsTrigger value="features" className="rounded-full px-6">
                Features
              </TabsTrigger>
              <TabsTrigger value="pros-cons" className="rounded-full px-6">
                Pros & Cons
              </TabsTrigger>
              <TabsTrigger value="pricing" className="rounded-full px-6">
                Pricing
              </TabsTrigger>
            </TabsList>

            <TabsContent value="features">
              <div className="bg-white rounded-[28px] p-8 shadow-[0_18px_50px_rgba(11,13,16,0.10)] border border-[rgba(11,13,16,0.08)]">
                <h2 className="text-2xl font-semibold text-[#0B0D10] mb-6">Key Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tool.keyFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-[#B8B1F5] flex-shrink-0 mt-0.5" />
                      <span className="text-[#6D727A]">{feature}</span>
                    </div>
                  ))}
                </div>

                <h3 className="text-xl font-semibold text-[#0B0D10] mt-8 mb-4">Best For</h3>
                <div className="flex flex-wrap gap-2">
                  {tool.bestFor.map((item, index) => (
                    <Badge key={index} variant="secondary" className="bg-[#F6F7F9]">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="pros-cons">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-[28px] p-8 shadow-[0_18px_50px_rgba(11,13,16,0.10)] border border-[rgba(11,13,16,0.08)]">
                  <h2 className="text-xl font-semibold text-[#0B0D10] mb-6 flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    Pros
                  </h2>
                  <ul className="space-y-3">
                    {tool.pros.map((pro, index) => (
                      <li key={index} className="flex items-start gap-3 text-[#6D727A]">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white rounded-[28px] p-8 shadow-[0_18px_50px_rgba(11,13,16,0.10)] border border-[rgba(11,13,16,0.08)]">
                  <h2 className="text-xl font-semibold text-[#0B0D10] mb-6 flex items-center gap-2">
                    <X className="w-5 h-5 text-red-500" />
                    Cons
                  </h2>
                  <ul className="space-y-3">
                    {tool.cons.map((con, index) => (
                      <li key={index} className="flex items-start gap-3 text-[#6D727A]">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="pricing">
              <div className="bg-white rounded-[28px] p-8 shadow-[0_18px_50px_rgba(11,13,16,0.10)] border border-[rgba(11,13,16,0.08)]">
                <h2 className="text-2xl font-semibold text-[#0B0D10] mb-4">Pricing</h2>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-4xl font-semibold text-[#0B0D10]">
                    {tool.startingPrice || 'Free'}
                  </span>
                  <span className="text-[#6D727A]">starting price</span>
                </div>
                <p className="text-[#6D727A]">{tool.pricingDetails}</p>
              </div>
            </TabsContent>
          </Tabs>

          {/* Affiliate Disclosure */}
          <div className="mt-8">
            <AffiliateDisclosure />
          </div>

          {/* Alternatives */}
          {alternatives.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-semibold text-[#0B0D10] mb-6">Alternatives</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {alternatives.map((alt) => (
                  <Link key={alt!.id} to={`/tools/${alt!.slug}`}>
                    <div className="bg-white rounded-2xl p-6 shadow-[0_18px_50px_rgba(11,13,16,0.10)] border border-[rgba(11,13,16,0.08)] hover:-translate-y-1 transition-transform">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl overflow-hidden">
                          <img
                            src={alt!.logo}
                            alt={alt!.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold text-[#0B0D10]">{alt!.name}</h3>
                          <p className="text-sm text-[#6D727A]">{alt!.shortDescription}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
