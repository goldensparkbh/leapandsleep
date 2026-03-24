import { Outlet, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Wrench,
  Scale,
  Link2,
  FolderTree,
  Users,
  Image,
  Settings,
  LogOut,
  Menu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BrandLogo } from '@/components/shared/BrandLogo';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: FileText, label: 'Posts', href: '/admin/posts' },
  { icon: Wrench, label: 'Tools', href: '/admin/tools' },
  { icon: Scale, label: 'Comparisons', href: '/admin/comparisons' },
  { icon: Link2, label: 'Affiliate Links', href: '/admin/affiliate-links' },
  { icon: FolderTree, label: 'Categories', href: '/admin/categories' },
  { icon: Users, label: 'Leads', href: '/admin/leads' },
  { icon: Image, label: 'Media', href: '/admin/media' },
  { icon: Settings, label: 'Settings', href: '/admin/settings' },
];

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login', { replace: true });
  };

  const isActive = (href: string) => {
    if (href === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-[#F6F7F9] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-white border-r border-[rgba(11,13,16,0.08)] fixed h-full">
        <div className="p-6">
          <BrandLogo imageClassName="h-10" />
          <p className="text-xs text-[#6D727A] mt-1">Admin</p>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors ${
                isActive(item.href)
                  ? 'bg-[#B8B1F5]/10 text-[#B8B1F5]'
                  : 'text-[#6D727A] hover:text-[#0B0D10] hover:bg-[#F6F7F9]'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-[rgba(11,13,16,0.08)]">
          <Button
            variant="ghost"
            className="w-full justify-start text-[#6D727A]"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-[rgba(11,13,16,0.08)]">
        <div className="flex items-center justify-between px-4 h-14">
          <BrandLogo imageClassName="h-8" />
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64 p-0">
              <div className="flex flex-col h-full">
                <div className="p-4 border-b border-[rgba(11,13,16,0.08)]">
                  <p className="font-medium">Admin Menu</p>
                </div>
                <nav className="flex-1 p-4 space-y-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors ${
                        isActive(item.href)
                          ? 'bg-[#B8B1F5]/10 text-[#B8B1F5]'
                          : 'text-[#6D727A] hover:text-[#0B0D10]'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  ))}
                </nav>
                <div className="border-t border-[rgba(11,13,16,0.08)] p-4">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-[#6D727A]"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign out
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0">
        <Outlet />
      </main>
    </div>
  );
}
