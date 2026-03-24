import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, Save, Sparkles, Upload } from 'lucide-react';
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
import { Switch } from '@/components/ui/switch';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { SITE_SECTIONS } from '@/constants/sections';
import { blocksToHtml, htmlToPlainText } from '@/lib/posts';
import { calculateReadingTime, getSectionLabel, slugify } from '@/utils/helpers';
import type {
  AiAffiliateSuggestion,
  AiGeneratedPostDraft,
  AiYoutubeSuggestion,
  FAQ,
  PostSection,
  PostStatus,
} from '@/types';

interface FormState {
  title: string;
  slug: string;
  summary: string;
  section: PostSection;
  status: PostStatus;
  contentHtml: string;
  seoTitle: string;
  metaDescription: string;
  featuredImage: string;
  tags: string;
  isFeatured: boolean;
  publishDate: string;
}

const EMPTY_FORM: FormState = {
  title: '',
  slug: '',
  summary: '',
  section: 'start-the-leap',
  status: 'draft',
  contentHtml: '<p></p>',
  seoTitle: '',
  metaDescription: '',
  featuredImage: '',
  tags: '',
  isFeatured: false,
  publishDate: '',
};

function toDateTimeLocalValue(date?: Date) {
  if (!date) return '';
  const localDate = new Date(date);
  localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
  return localDate.toISOString().slice(0, 16);
}

