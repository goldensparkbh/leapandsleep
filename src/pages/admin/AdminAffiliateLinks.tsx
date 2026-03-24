import { useState } from 'react';
import { Plus, Search, Copy, ExternalLink, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/contexts/DataContext';
import { copyToClipboard } from '@/utils/helpers';

export function AdminAffiliateLinks() {
  const [searchQuery, setSearchQuery] = useState('');
  const { affiliateLinks } = useData();

  const filteredLinks = affiliateLinks.filter((link) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        link.name.toLowerCase().includes(query) ||
        link.destinationUrl.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const handleCopy = (url: string) => {
    copyToClipboard(url);
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-[#0B0D10]">Affiliate Links</h1>
          <p className="text-[#6D727A]">Manage your affiliate links and track performance</p>
        </div>
        <Button className="bg-[#B8B1F5] text-[#0B0D10] hover:bg-[#a59eef] rounded-full">
          <Plus className="w-4 h-4 mr-2" />
          New Link
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6D727A]" />
        <Input
          placeholder="Search links..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Links Table */}
      <div className="bg-white rounded-[28px] border border-[rgba(11,13,16,0.08)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F6F7F9]">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-[#6D727A]">Name</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-[#6D727A]">Campaign</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-[#6D727A]">Clicks</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-[#6D727A]">Status</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-[#6D727A]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLinks.map((link) => (
                <tr key={link.id} className="border-t border-[rgba(11,13,16,0.08)]">
                  <td className="px-6 py-4">
                    <p className="font-medium text-[#0B0D10]">{link.name}</p>
                    <p className="text-sm text-[#6D727A] truncate max-w-xs">
                      {link.destinationUrl}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="secondary" className="bg-[#F6F7F9]">
                      {link.campaignLabel || 'Default'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-[#B8B1F5]" />
                      <span className="text-[#0B0D10]">{link.clickCount.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      className={
                        link.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }
                    >
                      {link.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopy(link.destinationUrl)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <a
                        href={link.destinationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="ghost" size="icon">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
