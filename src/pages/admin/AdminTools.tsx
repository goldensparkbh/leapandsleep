import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit2, Eye, Trash2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/contexts/DataContext';

export function AdminTools() {
  const [searchQuery, setSearchQuery] = useState('');
  const { tools, toolCategories } = useData();

  const filteredTools = tools.filter((tool) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        tool.name.toLowerCase().includes(query) ||
        tool.shortDescription.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-[#0B0D10]">Tools</h1>
          <p className="text-[#6D727A]">Manage your affiliate tools and products</p>
        </div>
        <Link to="/admin/tools/new">
          <Button className="bg-[#B8B1F5] text-[#0B0D10] hover:bg-[#a59eef] rounded-full">
            <Plus className="w-4 h-4 mr-2" />
            New Tool
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6D727A]" />
        <Input
          placeholder="Search tools..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTools.map((tool) => {
          const category = toolCategories.find((c) => c.id === tool.categoryId);
          return (
            <div
              key={tool.id}
              className="bg-white rounded-[28px] p-6 border border-[rgba(11,13,16,0.08)]"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl overflow-hidden">
                  <img
                    src={tool.logo}
                    alt={tool.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-[#B8B1F5] text-[#B8B1F5]" />
                  <span className="text-sm font-medium">{tool.editorRating}</span>
                </div>
              </div>

              <h3 className="font-semibold text-[#0B0D10] mb-1">{tool.name}</h3>
              <p className="text-sm text-[#6D727A] mb-3 line-clamp-2">
                {tool.shortDescription}
              </p>

              <div className="flex items-center gap-2 mb-4">
                {category && (
                  <Badge variant="secondary" className="bg-[#F6F7F9]">
                    {category.name}
                  </Badge>
                )}
                <Badge
                  variant="outline"
                  className={
                    tool.status === 'active'
                      ? 'text-green-600 border-green-600'
                      : 'text-gray-500 border-gray-500'
                  }
                >
                  {tool.status}
                </Badge>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[rgba(11,13,16,0.08)]">
                <span className="text-sm text-[#6D727A]">
                  {tool.clickCount.toLocaleString()} clicks
                </span>
                <div className="flex gap-2">
                  <Link to={`/tools/${tool.slug}`} target="_blank">
                    <Button variant="ghost" size="icon">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link to={`/admin/tools/${tool.id}`}>
                    <Button variant="ghost" size="icon">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button variant="ghost" size="icon" className="text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
