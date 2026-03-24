import { useState } from 'react';
import { Upload, Image, File, Search, Trash2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function AdminMedia() {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock media items - in production, fetch from storage
  const mediaItems: { id: string; name: string; url: string; type: string; size: string }[] = [];

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-[#0B0D10]">Media Library</h1>
          <p className="text-[#6D727A]">Manage your images and files</p>
        </div>
        <Button className="bg-[#B8B1F5] text-[#0B0D10] hover:bg-[#a59eef] rounded-full">
          <Upload className="w-4 h-4 mr-2" />
          Upload
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6D727A]" />
        <Input
          placeholder="Search media..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs defaultValue="images">
        <TabsList className="mb-6">
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="images">
          {mediaItems.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {mediaItems.map((item) => (
                <div
                  key={item.id}
                  className="aspect-square rounded-2xl bg-white border border-[rgba(11,13,16,0.08)] overflow-hidden group relative"
                >
                  <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button variant="ghost" size="icon" className="text-white">
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-white">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-[28px] border border-dashed border-[rgba(11,13,16,0.2)]">
              <div className="w-16 h-16 rounded-full bg-[#F6F7F9] flex items-center justify-center mx-auto mb-4">
                <Image className="w-8 h-8 text-[#6D727A]" />
              </div>
              <p className="text-[#6D727A] mb-2">No images yet</p>
              <p className="text-sm text-[#6D727A]">Upload images to see them here</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="documents">
          <div className="text-center py-20 bg-white rounded-[28px] border border-dashed border-[rgba(11,13,16,0.2)]">
            <div className="w-16 h-16 rounded-full bg-[#F6F7F9] flex items-center justify-center mx-auto mb-4">
              <File className="w-8 h-8 text-[#6D727A]" />
            </div>
            <p className="text-[#6D727A] mb-2">No documents yet</p>
            <p className="text-sm text-[#6D727A]">Upload documents to see them here</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
