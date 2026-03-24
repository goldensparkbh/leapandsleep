import { useState } from 'react';
import { Search, Mail, Download, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useData } from '@/contexts/DataContext';
import { formatDate } from '@/utils/helpers';

export function AdminLeads() {
  const [searchQuery, setSearchQuery] = useState('');
  const { subscribers } = useData();

  const filteredSubscribers = subscribers.filter((sub) => {
    if (searchQuery) {
      return (
        sub.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (sub.firstName && sub.firstName.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    return true;
  });

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-[#0B0D10]">Leads & Subscribers</h1>
          <p className="text-[#6D727A]">Manage your newsletter subscribers and leads</p>
        </div>
        <Button variant="outline" className="rounded-full">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-[rgba(11,13,16,0.08)]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#B8B1F5]/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-[#B8B1F5]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[#0B0D10]">{subscribers.length}</p>
              <p className="text-sm text-[#6D727A]">Total Subscribers</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-[rgba(11,13,16,0.08)]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <Mail className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[#0B0D10]">
                {subscribers.filter((s) => s.isActive).length}
              </p>
              <p className="text-sm text-[#6D727A]">Active Subscribers</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-[rgba(11,13,16,0.08)]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[#0B0D10]">0</p>
              <p className="text-sm text-[#6D727A]">New This Month</p>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="subscribers">
        <TabsList className="mb-6">
          <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
          <TabsTrigger value="contacts">Contact Forms</TabsTrigger>
        </TabsList>

        <TabsContent value="subscribers">
          {/* Search */}
          <div className="relative max-w-md mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6D727A]" />
            <Input
              placeholder="Search subscribers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Subscribers Table */}
          <div className="bg-white rounded-[28px] border border-[rgba(11,13,16,0.08)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F6F7F9]">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-medium text-[#6D727A]">Email</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-[#6D727A]">Name</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-[#6D727A]">Source</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-[#6D727A]">Status</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-[#6D727A]">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubscribers.map((sub) => (
                    <tr key={sub.id} className="border-t border-[rgba(11,13,16,0.08)]">
                      <td className="px-6 py-4">
                        <span className="text-[#0B0D10]">{sub.email}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[#6D727A]">{sub.firstName || '-'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="secondary" className="bg-[#F6F7F9]">
                          {sub.source}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          className={
                            sub.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }
                        >
                          {sub.isActive ? 'Active' : 'Unsubscribed'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-[#6D727A]">
                          {formatDate(sub.subscribedAt)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="contacts">
          <div className="text-center py-20 bg-white rounded-[28px]">
            <p className="text-[#6D727A]">No contact form submissions yet.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
