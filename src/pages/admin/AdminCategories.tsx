import { Plus, Edit2, Trash2, Folder } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';
import { getSectionLabel } from '@/utils/helpers';

export function AdminCategories() {
  const { categories, toolCategories } = useData();

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-[#0B0D10]">Categories</h1>
          <p className="text-[#6D727A]">Manage blog and tool categories</p>
        </div>
        <Button className="bg-[#B8B1F5] text-[#0B0D10] hover:bg-[#a59eef] rounded-full">
          <Plus className="w-4 h-4 mr-2" />
          New Category
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Blog Categories */}
        <div className="bg-white rounded-[28px] p-6 border border-[rgba(11,13,16,0.08)]">
          <h2 className="text-lg font-semibold text-[#0B0D10] mb-4">Blog Categories</h2>
          <div className="space-y-3">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-4 rounded-xl bg-[#F6F7F9]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                    <Folder className="w-5 h-5 text-[#B8B1F5]" />
                  </div>
                  <div>
                    <p className="font-medium text-[#0B0D10]">{category.name}</p>
                    <p className="text-sm text-[#6D727A]">
                      {getSectionLabel(category.section)} • {category.postCount} posts
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tool Categories */}
        <div className="bg-white rounded-[28px] p-6 border border-[rgba(11,13,16,0.08)]">
          <h2 className="text-lg font-semibold text-[#0B0D10] mb-4">Tool Categories</h2>
          <div className="space-y-3">
            {toolCategories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-4 rounded-xl bg-[#F6F7F9]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                    <Folder className="w-5 h-5 text-[#B8B1F5]" />
                  </div>
                  <div>
                    <p className="font-medium text-[#0B0D10]">{category.name}</p>
                    <p className="text-sm text-[#6D727A]">{category.toolCount} tools</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
