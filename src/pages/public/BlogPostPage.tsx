import { useEffect, useRef } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar, Twitter, Facebook, Linkedin } from 'lucide-react';
import DOMPurify from 'dompurify';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SEO } from '@/components/shared/SEO';
import { AffiliateDisclosure } from '@/components/shared/AffiliateDisclosure';
import { NewsletterForm } from '@/components/shared/NewsletterForm';
import { PostComments } from '@/components/public/PostComments';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { formatDate, getSectionLabel } from '@/utils/helpers';
import type { ContentBlock } from '@/types';

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const hasRecordedViewRef = useRef<string | null>(null);
  const { isAuthenticated } = useAuth();
  const { getPostBySlug, getRecentPosts, incrementPostViewCount, isLoading } = useData();
  const post = getPostBySlug(slug || '');

  useEffect(() => {
    if (!post || isAuthenticated) {
      return;
    }

    const viewStorageKey = `post-viewed:${post.id}`;
    if (hasRecordedViewRef.current === post.id || sessionStorage.getItem(viewStorageKey)) {
      return;
    }

    hasRecordedViewRef.current = post.id;
    sessionStorage.setItem(viewStorageKey, '1');

    void incrementPostViewCount(post.id).catch(() => {
      hasRecordedViewRef.current = null;
      sessionStorage.removeItem(viewStorageKey);
    });
  }, [incrementPostViewCount, isAuthenticated, post]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F6F7F9] pt-24 pb-20">
        <div className="w-full px-6 lg:px-10 text-center text-[#6D727A]">
          Loading article...
        </div>
      </div>
    );
  }

  if (!post) {
    return <Navigate to="/404" replace />;
  }

  const recentPosts = getRecentPosts(3).filter((p) => p.id !== post.id);
  const sanitizedContentHtml = post.contentHtml
    ? DOMPurify.sanitize(post.contentHtml, {
        ADD_TAGS: ['iframe'],
        ADD_ATTR: ['allow', 'allowfullscreen', 'class', 'frameborder', 'rel', 'style', 'target'],
      })
    : '';

  return (
    <>
      <SEO
        title={post.seoTitle || post.title}
        description={post.metaDescription || post.summary}
        image={post.ogImage || post.featuredImage}
        canonicalUrl={post.canonicalUrl}
        type="article"
        author={post.authorName}
        publishedDate={post.publishDate?.toISOString()}
        modifiedDate={post.updatedAt?.toISOString()}
      />

      <article className="min-h-screen bg-[#F6F7F9] pt-24 pb-20">
        {/* Header */}
        <div className="w-full px-6 lg:px-10 mb-10">
          <Link to="/blog">
            <Button variant="ghost" className="text-[#6D727A] hover:text-[#0B0D10] -ml-4 mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to blog
            </Button>
          </Link>

          <div className="w-full">
            <div className="flex items-center gap-3 mb-4">
              <Badge variant="secondary" className="bg-white text-[#B8B1F5]">
                {getSectionLabel(post.section)}
              </Badge>
              <span className="flex items-center gap-1 text-sm text-[#6D727A]">
                <Clock className="w-4 h-4" />
                {post.readingTime} min read
              </span>
            </div>

            <h1 className="text-3xl lg:text-5xl font-semibold text-[#0B0D10] tracking-[-0.02em] mb-6">
              {post.title}
            </h1>

            <p className="text-lg lg:text-xl text-[#6D727A] mb-6">
              {post.summary}
            </p>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                {post.authorPhotoURL ? (
                  <img
                    src={post.authorPhotoURL}
                    alt={post.authorName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#B8B1F5] flex items-center justify-center text-[#0B0D10] font-medium">
                    {post.authorName.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-[#0B0D10]">{post.authorName}</p>
                  <p className="text-xs text-[#6D727A] flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(post.publishDate)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Image */}
        <div className="w-full px-6 lg:px-10 mb-12">
          <div className="max-w-5xl mx-auto">
            <div className="aspect-[21/9] rounded-[28px] overflow-hidden">
              <img
                src={post.featuredImage}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="w-full px-6 lg:px-10">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-12">
              {/* Main Content */}
              <div className="flex-1">
                {sanitizedContentHtml ? (
                  <div
                    className="rich-content max-w-none"
                    dangerouslySetInnerHTML={{ __html: sanitizedContentHtml }}
                  />
                ) : (
                  <div className="prose prose-lg max-w-none">
                    {post.content.map((block) => (
                      <ContentBlockRenderer key={block.id} block={block} />
                    ))}
                  </div>
                )}

                {post.faqs && post.faqs.length > 0 && (
                  <div className="mt-12 rounded-[28px] border border-[rgba(11,13,16,0.08)] bg-white p-6">
                    <h2 className="text-2xl font-semibold text-[#0B0D10] mb-4">
                      Frequently asked questions
                    </h2>
                    <div className="space-y-5">
                      {post.faqs.map((faq) => (
                        <div key={faq.id}>
                          <h3 className="text-lg font-semibold text-[#0B0D10] mb-2">
                            {faq.question}
                          </h3>
                          <p className="text-[#6D727A] leading-relaxed">{faq.answer}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Affiliate Disclosure */}
                <div className="mt-10">
                  <AffiliateDisclosure />
                </div>

                {/* Share */}
                <div className="mt-10 pt-8 border-t border-[rgba(11,13,16,0.08)]">
                  <p className="text-sm text-[#6D727A] mb-4">Share this article</p>
                  <div className="flex gap-3">
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-white border border-[rgba(11,13,16,0.08)] flex items-center justify-center text-[#6D727A] hover:text-[#0B0D10] transition-colors"
                    >
                      <Twitter className="w-4 h-4" />
                    </a>
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-white border border-[rgba(11,13,16,0.08)] flex items-center justify-center text-[#6D727A] hover:text-[#0B0D10] transition-colors"
                    >
                      <Facebook className="w-4 h-4" />
                    </a>
                    <a
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-white border border-[rgba(11,13,16,0.08)] flex items-center justify-center text-[#6D727A] hover:text-[#0B0D10] transition-colors"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                <PostComments postId={post.id} allowComments={post.allowComments} />
              </div>

              {/* Sidebar */}
              <aside className="lg:w-80 space-y-8">
                {/* Newsletter */}
                <div className="bg-white rounded-[28px] p-6 shadow-[0_18px_50px_rgba(11,13,16,0.10)] border border-[rgba(11,13,16,0.08)]">
                  <h3 className="text-lg font-semibold text-[#0B0D10] mb-2">
                    Subscribe to our newsletter
                  </h3>
                  <p className="text-sm text-[#6D727A] mb-4">
                    Get weekly insights on passive income and online business.
                  </p>
                  <NewsletterForm variant="minimal" showLabel={false} />
                </div>

                {/* Related Posts */}
                {recentPosts.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-[#0B0D10] mb-4">
                      Related articles
                    </h3>
                    <div className="space-y-4">
                      {recentPosts.map((relatedPost) => (
                        <Link
                          key={relatedPost.id}
                          to={`/blog/${relatedPost.slug}`}
                          className="block group"
                        >
                          <div className="flex gap-4">
                            <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                              <img
                                src={relatedPost.featuredImage}
                                alt={relatedPost.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-[#0B0D10] line-clamp-2 group-hover:text-[#B8B1F5] transition-colors">
                                {relatedPost.title}
                              </h4>
                              <p className="text-xs text-[#6D727A] mt-1">
                                {relatedPost.readingTime} min read
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </aside>
            </div>
          </div>
        </div>
      </article>
    </>
  );
}

function ContentBlockRenderer({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case 'heading': {
      const level = block.level || 2;
      const className = "text-2xl font-semibold text-[#0B0D10] mt-10 mb-4";
      if (level === 1) return <h1 className={className}>{block.content}</h1>;
      if (level === 2) return <h2 className={className}>{block.content}</h2>;
      if (level === 3) return <h3 className={className}>{block.content}</h3>;
      if (level === 4) return <h4 className={className}>{block.content}</h4>;
      if (level === 5) return <h5 className={className}>{block.content}</h5>;
      return <h6 className={className}>{block.content}</h6>;
    }

    case 'paragraph':
      return <p className="text-[#6D727A] leading-relaxed mb-6">{block.content}</p>;

    case 'list':
      return (
        <ul className="list-disc list-inside space-y-2 mb-6 text-[#6D727A]">
          {block.items?.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      );

    case 'callout':
      const styleClasses: Record<string, string> = {
        info: 'bg-blue-50 border-blue-200 text-blue-800',
        warning: 'bg-amber-50 border-amber-200 text-amber-800',
        success: 'bg-green-50 border-green-200 text-green-800',
        tip: 'bg-[#F6F7F9] border-[#B8B1F5] text-[#0B0D10]',
      };
      return (
        <div className={`p-6 rounded-2xl border mb-6 ${styleClasses[block.style || 'info']}`}>
          <p>{block.content}</p>
        </div>
      );

    case 'image':
      return (
        <figure className="my-8">
          <img
            src={block.imageUrl}
            alt={block.alt || ''}
            className="w-full rounded-2xl"
          />
          {block.caption && (
            <figcaption className="text-sm text-[#6D727A] mt-2 text-center">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );

    case 'quote':
      return (
        <blockquote className="border-l-4 border-[#B8B1F5] pl-6 my-8">
          <p className="text-xl italic text-[#0B0D10]">{block.content}</p>
        </blockquote>
      );

    default:
      return null;
  }
}
