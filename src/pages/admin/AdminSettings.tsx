import { useEffect, useState } from 'react';
import { Save, Globe, Mail, Palette, Bell, Server } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useData } from '@/contexts/DataContext';

export function AdminSettings() {
  const { siteSettings, emailSettings, updateSiteSettings, updateEmailSettings } = useData();
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [generalSettings, setGeneralSettings] = useState({
    siteName: siteSettings.siteName,
    siteUrl: siteSettings.siteUrl,
    tagline: siteSettings.tagline,
    logo: siteSettings.logo,
    favicon: siteSettings.favicon,
    footerContent: siteSettings.footerContent,
    affiliateDisclaimer: siteSettings.affiliateDisclaimer,
    googleAnalytics: siteSettings.analyticsIds.googleAnalytics || '',
    facebookPixel: siteSettings.analyticsIds.facebookPixel || '',
  });

  const [seoSettings, setSeoSettings] = useState({
    titleTemplate: siteSettings.seoDefaults.titleTemplate,
    defaultDescription: siteSettings.seoDefaults.defaultDescription,
    defaultOgImage: siteSettings.seoDefaults.defaultOgImage,
  });

  const [socialSettings, setSocialSettings] = useState(siteSettings.socialLinks);
  const [emailConfig, setEmailConfig] = useState({
    fromName: emailSettings.fromName,
    fromEmail: emailSettings.fromEmail,
    replyTo: emailSettings.replyTo || '',
    smtpHost: emailSettings.smtpHost,
    smtpPort: String(emailSettings.smtpPort),
    smtpUsername: emailSettings.smtpUsername,
    smtpPassword: emailSettings.smtpPassword,
    smtpSecure: emailSettings.smtpSecure,
    welcomeSubject: emailSettings.welcomeSubject,
    newPostSubjectTemplate: emailSettings.newPostSubjectTemplate,
  });

  useEffect(() => {
    setGeneralSettings({
      siteName: siteSettings.siteName,
      siteUrl: siteSettings.siteUrl,
      tagline: siteSettings.tagline,
      logo: siteSettings.logo,
      favicon: siteSettings.favicon,
      footerContent: siteSettings.footerContent,
      affiliateDisclaimer: siteSettings.affiliateDisclaimer,
      googleAnalytics: siteSettings.analyticsIds.googleAnalytics || '',
      facebookPixel: siteSettings.analyticsIds.facebookPixel || '',
    });
    setSeoSettings({
      titleTemplate: siteSettings.seoDefaults.titleTemplate,
      defaultDescription: siteSettings.seoDefaults.defaultDescription,
      defaultOgImage: siteSettings.seoDefaults.defaultOgImage,
    });
    setSocialSettings(siteSettings.socialLinks);
  }, [siteSettings]);

  useEffect(() => {
    setEmailConfig({
      fromName: emailSettings.fromName,
      fromEmail: emailSettings.fromEmail,
      replyTo: emailSettings.replyTo || '',
      smtpHost: emailSettings.smtpHost,
      smtpPort: String(emailSettings.smtpPort),
      smtpUsername: emailSettings.smtpUsername,
      smtpPassword: emailSettings.smtpPassword,
      smtpSecure: emailSettings.smtpSecure,
      welcomeSubject: emailSettings.welcomeSubject,
      newPostSubjectTemplate: emailSettings.newPostSubjectTemplate,
    });
  }, [emailSettings]);

  const handleSave = async () => {
    setError('');
    setSuccessMessage('');

    if (!generalSettings.siteName.trim()) {
      setError('Site name is required.');
      return;
    }

    if (!generalSettings.siteUrl.trim()) {
      setError('Site URL is required.');
      return;
    }

    try {
      setIsSaving(true);

      await updateSiteSettings({
        siteName: generalSettings.siteName,
        siteUrl: generalSettings.siteUrl,
        tagline: generalSettings.tagline,
        logo: generalSettings.logo,
        favicon: generalSettings.favicon,
        primaryColor: siteSettings.primaryColor,
        accentColor: siteSettings.accentColor,
        socialLinks: socialSettings,
        seoDefaults: {
          titleTemplate: seoSettings.titleTemplate,
          defaultDescription: seoSettings.defaultDescription,
          defaultOgImage: seoSettings.defaultOgImage,
        },
        analyticsIds: {
          googleAnalytics: generalSettings.googleAnalytics,
          facebookPixel: generalSettings.facebookPixel,
        },
        affiliateDisclaimer: generalSettings.affiliateDisclaimer,
        footerContent: generalSettings.footerContent,
        homepageFeatured: siteSettings.homepageFeatured,
      });

      await updateEmailSettings({
        fromName: emailConfig.fromName,
        fromEmail: emailConfig.fromEmail,
        replyTo: emailConfig.replyTo,
        smtpHost: emailConfig.smtpHost,
        smtpPort: Number(emailConfig.smtpPort) || 587,
        smtpUsername: emailConfig.smtpUsername,
        smtpPassword: emailConfig.smtpPassword,
        smtpSecure: emailConfig.smtpSecure,
        welcomeSubject: emailConfig.welcomeSubject,
        newPostSubjectTemplate: emailConfig.newPostSubjectTemplate,
      });

      setSuccessMessage('Settings saved.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save settings.');
    } finally {
      setIsSaving(false);
    }
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
          disabled={isSaving}
          className="bg-[#B8B1F5] text-[#0B0D10] hover:bg-[#a59eef] rounded-full"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {(error || successMessage) && (
        <div
          className={`mb-6 rounded-2xl border px-4 py-3 text-sm ${
            error
              ? 'border-red-200 bg-red-50 text-red-700'
              : 'border-green-200 bg-green-50 text-green-700'
          }`}
        >
          {error || successMessage}
        </div>
      )}

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
          <TabsTrigger value="email">
            <Server className="w-4 h-4 mr-2" />
            Email
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
                <Label htmlFor="siteUrl">Site URL</Label>
                <Input
                  id="siteUrl"
                  value={generalSettings.siteUrl}
                  onChange={(e) =>
                    setGeneralSettings({ ...generalSettings, siteUrl: e.target.value })
                  }
                  placeholder="https://yourdomain.com"
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
                <Label htmlFor="logo">Logo URL</Label>
                <Input
                  id="logo"
                  value={generalSettings.logo}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, logo: e.target.value })}
                  placeholder="/logo.svg"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="favicon">Favicon URL</Label>
                <Input
                  id="favicon"
                  value={generalSettings.favicon}
                  onChange={(e) =>
                    setGeneralSettings({ ...generalSettings, favicon: e.target.value })
                  }
                  placeholder="/favicon.ico"
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

              <div>
                <Label htmlFor="affiliateDisclaimer">Affiliate Disclaimer</Label>
                <Textarea
                  id="affiliateDisclaimer"
                  value={generalSettings.affiliateDisclaimer}
                  onChange={(e) =>
                    setGeneralSettings({
                      ...generalSettings,
                      affiliateDisclaimer: e.target.value,
                    })
                  }
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="googleAnalytics">Google Analytics ID</Label>
                <Input
                  id="googleAnalytics"
                  value={generalSettings.googleAnalytics}
                  onChange={(e) =>
                    setGeneralSettings({
                      ...generalSettings,
                      googleAnalytics: e.target.value,
                    })
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="facebookPixel">Facebook Pixel ID</Label>
                <Input
                  id="facebookPixel"
                  value={generalSettings.facebookPixel}
                  onChange={(e) =>
                    setGeneralSettings({
                      ...generalSettings,
                      facebookPixel: e.target.value,
                    })
                  }
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

              <div>
                <Label htmlFor="defaultOgImage">Default OG Image</Label>
                <Input
                  id="defaultOgImage"
                  value={seoSettings.defaultOgImage}
                  onChange={(e) =>
                    setSeoSettings({ ...seoSettings, defaultOgImage: e.target.value })
                  }
                  placeholder="https://..."
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

        <TabsContent value="email">
          <div className="bg-white rounded-[28px] p-6 border border-[rgba(11,13,16,0.08)] max-w-2xl">
            <h2 className="text-lg font-semibold text-[#0B0D10] mb-6">Email Delivery</h2>
            <div className="space-y-6">
              <div>
                <Label htmlFor="fromName">From Name</Label>
                <Input
                  id="fromName"
                  value={emailConfig.fromName}
                  onChange={(e) =>
                    setEmailConfig({ ...emailConfig, fromName: e.target.value })
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="fromEmail">From Email</Label>
                <Input
                  id="fromEmail"
                  type="email"
                  value={emailConfig.fromEmail}
                  onChange={(e) =>
                    setEmailConfig({ ...emailConfig, fromEmail: e.target.value })
                  }
                  placeholder="newsletter@yourdomain.com"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="replyTo">Reply-To</Label>
                <Input
                  id="replyTo"
                  type="email"
                  value={emailConfig.replyTo}
                  onChange={(e) =>
                    setEmailConfig({ ...emailConfig, replyTo: e.target.value })
                  }
                  placeholder="hello@yourdomain.com"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="smtpHost">SMTP Host</Label>
                <Input
                  id="smtpHost"
                  value={emailConfig.smtpHost}
                  onChange={(e) =>
                    setEmailConfig({ ...emailConfig, smtpHost: e.target.value })
                  }
                  placeholder="smtp.example.com"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <Label htmlFor="smtpPort">SMTP Port</Label>
                  <Input
                    id="smtpPort"
                    type="number"
                    value={emailConfig.smtpPort}
                    onChange={(e) =>
                      setEmailConfig({ ...emailConfig, smtpPort: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-[rgba(11,13,16,0.08)] px-4 py-3 self-end">
                  <div>
                    <p className="font-medium text-[#0B0D10]">Use secure SMTP</p>
                    <p className="text-sm text-[#6D727A]">Usually enabled for port 465.</p>
                  </div>
                  <Switch
                    checked={emailConfig.smtpSecure}
                    onCheckedChange={(checked) =>
                      setEmailConfig({ ...emailConfig, smtpSecure: checked })
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="smtpUsername">SMTP Username</Label>
                <Input
                  id="smtpUsername"
                  value={emailConfig.smtpUsername}
                  onChange={(e) =>
                    setEmailConfig({ ...emailConfig, smtpUsername: e.target.value })
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="smtpPassword">SMTP Password</Label>
                <Input
                  id="smtpPassword"
                  type="password"
                  value={emailConfig.smtpPassword}
                  onChange={(e) =>
                    setEmailConfig({ ...emailConfig, smtpPassword: e.target.value })
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="welcomeSubject">Welcome Email Subject</Label>
                <Input
                  id="welcomeSubject"
                  value={emailConfig.welcomeSubject}
                  onChange={(e) =>
                    setEmailConfig({ ...emailConfig, welcomeSubject: e.target.value })
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="newPostSubjectTemplate">New Post Subject Template</Label>
                <Input
                  id="newPostSubjectTemplate"
                  value={emailConfig.newPostSubjectTemplate}
                  onChange={(e) =>
                    setEmailConfig({
                      ...emailConfig,
                      newPostSubjectTemplate: e.target.value,
                    })
                  }
                  className="mt-1"
                />
                <p className="text-xs text-[#6D727A] mt-1">
                  Supported placeholders: {'{siteName}'}, {'{postTitle}'}
                </p>
              </div>
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
