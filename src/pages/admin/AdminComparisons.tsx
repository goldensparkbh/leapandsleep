import { Link } from 'react-router-dom';
import { Plus, Edit2, Eye, Trash2, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/contexts/DataContext';

export function AdminComparisons() {
  const { comparisons } = useData();

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-[#0B0D10]">Comparisons</h1>
          <p className="text-[#6D727A]">Manage tool comparisons</p>
        </div>
        <Button className="bg-[#B8B1F5] text-[#0B0D10] hover:bg-[#a59eef] rounded-full">
          <Plus className="w-4 h-4 mr-2" />
          New Comparison
        </Button>
      </div>

      {/* Comparisons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {comparisons.map((comparison) => (
          <div
            key={comparison.id}
            className="bg-white rounded-[28px] p-6 border border-[rgba(11,13,16,0.08)]"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#B8B1F5]/10 flex items-center justify-center">
                <Scale className="w-6 h-6 text-[#B8B1F5]" />
              </div>
              <Badge
                className={
                  comparison.status === 'published'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-amber-100 text-amber-700'
                }
              >
                {comparison.status}
              </Badge>
            </div>

            <h3 className="font-semibold text-[#0B0D10] mb-2">{comparison.title}</h3>
            <p className="text-sm text-[#6D727A] mb-4 line-clamp-2">
              {comparison.description}
            </p>

            <div className="flex items-center gap-2 mb-4">
              {comparison.tools.map((tool) => (
                <div key={tool.toolId} className="w-8 h-8 rounded-lg overflow-hidden">
                  <img
                    src={tool.toolLogo}
                    alt={tool.toolName}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-[rgba(11,13,16,0.08)]">
              <Link to={`/compare/${comparison.slug}`} target="_blank">
                <Button variant="ghost" size="icon">
                  <Eye className="w-4 h-4" />
                </Button>
              </Link>
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
  );
}
