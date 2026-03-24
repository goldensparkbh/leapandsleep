import { Link } from 'react-router-dom';
import {
  FileText,
  Wrench,
  Scale,
  Link2,
  Users,
  TrendingUp,
  Eye,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useData } from '@/contexts/DataContext';

export function AdminDashboard() {
  const { posts, tools, comparisons, affiliateLinks, subscribers } = useData();

  const stats = [
    {
      title: 'Total Posts',
      value: posts.length,
      icon: FileText,
      href: '/admin/posts',
      change: '+12%',
    },
    {
      title: 'Tools',
      value: tools.length,
      icon: Wrench,
      href: '/admin/tools',
      change: '+5%',
    },
    {
      title: 'Comparisons',
      value: comparisons.length,
      icon: Scale,
      href: '/admin/comparisons',
      change: '+2%',
    },
    {
      title: 'Affiliate Links',
      value: affiliateLinks.length,
      icon: Link2,
      href: '/admin/affiliate-links',
      change: '+8%',
    },
    {
      title: 'Subscribers',
      value: subscribers.length,
      icon: Users,
      href: '/admin/leads',
      change: '+24%',
    },
    {
      title: 'Total Views',
      value: posts.reduce((acc, post) => acc + post.viewCount, 0).toLocaleString(),
      icon: Eye,
      href: '/admin/posts',
      change: '+18%',
    },
  ];

  const quickActions = [
    { label: 'New Post', href: '/admin/posts/new', icon: Plus },
    { label: 'New Tool', href: '/admin/tools/new', icon: Plus },
    { label: 'Manage Media', href: '/admin/media', icon: FileText },
    { label: 'View Settings', href: '/admin/settings', icon: TrendingUp },
  ];

  const recentPosts = [...posts]
    .sort((a, b) => (b.updatedAt?.getTime() || 0) - (a.updatedAt?.getTime() || 0))
    .slice(0, 5);

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-[#0B0D10]">Dashboard</h1>
          <p className="text-[#6D727A]">Welcome back to LeapAndSleep Admin</p>
        </div>
        <div className="flex gap-2">
          {quickActions.slice(0, 2).map((action) => (
            <Link key={action.label} to={action.href}>
              <Button className="bg-[#B8B1F5] text-[#0B0D10] hover:bg-[#a59eef] rounded-full">
                <action.icon className="w-4 h-4 mr-2" />
                {action.label}
              </Button>
            </Link>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <Link key={stat.title} to={stat.href}>
            <Card className="hover:shadow-lg transition-shadow border-[rgba(11,13,16,0.08)]">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-[#6D727A]">{stat.title}</p>
                    <p className="text-3xl font-semibold text-[#0B0D10] mt-1">{stat.value}</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-[#B8B1F5]/10 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-[#B8B1F5]" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-sm text-green-600">{stat.change}</span>
                  <span className="text-xs text-[#6D727A]">from last month</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Posts */}
        <Card className="border-[rgba(11,13,16,0.08)]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Posts</CardTitle>
            <Link to="/admin/posts">
              <Button variant="ghost" size="sm" className="text-[#B8B1F5]">
                View all
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPosts.map((post) => (
                <Link key={post.id} to={`/admin/posts/${post.id}`}>
                  <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-[#F6F7F9] transition-colors">
                    {post.featuredImage ? (
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={post.featuredImage}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-[#F6F7F9] flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#0B0D10] truncate">{post.title}</p>
                      <p className="text-sm text-[#6D727A]">
                        {post.status} • {post.viewCount.toLocaleString()} views
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-[rgba(11,13,16,0.08)]">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action) => (
                <Link key={action.label} to={action.href}>
                  <div className="flex flex-col items-center gap-3 p-6 rounded-xl border border-[rgba(11,13,16,0.08)] hover:border-[#B8B1F5] hover:bg-[#B8B1F5]/5 transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-[#B8B1F5]/10 flex items-center justify-center">
                      <action.icon className="w-6 h-6 text-[#B8B1F5]" />
                    </div>
                    <span className="font-medium text-[#0B0D10]">{action.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
