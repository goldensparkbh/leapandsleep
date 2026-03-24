import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useData } from '@/contexts/DataContext';

export function AdminToolEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tools, toolCategories, affiliateLinks } = useData();
  
  const existingTool = id ? tools.find(t => t.id === id) : null;
  
  const [formData, setFormData] = useState({
    name: existingTool?.name || '',
    slug: existingTool?.slug || '',
    shortDescription: existingTool?.shortDescription || '',
    fullDescription: existingTool?.fullDescription || '',
    categoryId: existingTool?.categoryId || toolCategories[0]?.id || '',
    pricingType: existingTool?.pricingType || 'freemium',
    startingPrice: existingTool?.startingPrice || '',
    pricingDetails: existingTool?.pricingDetails || '',
    affiliateLinkId: existingTool?.affiliateLinkId || affiliateLinks[0]?.id || '',
    editorRating: existingTool?.editorRating || 4,
    status: existingTool?.status || 'active',
  });

  const handleSave = () => {
    console.log('Saving tool:', formData);
    navigate('/admin/tools');
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/tools')}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-[#0B0D10]">
              {existingTool ? 'Edit Tool' : 'New Tool'}
            </h1>
          </div>
        </div>
        <Button 
          onClick={handleSave}
          className="bg-[#B8B1F5] text-[#0B0D10] hover:bg-[#a59eef] rounded-full"
        >
          <Save className="w-4 h-4 mr-2" />
          Save
        </Button>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white rounded-[28px] p-6 border border-[rgba(11,13,16,0.08)]">
            <h3 className="font-semibold text-[#0B0D10] mb-4">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Tool name"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="tool-slug"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="shortDescription">Short Description</Label>
                <Input
                  id="shortDescription"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder="Brief description"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="fullDescription">Full Description</Label>
                <Textarea
                  id="fullDescription"
                  value={formData.fullDescription}
                  onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
                  placeholder="Detailed description"
                  rows={5}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[28px] p-6 border border-[rgba(11,13,16,0.08)]">
            <h3 className="font-semibold text-[#0B0D10] mb-4">Categorization</h3>
            <div className="space-y-4">
              <div>
                <Label>Category</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {toolCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Affiliate Link</Label>
                <Select
                  value={formData.affiliateLinkId}
                  onValueChange={(value) => setFormData({ ...formData, affiliateLinkId: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {affiliateLinks.map((link) => (
                      <SelectItem key={link.id} value={link.id}>
                        {link.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-[28px] p-6 border border-[rgba(11,13,16,0.08)]">
            <h3 className="font-semibold text-[#0B0D10] mb-4">Pricing</h3>
            <div className="space-y-4">
              <div>
                <Label>Pricing Type</Label>
                <Select
                  value={formData.pricingType}
                  onValueChange={(value) => setFormData({ ...formData, pricingType: value as 'free' | 'freemium' | 'paid' | 'subscription' })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="freemium">Freemium</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="subscription">Subscription</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="startingPrice">Starting Price</Label>
                <Input
                  id="startingPrice"
                  value={formData.startingPrice}
                  onChange={(e) => setFormData({ ...formData, startingPrice: e.target.value })}
                  placeholder="$0"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="pricingDetails">Pricing Details</Label>
                <Textarea
                  id="pricingDetails"
                  value={formData.pricingDetails}
                  onChange={(e) => setFormData({ ...formData, pricingDetails: e.target.value })}
                  placeholder="Detailed pricing information"
                  rows={3}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[28px] p-6 border border-[rgba(11,13,16,0.08)]">
            <h3 className="font-semibold text-[#0B0D10] mb-4">Settings</h3>
            <div className="space-y-4">
              <div>
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as 'active' | 'inactive' })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="editorRating">Editor Rating (1-5)</Label>
                <Input
                  id="editorRating"
                  type="number"
                  min={1}
                  max={5}
                  step={0.1}
                  value={formData.editorRating}
                  onChange={(e) => setFormData({ ...formData, editorRating: parseFloat(e.target.value) })}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
