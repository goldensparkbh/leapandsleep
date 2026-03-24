import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, Star, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SEO } from '@/components/shared/SEO';
import { AffiliateDisclosure } from '@/components/shared/AffiliateDisclosure';
import { useData } from '@/contexts/DataContext';

export function ComparisonPage() {
  const { slug } = useParams<{ slug: string }>();
  const { getComparisonBySlug, getToolBySlug, getAffiliateLinkById } = useData();
  const comparison = getComparisonBySlug(slug || '');

  if (!comparison) {
    return <Navigate to="/404" replace />;
  }

  const winnerTool = comparison.tools.find((t) => t.toolId === comparison.featuredWinnerId);
  const winner = winnerTool ? getToolBySlug(winnerTool.toolSlug || '') : null;

  return (
    <>
      <SEO
        title={comparison.title}
        description={comparison.description}
      />

      <div className="min-h-screen bg-[#F6F7F9] pt-24 pb-20">
        <div className="w-full px-6 lg:px-10">
          {/* Back Button */}
          <Link to="/compare">
            <Button variant="ghost" className="text-[#6D727A] hover:text-[#0B0D10] -ml-4 mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to comparisons
            </Button>
          </Link>

          {/* Header */}
          <div className="max-w-4xl mb-10">
            <Badge className="bg-[#B8B1F5]/20 text-[#B8B1F5] mb-4">Comparison</Badge>
            <h1 className="text-3xl lg:text-5xl font-semibold text-[#0B0D10] tracking-[-0.02em] mb-4">
              {comparison.title}
            </h1>
            <p className="text-lg text-[#6D727A]">{comparison.description}</p>
          </div>

          {/* Winner Banner */}
          {winner && (
            <div className="bg-[#B8B1F5]/10 border border-[#B8B1F5]/30 rounded-[28px] p-6 mb-10">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden">
                  <img src={winner.logo} alt={winner.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-sm text-[#6D727A] mb-1">Our Pick</p>
                  <h2 className="text-2xl font-semibold text-[#0B0D10]">{winner.name}</h2>
                </div>
                <div className="ml-auto">
                  <Link to={`/tools/${winner.slug}`}>
                    <Button className="bg-[#B8B1F5] text-[#0B0D10] hover:bg-[#a59eef] rounded-full">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Comparison Table */}
          <div className="bg-white rounded-[28px] shadow-[0_18px_50px_rgba(11,13,16,0.10)] border border-[rgba(11,13,16,0.08)] overflow-hidden mb-10">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[rgba(11,13,16,0.08)]">
                    <th className="text-left p-6 text-[#6D727A] font-medium">Feature</th>
                    {comparison.tools.map((tool) => (
                      <th key={tool.toolId} className="text-center p-6 min-w-[200px]">
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 rounded-xl overflow-hidden mb-2">
                            <img
                              src={tool.toolLogo}
                              alt={tool.toolName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="font-semibold text-[#0B0D10]">{tool.toolName}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparison.criteria.map((criterion) => (
                    <tr key={criterion.id} className="border-b border-[rgba(11,13,16,0.08)]">
                      <td className="p-6 text-[#0B0D10] font-medium">{criterion.name}</td>
                      {comparison.tools.map((tool) => {
                        const rating = tool.ratings[criterion.id];
                        return (
                          <td key={tool.toolId} className="p-6 text-center">
                            {criterion.type === 'rating' ? (
                              <div className="flex items-center justify-center gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < (rating as number)
                                        ? 'fill-[#B8B1F5] text-[#B8B1F5]'
                                        : 'text-[#E5E7EB]'
                                    }`}
                                  />
                                ))}
                              </div>
                            ) : criterion.type === 'boolean' ? (
                              rating ? (
                                <Check className="w-5 h-5 text-green-500 mx-auto" />
                              ) : (
                                <span className="text-[#6D727A]">—</span>
                              )
                            ) : (
                              <span className="text-[#6D727A]">{typeof rating === 'boolean' ? (rating ? 'Yes' : 'No') : String(rating)}</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td className="p-6"></td>
                    {comparison.tools.map((tool) => {
                      const affiliateLink = getAffiliateLinkById(tool.affiliateLinkId);
                      return (
                        <td key={tool.toolId} className="p-6 text-center">
                          <a
                            href={affiliateLink?.destinationUrl || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button
                              variant="outline"
                              className="rounded-full border-[#B8B1F5] text-[#B8B1F5] hover:bg-[#B8B1F5] hover:text-[#0B0D10]"
                            >
                              Visit
                              <ExternalLink className="w-4 h-4 ml-2" />
                            </Button>
                          </a>
                        </td>
                      );
                    })}
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Affiliate Disclosure */}
          <AffiliateDisclosure />
        </div>
      </div>
    </>
  );
}
