import { useState } from 'react';
import {
  Copy,
  ExternalLink,
  Loader2,
  PencilLine,
  Plus,
  Search,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useData } from '@/contexts/DataContext';
import type { AffiliateLink } from '@/types';
import { copyToClipboard } from '@/utils/helpers';

interface AffiliateLinkFormState {
  name: string;
  destinationUrl: string;
  cloakedPath: string;
  campaignLabel: string;
  notes: string;
  isActive: boolean;
}

const EMPTY_FORM: AffiliateLinkFormState = {
  name: '',
  destinationUrl: '',
  cloakedPath: '',
  campaignLabel: '',
  notes: '',
  isActive: true,
};

function toFormState(link?: AffiliateLink | null): AffiliateLinkFormState {
  if (!link) return EMPTY_FORM;

  return {
    name: link.name,
    destinationUrl: link.destinationUrl || '',
    cloakedPath: link.cloakedPath || '',
    campaignLabel: link.campaignLabel || '',
    notes: link.notes || '',
    isActive: link.isActive,
  };
}

function normalizeCloakedPath(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return undefined;
  }

  return trimmedValue.startsWith('/') ? trimmedValue : `/${trimmedValue}`;
}

function isValidUrl(value: string) {
  try {
    const parsedUrl = new URL(value);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
}

export function AdminAffiliateLinks() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<AffiliateLink | null>(null);
  const [linkToDelete, setLinkToDelete] = useState<AffiliateLink | null>(null);
  const [formData, setFormData] = useState<AffiliateLinkFormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pendingToggleId, setPendingToggleId] = useState<string | null>(null);
  const { affiliateLinks, createAffiliateLink, updateAffiliateLink, deleteAffiliateLink } = useData();

  const filteredLinks = affiliateLinks.filter((link) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    return (
      link.name.toLowerCase().includes(query) ||
      link.destinationUrl.toLowerCase().includes(query) ||
      (link.cloakedPath || '').toLowerCase().includes(query) ||
      (link.campaignLabel || '').toLowerCase().includes(query) ||
      (link.notes || '').toLowerCase().includes(query)
    );
  });

  const resetDialogState = () => {
    setIsDialogOpen(false);
    setEditingLink(null);
    setFormData(EMPTY_FORM);
    setFormError(null);
  };

  const openCreateDialog = () => {
    setEditingLink(null);
    setFormData(EMPTY_FORM);
    setFormError(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (link: AffiliateLink) => {
    setEditingLink(link);
    setFormData(toFormState(link));
    setFormError(null);
    setIsDialogOpen(true);
  };

  const handleCopy = async (url: string) => {
    if (!url) return;

    try {
      await copyToClipboard(url);
      setPageError(null);
    } catch {
      setPageError('Could not copy the affiliate URL.');
    }
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = formData.name.trim();
    const trimmedDestinationUrl = formData.destinationUrl.trim();

    if (!trimmedName) {
      setFormError('Name is required.');
      return;
    }

    if (trimmedDestinationUrl && !isValidUrl(trimmedDestinationUrl)) {
      setFormError('Destination URL must start with http:// or https://');
      return;
    }

    try {
      setIsSaving(true);
      setFormError(null);
      setPageError(null);

      const payload = {
        name: trimmedName,
        destinationUrl: trimmedDestinationUrl || undefined,
        cloakedPath: normalizeCloakedPath(formData.cloakedPath),
        campaignLabel: formData.campaignLabel.trim() || undefined,
        notes: formData.notes.trim() || undefined,
        isActive: formData.isActive,
      };

      if (editingLink) {
        await updateAffiliateLink(editingLink.id, payload);
      } else {
        await createAffiliateLink(payload);
      }

      resetDialogState();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Could not save affiliate link.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (link: AffiliateLink, isActive: boolean) => {
    try {
      setPendingToggleId(link.id);
      setPageError(null);

      await updateAffiliateLink(link.id, {
        name: link.name,
        destinationUrl: link.destinationUrl || undefined,
        cloakedPath: link.cloakedPath,
        toolId: link.toolId,
        campaignLabel: link.campaignLabel,
        notes: link.notes,
        isActive,
      });
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Could not update affiliate link.');
    } finally {
      setPendingToggleId(null);
    }
  };

  const handleDelete = async () => {
    if (!linkToDelete) return;

    try {
      setIsDeleting(true);
      setPageError(null);
      await deleteAffiliateLink(linkToDelete.id);
      setLinkToDelete(null);
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Could not delete affiliate link.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-[#0B0D10]">Affiliate Links</h1>
          <p className="text-[#6D727A]">
            Add your links, update AI-created drafts, and control which offers are active.
          </p>
        </div>
        <Button
          onClick={openCreateDialog}
          className="bg-[#B8B1F5] text-[#0B0D10] hover:bg-[#a59eef] rounded-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Link
        </Button>
      </div>

      {pageError ? (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {pageError}
        </div>
      ) : null}

      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6D727A]" />
        <Input
          placeholder="Search links, campaigns, notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="bg-white rounded-[28px] border border-[rgba(11,13,16,0.08)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F6F7F9]">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-[#6D727A]">Link</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-[#6D727A]">Campaign</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-[#6D727A]">Clicks</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-[#6D727A]">Status</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-[#6D727A]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLinks.length > 0 ? (
                filteredLinks.map((link) => (
                  <tr key={link.id} className="border-t border-[rgba(11,13,16,0.08)] align-top">
                    <td className="px-6 py-4">
                      <p className="font-medium text-[#0B0D10]">{link.name}</p>
                      <p className="text-sm text-[#6D727A] break-all">
                        {link.destinationUrl || 'Destination URL pending review'}
                      </p>
                      {link.cloakedPath ? (
                        <p className="mt-1 text-xs text-[#6D727A]">Path: {link.cloakedPath}</p>
                      ) : null}
                      {link.notes ? (
                        <p className="mt-2 text-xs text-[#6D727A] line-clamp-2">{link.notes}</p>
                      ) : null}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary" className="bg-[#F6F7F9] text-[#0B0D10]">
                        {link.campaignLabel || 'Default'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-[#0B0D10]">
                        <TrendingUp className="w-4 h-4 text-[#B8B1F5]" />
                        <span>{link.clickCount.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Badge
                          className={
                            link.isActive && link.destinationUrl
                              ? 'bg-green-100 text-green-700'
                              : 'bg-amber-100 text-amber-700'
                          }
                        >
                          {link.isActive && link.destinationUrl ? 'Active' : 'Needs Review'}
                        </Badge>
                        <Switch
                          checked={link.isActive}
                          disabled={pendingToggleId === link.id}
                          onCheckedChange={(checked) => handleToggleActive(link, checked)}
                          aria-label={`Toggle ${link.name}`}
                        />
                        {pendingToggleId === link.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-[#6D727A]" />
                        ) : null}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(link)}>
                          <PencilLine className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={!link.destinationUrl}
                          onClick={() => handleCopy(link.destinationUrl)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        {link.destinationUrl ? (
                          <a href={link.destinationUrl} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="icon">
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </a>
                        ) : (
                          <Button variant="ghost" size="icon" disabled>
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => setLinkToDelete(link)}>
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="border-t border-[rgba(11,13,16,0.08)]">
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-[#6D727A]">
                    No affiliate links matched your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (isSaving) return;
          if (!open) {
            resetDialogState();
            return;
          }
          setIsDialogOpen(true);
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingLink ? 'Edit Affiliate Link' : 'Create Affiliate Link'}</DialogTitle>
            <DialogDescription>
              Add your real destination URL, campaign label, notes, and cloaked path here.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="affiliate-name">Name</Label>
                <Input
                  id="affiliate-name"
                  value={formData.name}
                  onChange={(e) => setFormData((current) => ({ ...current, name: e.target.value }))}
                  placeholder="ConvertKit Default"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="affiliate-destination">Destination URL</Label>
                <Input
                  id="affiliate-destination"
                  value={formData.destinationUrl}
                  onChange={(e) =>
                    setFormData((current) => ({ ...current, destinationUrl: e.target.value }))
                  }
                  placeholder="https://partner.example.com/?ref=your-id"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="affiliate-path">Cloaked Path</Label>
                <Input
                  id="affiliate-path"
                  value={formData.cloakedPath}
                  onChange={(e) =>
                    setFormData((current) => ({ ...current, cloakedPath: e.target.value }))
                  }
                  placeholder="/go/convertkit"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="affiliate-campaign">Campaign Label</Label>
                <Input
                  id="affiliate-campaign"
                  value={formData.campaignLabel}
                  onChange={(e) =>
                    setFormData((current) => ({ ...current, campaignLabel: e.target.value }))
                  }
                  placeholder="homepage"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="affiliate-notes">Notes</Label>
                <Textarea
                  id="affiliate-notes"
                  value={formData.notes}
                  onChange={(e) => setFormData((current) => ({ ...current, notes: e.target.value }))}
                  rows={4}
                  placeholder="Add internal notes about the offer, placement, or review status."
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-[rgba(11,13,16,0.08)] px-4 py-3">
              <div>
                <p className="text-sm font-medium text-[#0B0D10]">Active link</p>
                <p className="text-xs text-[#6D727A]">
                  Turn this off to keep the link in the system without using it live.
                </p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData((current) => ({ ...current, isActive: checked }))
                }
                aria-label="Toggle affiliate link active state"
              />
            </div>

            {formError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {formError}
              </div>
            ) : null}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetDialogState} disabled={isSaving}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-[#0B0D10] text-white hover:bg-[#1f2329]"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {editingLink ? 'Save Changes' : 'Create Link'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(linkToDelete)} onOpenChange={(open) => (!open ? setLinkToDelete(null) : null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete affiliate link?</AlertDialogTitle>
            <AlertDialogDescription>
              {linkToDelete
                ? `This will permanently remove "${linkToDelete.name}" from your affiliate links list.`
                : 'This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
