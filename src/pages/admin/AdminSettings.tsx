import { useState } from 'react';
import { Save, Globe, Mail, Palette, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useData } from '@/contexts/DataContext';

export function AdminSettings() {
  const { siteSettings } = useData();
  const [activeTab, setActiveTab] = useState('general');

  const [generalSettings, setGeneralSettings] = useState({
    siteName: siteSettings.siteName,
    tagline: siteSettings.tagline,
    footerContent: siteSettings.footerContent,
  });

  const [seoSettings, setSeoSettings] = useState({
    titleTemplate: siteSettings.seoDefaults.titleTemplate,
    defaultDescription: siteSettings.seoDefaults.defaultDescription,
  });

  const [socialSettings, setSocialSettings] = useState(siteSettings.socialLinks);

  const handleSave = () => {
    console.log('Saving settings...');
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-[#0B0D10]">Settings</h1>
          <p className="text-[#6D727A]">Manage your site settings and preferences</p>
        </div>
        <Button 
          onClick={handleSave}
          className="bg-[#B8B1F5] text-[#0B0D10] hover:bg-[#a59eef] rounded-full"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="general">
            <Globe className="w-4 h-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="seo">
            <Bell className="w-4 h-4 mr-2" />
            SEO
          </TabsTrigger>
          <TabsTrigger value="social">
            <Mail className="w-4 h-4 mr-2" />
            Social
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="w-4 h-4 mr-2" />
            Appearance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="bg-white rounded-[28px] p-6 border border-[rgba(11,13,16,0.08)] max-w-2xl">
            <h2 className="text-lg font-semibold text-[#0B0D10] mb-6">General Settings</h2>
            <div className="space-y-6">
              <div>
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  value={generalSettings.siteName}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, siteName: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  value={generalSettings.tagline}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, tagline: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="footerContent">Footer Content</Label>
                <Textarea
                  id="footerContent"
                  value={generalSettings.footerContent}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, footerContent: e.target.value })}
                  rows={3}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="seo">
          <div className="bg-white rounded-[28px] p-6 border border-[rgba(11,13,16,0.08)] max-w-2xl">
            <h2 className="text-lg font-semibold text-[#0B0D10] mb-6">SEO Settings</h2>
            <div className="space-y-6">
              <div>
                <Label htmlFor="titleTemplate">Title Template</Label>
                <Input
                  id="titleTemplate"
                  value={seoSettings.titleTemplate}
                  onChange={(e) => setSeoSettings({ ...seoSettings, titleTemplate: e.target.value })}
                  placeholder="%s | Site Name"
                  className="mt-1"
                />
                <p className="text-xs text-[#6D727A] mt-1">Use %s for the page title</p>
              </div>

              <div>
                <Label htmlFor="defaultDescription">Default Meta Description</Label>
                <Textarea
                  id="defaultDescription"
                  value={seoSettings.defaultDescription}
                  onChange={(e) => setSeoSettings({ ...seoSettings, defaultDescription: e.target.value })}
                  rows={3}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="social">
          <div className="bg-white rounded-[28px] p-6 border border-[rgba(11,13,16,0.08)] max-w-2xl">
            <h2 className="text-lg font-semibold text-[#0B0D10] mb-6">Social Links</h2>
            <div className="space-y-6">
              {Object.entries(socialSettings).map(([platform, url]) => (
                <div key={platform}>
                  <Label htmlFor={platform} className="capitalize">
                    {platform}
                  </Label>
                  <Input
                    id={platform}
                    value={url || ''}
                    onChange={(e) =>
                      setSocialSettings({ ...socialSettings, [platform]: e.target.value })
                    }
                    placeholder={`https://${platform}.com/yourusername`}
                    className="mt-1"
                  />
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="appearance">
          <div className="bg-white rounded-[28px] p-6 border border-[rgba(11,13,16,0.08)] max-w-2xl">
            <h2 className="text-lg font-semibold text-[#0B0D10] mb-6">Appearance</h2>
            <div className="space-y-6">
              <div>
                <Label>Primary Color</Label>
                <div className="flex items-center gap-4 mt-1">
                  <div 
                    className="w-12 h-12 rounded-xl border border-[rgba(11,13,16,0.08)]"
                    style={{ backgroundColor: siteSettings.primaryColor }}
                  />
                  <Input value={siteSettings.primaryColor} readOnly />
                </div>
              </div>

              <div>
                <Label>Accent Color</Label>
                <div className="flex items-center gap-4 mt-1">
                  <div 
                    className="w-12 h-12 rounded-xl border border-[rgba(11,13,16,0.08)]"
                    style={{ backgroundColor: siteSettings.accentColor }}
                  />
                  <Input value={siteSettings.accentColor} readOnly />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
