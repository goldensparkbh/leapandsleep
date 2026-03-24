import { Link } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SEO } from '@/components/shared/SEO';
import { useData } from '@/contexts/DataContext';
import { SITE_SECTIONS } from '@/constants/sections';
import { formatDate, getSectionDescription, getSectionLabel } from '@/utils/helpers';
import type { Post, PostSection } from '@/types';

export function HomePage() {
  const { getPostsBySection, isLoading } = useData();

  return (
    <>
      <SEO
        title="Take the Leap. Earn While You Sleep."
        description="Browse the latest articles across all LeapAndSleep platform sections."
        type="website"
      />

      <div className="min-h-screen bg-[#F6F7F9] pt-24 pb-20">
        <div className="w-full px-6 lg:px-10">
          <div className="space-y-16 lg:space-y-20">
            {SITE_SECTIONS.map((section) => {
              const posts = [...getPostsBySection(section)].sort(
                (a, b) => (b.publishDate?.getTime() || 0) - (a.publishDate?.getTime() || 0)
              );

              return (
                <SectionBlock
                  key={section}
                  section={section}
                  posts={posts}
                  isLoading={isLoading}
                />
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

function SectionBlock({
  section,
  posts,
  isLoading,
}: {
  section: PostSection;
  posts: Post[];
  isLoading: boolean;
}) {
  return (
    <section
      id={section}
      className="scroll-mt-24 border-t border-[rgba(11,13,16,0.08)] pt-10 first:border-t-0 first:pt-0"
    >
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="mb-3 text-xs font-mono uppercase tracking-[0.12em] text-[#B8B1F5]">
            {getSectionLabel(section)}
          </p>
          <h2 className="text-3xl font-semibold tracking-[-0.02em] text-[#0B0D10] lg:text-4xl">
            {getSectionLabel(section)}
          </h2>
          <p className="mt-3 text-base text-[#6D727A] lg:text-lg">
            {getSectionDescription(section)}
          </p>
        </div>

        <Link to={`/section/${section}`}>
          <Button
            variant="outline"
            className="w-fit rounded-full border-[#0B0D10] text-[#0B0D10] hover:bg-[#0B0D10] hover:text-[#F6F7F9]"
          >
            View section
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="rounded-[28px] border border-[rgba(11,13,16,0.08)] bg-white px-6 py-12 text-center text-[#6D727A]">
          Loading articles...
        </div>
      ) : posts.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-5">
          {posts.map((post) => (
            <ArticleCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="rounded-[28px] border border-[rgba(11,13,16,0.08)] bg-white px-6 py-12 text-center text-[#6D727A]">
          No articles yet in this section.
        </div>
      )}
    </section>
  );
}

function ArticleCard({ post }: { post: Post }) {
  return (
    <Link to={`/blog/${post.slug}`}>
      <article className="group overflow-hidden rounded-[24px] border border-[rgba(11,13,16,0.08)] bg-white shadow-[0_14px_36px_rgba(11,13,16,0.08)] transition-transform duration-300 hover:-translate-y-1">
        {post.featuredImage ? (
          <div className="aspect-[16/9] overflow-hidden">
            <img
              src={post.featuredImage}
              alt={post.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        ) : (
          <div className="aspect-[16/10] bg-[#E9ECF1]" />
        )}

        <div className="p-5">
          <div className="mb-2 flex items-center gap-3">
            <span className="text-xs font-mono uppercase tracking-[0.08em] text-[#B8B1F5]">
              {getSectionLabel(post.section)}
            </span>
            <span className="flex items-center gap-1 text-xs text-[#6D727A]">
              <Clock className="h-3 w-3" />
              {post.readingTime} min
            </span>
          </div>

          <h3 className="line-clamp-2 text-base font-semibold text-[#0B0D10] transition-colors group-hover:text-[#B8B1F5] lg:text-lg">
            {post.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm text-[#6D727A]">
            {post.summary}
          </p>

          <div className="mt-3 flex items-center justify-between text-sm text-[#6D727A]">
            <span>{formatDate(post.publishDate)}</span>
            <ArrowRight className="h-4 w-4 transition-colors group-hover:text-[#B8B1F5]" />
          </div>
        </div>
      </article>
    </Link>
  );
}
