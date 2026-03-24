import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BrandLogo } from '@/components/shared/BrandLogo';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { SITE_SECTIONS } from '@/constants/sections';
import { getSectionLabel } from '@/utils/helpers';

const navLinks = SITE_SECTIONS.map((section) => ({
  label: getSectionLabel(section),
  href: `/section/${section}`,
}));

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#F6F7F9]/90 backdrop-blur-md shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="w-full px-6 lg:px-10">
        <nav className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <BrandLogo imageClassName="h-10 lg:h-11" />

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-sm transition-colors ${
                  isActive(link.href)
                    ? 'text-[#0B0D10] font-medium'
                    : 'text-[#6D727A] hover:text-[#0B0D10]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <Link to="/search">
              <Button
                variant="ghost"
                size="icon"
                className="text-[#0B0D10] hover:text-[#B8B1F5] hover:bg-transparent"
              >
                <Search className="w-5 h-5" />
              </Button>
            </Link>

            <Link to="/start-here" className="hidden sm:block">
              <Button 
                variant="outline" 
                className="rounded-full border-[#0B0D10] text-[#0B0D10] hover:bg-[#0B0D10] hover:text-[#F6F7F9]"
              >
                Start Here
              </Button>
            </Link>

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-[#0B0D10] hover:bg-transparent"
                >
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-80 bg-[#F6F7F9] border-l-0">
                <div className="flex flex-col h-full pt-8">
                  <div className="flex justify-between items-center mb-8">
                    <span className="font-mono text-sm uppercase tracking-[0.08em]">
                      Menu
                    </span>
                  </div>

                  <nav className="flex flex-col gap-4">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        to={link.href}
                        onClick={() => setIsOpen(false)}
                        className={`text-lg transition-colors ${
                          isActive(link.href)
                            ? 'text-[#0B0D10] font-medium'
                            : 'text-[#6D727A] hover:text-[#0B0D10]'
                        }`}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </nav>

                  <div className="mt-auto pb-8 space-y-4">
                    <Link to="/start-here" onClick={() => setIsOpen(false)}>
                      <Button className="w-full rounded-full bg-[#B8B1F5] text-[#0B0D10] hover:bg-[#a59eef]">
                        Start Here
                      </Button>
                    </Link>
                    <div className="flex gap-4 text-sm text-[#6D727A]">
                      <Link to="/about" className="hover:text-[#0B0D10]">About</Link>
                      <Link to="/contact" className="hover:text-[#0B0D10]">Contact</Link>
                      <Link to="/resources" className="hover:text-[#0B0D10]">Resources</Link>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </div>
    </header>
  );
}
