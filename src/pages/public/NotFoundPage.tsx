import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SEO } from '@/components/shared/SEO';

export function NotFoundPage() {
  return (
    <>
      <SEO
        title="Page Not Found"
        description="The page you're looking for doesn't exist."
        noIndex
      />

      <div className="min-h-screen bg-[#F6F7F9] flex items-center justify-center pt-20 pb-20">
        <div className="w-full px-6 lg:px-10 text-center">
          <div className="max-w-xl mx-auto">
            {/* 404 */}
            <div className="text-[120px] lg:text-[180px] font-bold text-[#B8B1F5] leading-none mb-4">
              404
            </div>

            <h1 className="text-3xl lg:text-4xl font-semibold text-[#0B0D10] tracking-[-0.02em] mb-4">
              Page Not Found
            </h1>

            <p className="text-lg text-[#6D727A] mb-10">
              The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/">
                <Button className="bg-[#B8B1F5] text-[#0B0D10] hover:bg-[#a59eef] rounded-full px-6">
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              </Link>
              <Link to="/search">
                <Button variant="outline" className="rounded-full px-6 border-[#0B0D10]">
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </Link>
              <button onClick={() => window.history.back()}>
                <Button variant="ghost" className="rounded-full px-6">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back
                </Button>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
