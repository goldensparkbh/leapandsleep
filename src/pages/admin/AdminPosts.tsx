import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Edit2, Eye, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useData } from '@/contexts/DataContext';
import { formatDate, getSectionLabel } from '@/utils/helpers';


export function AdminPosts() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const { posts, deletePost, isLoading, postsError } = useData();

  const filteredPosts = posts.filter((post) => {
    if (statusFilter && post.status !== statusFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        post.title.toLowerCase().includes(query) ||
        post.summary.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const handleDelete = async (postId: string, title: string) => {
    const shouldDelete = window.confirm(`Delete "${title}"? This cannot be undone.`);
    if (!shouldDelete) return;

    try {
      setDeletingPostId(postId);
      await deletePost(postId);
    } finally {
      setDeletingPostId(null);
    }
  };

  const statusColors: Record<string, string> = {
    published: 'bg-green-100 text-green-700',
    draft: 'bg-amber-100 text-amber-700',
    scheduled: 'bg-blue-100 text-blue-700',
    archived: 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-[#0B0D10]">Posts</h1>
          <p className="text-[#6D727A]">Manage your blog posts and articles</p>
        </div>
        <Link to="/admin/posts/new">
          <Button className="bg-[#B8B1F5] text-[#0B0D10] hover:bg-[#a59eef] rounded-full">
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6D727A]" />
          <Input
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-fit">
              <Filter className="w-4 h-4 mr-2" />
              {statusFilter || 'All Status'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setStatusFilter(null)}>All</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('published')}>Published</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('draft')}>Draft</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('scheduled')}>Scheduled</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Posts Table */}
      <div className="bg-white rounded-[28px] border border-[rgba(11,13,16,0.08)] overflow-hidden">
        {isLoading ? (
          <div className="px-6 py-12 text-center text-[#6D727A]">Loading posts...</div>
        ) : postsError ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-red-600">Could not load posts from Firestore.</p>
            <p className="mt-2 text-sm text-[#6D727A]">{postsError}</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="px-6 py-12 text-center text-[#6D727A]">No posts found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F6F7F9]">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-[#6D727A]">Post</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-[#6D727A]">Section</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-[#6D727A]">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-[#6D727A]">Views</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-[#6D727A]">Date</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-[#6D727A]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="border-t border-[rgba(11,13,16,0.08)]">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
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
                        <div>
                          <p className="font-medium text-[#0B0D10]">{post.title}</p>
                          <p className="text-sm text-[#6D727A] truncate max-w-xs">{post.summary}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-[#6D727A]">{getSectionLabel(post.section)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={statusColors[post.status]}>{post.status}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-[#6D727A]">{post.viewCount.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-[#6D727A]">{formatDate(post.publishDate)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {post.status === 'published' ? (
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/blog/${post.slug}`} target="_blank">
                              <Eye className="w-4 h-4" />
                            </Link>
                          </Button>
                        ) : (
                          <Button variant="ghost" size="icon" disabled>
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                        <Link to={`/admin/posts/${post.id}`}>
                          <Button variant="ghost" size="icon">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500"
                          disabled={deletingPostId === post.id}
                          onClick={() => handleDelete(post.id, post.title)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