export function AdminPostEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { currentUser } = useAuth();
  const {
    posts,
    createPost,
    updatePost,
    uploadPostFeaturedImage,
    generateAiPostDraft,
    isLoading,
  } = useData();

  const existingPost = id ? posts.find((post) => post.id === id) : null;

  const [formData, setFormData] = useState<FormState>(EMPTY_FORM);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [hasCustomSlug, setHasCustomSlug] = useState(Boolean(id));
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiWarnings, setAiWarnings] = useState<string[]>([]);
  const [aiAffiliateSuggestions, setAiAffiliateSuggestions] = useState<AiAffiliateSuggestion[]>([]);
  const [aiYoutubeSuggestions, setAiYoutubeSuggestions] = useState<AiYoutubeSuggestion[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!existingPost) {
      if (!id) {
        setFormData(EMPTY_FORM);
        setFaqs([]);
        setAiWarnings([]);
        setAiAffiliateSuggestions([]);
        setAiYoutubeSuggestions([]);
        setHasCustomSlug(false);
      }
      return;
    }

    setFormData({
      title: existingPost.title,
      slug: existingPost.slug,
      summary: existingPost.summary,
      section: existingPost.section,
      status: existingPost.status,
      contentHtml: existingPost.contentHtml || blocksToHtml(existingPost.content),
      seoTitle: existingPost.seoTitle || '',
      metaDescription: existingPost.metaDescription || '',
      featuredImage: existingPost.featuredImage || '',
      tags: existingPost.tags.join(', '),
      isFeatured: existingPost.isFeatured,
      publishDate: toDateTimeLocalValue(existingPost.publishDate),
    });
    setFaqs(existingPost.faqs || []);
    setAiWarnings([]);
    setAiAffiliateSuggestions([]);
    setAiYoutubeSuggestions([]);
    setHasCustomSlug(true);
  }, [existingPost, id]);

  const handleTitleChange = (value: string) => {
    setFormData((current) => ({
      ...current,
      title: value,
      slug: hasCustomSlug ? current.slug : slugify(value),
    }));
  };

  const applyAiDraft = (draft: AiGeneratedPostDraft) => {
    setFormData((current) => ({
      ...current,
      title: draft.title,
      slug: draft.slug,
      summary: draft.summary,
      contentHtml: draft.contentHtml,
      seoTitle: draft.seoTitle,
      metaDescription: draft.metaDescription,
      featuredImage: draft.featuredImageUrl || current.featuredImage,
      tags: draft.tags.join(', '),
      section: draft.section,
    }));
    setFaqs(draft.faqs || []);
    setAiWarnings(draft.warnings || []);
    setAiAffiliateSuggestions(draft.affiliateSuggestions || []);
    setAiYoutubeSuggestions(draft.youtubeSuggestions || []);
    setHasCustomSlug(true);
  };

  const handleGenerateWithAi = async () => {
    setError('');

    if (!formData.title.trim()) {
      setError('Enter a title first, then generate the draft.');
      return;
    }

    const currentText = htmlToPlainText(formData.contentHtml);
    if (currentText && currentText !== '' && currentText !== ' ') {
      const shouldOverwrite = window.confirm(
        'Generating with AI will replace the current content, summary, SEO fields, and AI suggestions. Continue?'
      );
      if (!shouldOverwrite) return;
    }

    try {
      setIsGeneratingAi(true);
      const draft = await generateAiPostDraft(formData.title.trim(), formData.section);
      applyAiDraft(draft);
    } catch (generationError) {
      setError(
        generationError instanceof Error
          ? generationError.message
          : 'Could not generate the AI draft.'
      );
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleImageUpload = async (file?: File) => {
    if (!file) return;

    setError('');
    setIsUploadingImage(true);

    try {
      const imageUrl = await uploadPostFeaturedImage(file);
      setFormData((current) => ({ ...current, featuredImage: imageUrl }));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Could not upload image.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSave = async () => {
    setError('');

    const normalizedSlug = slugify(formData.slug || formData.title);
    const plainTextContent = htmlToPlainText(formData.contentHtml);

    if (!formData.title.trim()) {
      setError('Title is required.');
      return;
    }
    if (!normalizedSlug) {
      setError('Slug is required.');
      return;
    }
    if (posts.some((post) => post.slug === normalizedSlug && post.id !== existingPost?.id)) {
      setError('That slug is already in use.');
      return;
    }
    if (!formData.summary.trim()) {
      setError('Summary is required.');
      return;
    }
    if (!formData.featuredImage.trim()) {
      setError('Featured image is required.');
      return;
    }
    if (!plainTextContent.trim()) {
      setError('Add some content before saving.');
      return;
    }
    if (formData.status === 'scheduled' && !formData.publishDate) {
      setError('Scheduled posts need a publish date.');
      return;
    }
    if (!currentUser) {
      setError('You must be signed in to save posts.');
      return;
    }

    const publishDate = formData.publishDate ? new Date(formData.publishDate) : undefined;
    const resolvedPublishDate =
      formData.status === 'published'
        ? publishDate || existingPost?.publishDate || new Date()
        : formData.status === 'scheduled'
          ? publishDate
          : existingPost?.publishDate;

    try {
      setIsSaving(true);

      const payload = {
        title: formData.title.trim(),
        slug: normalizedSlug,
        summary: formData.summary.trim(),
        content: [],
        contentHtml: formData.contentHtml,
        section: formData.section,
        status: formData.status,
        featuredImage: formData.featuredImage.trim(),
        tags: formData.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        seoTitle: formData.seoTitle.trim(),
        metaDescription: formData.metaDescription.trim(),
        isFeatured: formData.isFeatured,
        publishDate: resolvedPublishDate,
        authorId: existingPost?.authorId || currentUser.uid,
        authorName:
          currentUser.displayName ||
          currentUser.email ||
          existingPost?.authorName ||
          'Admin',
        authorPhotoURL: currentUser.photoURL || existingPost?.authorPhotoURL || undefined,
        faqs,
      };

      if (existingPost) {
        await updatePost(existingPost.id, payload);
      } else {
        await createPost(payload);
      }

      navigate('/admin/posts');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save post.');
    } finally {
      setIsSaving(false);
    }
  };

  const canOpenLivePost = Boolean(existingPost?.slug && formData.status === 'published');
  const readingTime = calculateReadingTime(htmlToPlainText(formData.contentHtml));

  if (id && !isLoading && !existingPost) {
    return (
      <div className="p-6 lg:p-8">
        <div className="bg-white rounded-[28px] p-8 border border-[rgba(11,13,16,0.08)]">
          <h1 className="text-2xl font-semibold text-[#0B0D10] mb-2">Post not found</h1>
          <p className="text-[#6D727A] mb-6">This Firestore post no longer exists.</p>
          <Button onClick={() => navigate('/admin/posts')} variant="outline" className="rounded-full">
            Back to posts
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          void handleImageUpload(event.target.files?.[0]);
          event.target.value = '';
        }}
      />

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/posts')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-[#0B0D10]">
              {existingPost ? 'Edit Post' : 'New Post'}
            </h1>
            <p className="text-[#6D727A]">
              Write manually, generate with AI, or mix both.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="rounded-full"
            disabled={!canOpenLivePost}
            onClick={() => window.open(`/blog/${formData.slug}`, '_blank', 'noopener,noreferrer')}
          >
            <Eye className="w-4 h-4 mr-2" />
            View live
          </Button>
          <Button
            onClick={() => void handleSave()}
            disabled={isSaving || isUploadingImage || isGeneratingAi}
            className="bg-[#B8B1F5] text-[#0B0D10] hover:bg-[#a59eef] rounded-full"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[28px] p-6 border border-[rgba(11,13,16,0.08)]">
            <div className="space-y-4">
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(event) => handleTitleChange(event.target.value)}
                    placeholder="Post title"
                    className="mt-1"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full"
                  disabled={isGeneratingAi}
                  onClick={() => void handleGenerateWithAi()}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {isGeneratingAi ? 'Generating...' : 'Write with AI'}
                </Button>
              </div>

              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(event) => {
                    setHasCustomSlug(true);
                    setFormData((current) => ({ ...current, slug: slugify(event.target.value) }));
                  }}
                  placeholder="post-slug"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="summary">Summary</Label>
                <Textarea
                  id="summary"
                  value={formData.summary}
                  onChange={(event) =>
                    setFormData((current) => ({ ...current, summary: event.target.value }))
                  }
                  placeholder="Brief summary of the post"
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Content</Label>
                  <span className="text-xs text-[#6D727A]">{readingTime} min read</span>
                </div>
                <RichTextEditor
                  value={formData.contentHtml}
                  onChange={(contentHtml) =>
                    setFormData((current) => ({ ...current, contentHtml }))
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-[28px] p-6 border border-[rgba(11,13,16,0.08)]">
            <h3 className="font-semibold text-[#0B0D10] mb-4">AI Assistant</h3>
            <div className="space-y-4">
              <p className="text-sm text-[#6D727A]">
                AI uses the current title and section to draft the post body, featured image, SEO, FAQ, affiliate suggestions, and YouTube follow-ups.
              </p>
              <Button
                type="button"
                className="w-full rounded-full bg-[#0B0D10] text-white hover:bg-[#1A1D21]"
                disabled={isGeneratingAi}
                onClick={() => void handleGenerateWithAi()}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {isGeneratingAi ? 'Generating draft...' : 'Generate Full Draft'}
              </Button>

              {aiWarnings.length > 0 && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <p className="font-medium text-amber-900 mb-2">Warnings</p>
                  <ul className="list-disc pl-5 text-sm text-amber-800 space-y-1">
                    {aiWarnings.map((warning) => (
                      <li key={warning}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              {(aiAffiliateSuggestions.length > 0 || aiYoutubeSuggestions.length > 0 || faqs.length > 0) && (
                <div className="rounded-2xl border border-[rgba(11,13,16,0.08)] bg-[#F6F7F9] p-4 space-y-4">
                  {aiAffiliateSuggestions.length > 0 && (
                    <div>
                      <p className="font-medium text-[#0B0D10] mb-2">
                        Affiliate suggestions ({aiAffiliateSuggestions.length})
                      </p>
                      <div className="space-y-2">
                        {aiAffiliateSuggestions.map((suggestion) => (
                          <div key={`${suggestion.id}-${suggestion.name}`} className="rounded-xl bg-white p-3 border border-[rgba(11,13,16,0.08)]">
                            <p className="text-sm font-medium text-[#0B0D10]">{suggestion.name}</p>
                            <p className="text-xs text-[#6D727A] mt-1">{suggestion.reason}</p>
                            {suggestion.createdAsDraft && (
                              <p className="text-xs text-amber-700 mt-2">
                                Added to Affiliate Links as a draft item that still needs a real destination URL.
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {aiYoutubeSuggestions.length > 0 && (
                    <div>
                      <p className="font-medium text-[#0B0D10] mb-2">
                        YouTube suggestions ({aiYoutubeSuggestions.length})
                      </p>
                      <div className="space-y-2">
                        {aiYoutubeSuggestions.map((suggestion) => (
                          <div key={`${suggestion.placementHeading}-${suggestion.query}`} className="rounded-xl bg-white p-3 border border-[rgba(11,13,16,0.08)]">
                            <p className="text-sm font-medium text-[#0B0D10]">{suggestion.title}</p>
                            <p className="text-xs text-[#6D727A] mt-1">{suggestion.query}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {faqs.length > 0 && (
                    <div>
                      <p className="font-medium text-[#0B0D10] mb-2">FAQ section ({faqs.length})</p>
                      <p className="text-xs text-[#6D727A]">
                        The AI draft included FAQ content that will be saved with the post.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-[28px] p-6 border border-[rgba(11,13,16,0.08)]">
            <h3 className="font-semibold text-[#0B0D10] mb-4">Publishing</h3>
            <div className="space-y-4">
              <div>
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData((current) => ({ ...current, status: value as PostStatus }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Section</Label>
                <Select
                  value={formData.section}
                  onValueChange={(value) =>
                    setFormData((current) => ({ ...current, section: value as PostSection }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SITE_SECTIONS.map((section) => (
                      <SelectItem key={section} value={section}>
                        {getSectionLabel(section)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="publishDate">Publish Date</Label>
                <Input
                  id="publishDate"
                  type="datetime-local"
                  value={formData.publishDate}
                  onChange={(event) =>
                    setFormData((current) => ({ ...current, publishDate: event.target.value }))
                  }
                  className="mt-1"
                />
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-[rgba(11,13,16,0.08)] p-4">
                <div>
                  <p className="font-medium text-[#0B0D10]">Featured post</p>
                  <p className="text-sm text-[#6D727A]">Show this article in featured sections.</p>
                </div>
                <Switch
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) =>
                    setFormData((current) => ({ ...current, isFeatured: checked }))
                  }
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[28px] p-6 border border-[rgba(11,13,16,0.08)]">
            <h3 className="font-semibold text-[#0B0D10] mb-4">Media & Metadata</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="featuredImage">Featured Image URL</Label>
                <Input
                  id="featuredImage"
                  value={formData.featuredImage}
                  onChange={(event) =>
                    setFormData((current) => ({ ...current, featuredImage: event.target.value }))
                  }
                  placeholder="https://..."
                  className="mt-1"
                />
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full rounded-full"
                disabled={isUploadingImage}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                {isUploadingImage ? 'Uploading image...' : 'Upload to Firebase Storage'}
              </Button>

              <div>
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(event) =>
                    setFormData((current) => ({ ...current, tags: event.target.value }))
                  }
                  placeholder="ai tools, automation, affiliate marketing"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[28px] p-6 border border-[rgba(11,13,16,0.08)]">
            <h3 className="font-semibold text-[#0B0D10] mb-4">SEO</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="seoTitle">SEO Title</Label>
                <Input
                  id="seoTitle"
                  value={formData.seoTitle}
                  onChange={(event) =>
                    setFormData((current) => ({ ...current, seoTitle: event.target.value }))
                  }
                  placeholder="SEO title"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  value={formData.metaDescription}
                  onChange={(event) =>
                    setFormData((current) => ({ ...current, metaDescription: event.target.value }))
                  }
                  placeholder="Meta description"
                  rows={3}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 rounded-[28px] p-4 border border-red-200">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
