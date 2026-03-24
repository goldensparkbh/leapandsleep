import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type {
  Post,
  Tool,
  ToolCategory,
  Category,
  Comparison,
  Resource,
  AffiliateLink,
  AiGeneratedPostDraft,
  Subscriber,
  EmailSettings,
  SiteSettings,
} from '@/types';
import {
  sampleTools,
  sampleToolCategories,
  sampleCategories,
  sampleComparisons,
  sampleResources,
  defaultEmailSettings,
  defaultSiteSettings,
} from '@/data/sampleData';
import { useAuth } from '@/contexts/AuthContext';
import {
  createAffiliateLink as createAffiliateLinkDocument,
  deleteAffiliateLink as deleteAffiliateLinkDocument,
  subscribeToAffiliateLinks,
  updateAffiliateLink as updateAffiliateLinkDocument,
  type AffiliateLinkUpsertInput,
} from '@/lib/firebase/affiliateLinks';
import { generateAiPostDraft } from '@/lib/firebase/ai';
import {
  createPost as createPostDocument,
  deletePost as deletePostDocument,
  incrementPostViews,
  subscribeToPosts,
  updatePost as updatePostDocument,
  uploadPostImage,
  type PostUpsertInput,
} from '@/lib/firebase/posts';
import {
  subscribeToEmailSettings,
  subscribeToSiteSettings,
  updateEmailSettings as updateEmailSettingsDocument,
  updateSiteSettings as updateSiteSettingsDocument,
  type EmailSettingsUpsertInput,
  type SiteSettingsUpsertInput,
} from '@/lib/firebase/settings';
import { subscribeToSubscribers } from '@/lib/firebase/subscribers';

interface DataContextType {
  // Posts
  posts: Post[];
  publishedPosts: Post[];
  getPostBySlug: (slug: string) => Post | undefined;
  getPostsBySection: (section: string) => Post[];
  getFeaturedPosts: () => Post[];
  getRecentPosts: (limit?: number) => Post[];
  createPost: (input: PostUpsertInput) => Promise<string>;
  updatePost: (id: string, input: PostUpsertInput) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  incrementPostViewCount: (id: string) => Promise<void>;
  uploadPostFeaturedImage: (file: File) => Promise<string>;
  generateAiPostDraft: (title: string, section: Post['section']) => Promise<AiGeneratedPostDraft>;
  postsError: string | null;
  
  // Tools
  tools: Tool[];
  getToolBySlug: (slug: string) => Tool | undefined;
  getToolsByCategory: (categoryId: string) => Tool[];
  getFeaturedTools: () => Tool[];
  
  // Categories
  categories: Category[];
  toolCategories: ToolCategory[];
  getCategoryBySlug: (slug: string) => Category | undefined;
  
  // Comparisons
  comparisons: Comparison[];
  getComparisonBySlug: (slug: string) => Comparison | undefined;
  getFeaturedComparisons: () => Comparison[];
  
  // Resources
  resources: Resource[];
  getFeaturedResources: () => Resource[];
  
  // Affiliate Links
  affiliateLinks: AffiliateLink[];
  getAffiliateLinkById: (id: string) => AffiliateLink | undefined;
  createAffiliateLink: (input: AffiliateLinkUpsertInput) => Promise<string>;
  updateAffiliateLink: (id: string, input: AffiliateLinkUpsertInput) => Promise<void>;
  deleteAffiliateLink: (id: string) => Promise<void>;
  
  // Subscribers
  subscribers: Subscriber[];
  
  // Site Settings
  siteSettings: SiteSettings;
  emailSettings: EmailSettings;
  updateSiteSettings: (input: SiteSettingsUpsertInput) => Promise<void>;
  updateEmailSettings: (input: EmailSettingsUpsertInput) => Promise<void>;
  
  // Loading state
  isLoading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [postsError, setPostsError] = useState<string | null>(null);
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [tools] = useState<Tool[]>(sampleTools);
  const [toolCategories] = useState<ToolCategory[]>(sampleToolCategories);
  const [categories] = useState<Category[]>(sampleCategories);
  const [comparisons] = useState<Comparison[]>(sampleComparisons);
  const [resources] = useState<Resource[]>(sampleResources);
  const [affiliateLinks, setAffiliateLinks] = useState<AffiliateLink[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [emailSettings, setEmailSettings] = useState<EmailSettings>(defaultEmailSettings);

  useEffect(() => {
    const unsubscribe = subscribeToPosts(
      (nextPosts) => {
        setPosts(nextPosts);
        setPostsError(null);
        setIsLoading(false);
      },
      (error) => {
        console.error('Failed to load posts from Firestore', error);
        setPostsError(error.message);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToAffiliateLinks(
      (nextLinks) => setAffiliateLinks(nextLinks),
      (error) => {
        console.error('Failed to load affiliate links from Firestore', error);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToSiteSettings(
      (nextSettings) => setSiteSettings(nextSettings),
      (error) => {
        console.error('Failed to load site settings from Firestore', error);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setEmailSettings(defaultEmailSettings);
      return;
    }

    const unsubscribe = subscribeToEmailSettings(
      (nextSettings) => setEmailSettings(nextSettings),
      (error) => {
        console.error('Failed to load email settings from Firestore', error);
      }
    );

    return () => unsubscribe();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setSubscribers([]);
      return;
    }

    const unsubscribe = subscribeToSubscribers(
      (nextSubscribers) => setSubscribers(nextSubscribers),
      (error) => {
        console.error('Failed to load subscribers from Firestore', error);
      }
    );

    return () => unsubscribe();
  }, [isAuthenticated]);

  const publishedPosts = posts.filter((post) => post.status === 'published');

  const getPostBySlug = (slug: string) => publishedPosts.find(p => p.slug === slug);
  const getPostsBySection = (section: string) => publishedPosts.filter(p => p.section === section);
  const getFeaturedPosts = () => publishedPosts.filter(p => p.isFeatured);
  const getRecentPosts = (limit = 5) => 
    [...publishedPosts]
      .sort((a, b) => (b.publishDate?.getTime() || 0) - (a.publishDate?.getTime() || 0))
      .slice(0, limit);

  const createPost = (input: PostUpsertInput) => createPostDocument(input);
  const updatePost = (id: string, input: PostUpsertInput) => updatePostDocument(id, input);
  const deletePost = (id: string) => deletePostDocument(id);
  const incrementPostViewCount = (id: string) => incrementPostViews(id);
  const uploadPostFeaturedImage = (file: File) => uploadPostImage(file);
  const generatePostDraft = (title: string, section: Post['section']) =>
    generateAiPostDraft({ title, section });

  const getToolBySlug = (slug: string) => tools.find(t => t.slug === slug);
  const getToolsByCategory = (categoryId: string) => tools.filter(t => t.categoryId === categoryId);
  const getFeaturedTools = () => tools.filter(t => t.isFeatured);

  const getCategoryBySlug = (slug: string) => categories.find(c => c.slug === slug);

  const getComparisonBySlug = (slug: string) => comparisons.find(c => c.slug === slug);
  const getFeaturedComparisons = () => comparisons.filter(c => c.isFeatured);

  const getFeaturedResources = () => resources.filter(r => r.isFeatured);

  const getAffiliateLinkById = (id: string) => affiliateLinks.find(a => a.id === id);
  const createAffiliateLink = (input: AffiliateLinkUpsertInput) =>
    createAffiliateLinkDocument(input);
  const updateAffiliateLink = (id: string, input: AffiliateLinkUpsertInput) =>
    updateAffiliateLinkDocument(id, input);
  const deleteAffiliateLink = (id: string) => deleteAffiliateLinkDocument(id);
  const updateSiteSettings = (input: SiteSettingsUpsertInput) =>
    updateSiteSettingsDocument(input);
  const updateEmailSettings = (input: EmailSettingsUpsertInput) =>
    updateEmailSettingsDocument(input);

  const value: DataContextType = {
    posts,
    publishedPosts,
    getPostBySlug,
    getPostsBySection,
    getFeaturedPosts,
    getRecentPosts,
    createPost,
    updatePost,
    deletePost,
    incrementPostViewCount,
    uploadPostFeaturedImage,
    generateAiPostDraft: generatePostDraft,
    postsError,
    tools,
    getToolBySlug,
    getToolsByCategory,
    getFeaturedTools,
    categories,
    toolCategories,
    getCategoryBySlug,
    comparisons,
    getComparisonBySlug,
    getFeaturedComparisons,
    resources,
    getFeaturedResources,
    affiliateLinks,
    getAffiliateLinkById,
    createAffiliateLink,
    updateAffiliateLink,
    deleteAffiliateLink,
    subscribers,
    siteSettings,
    emailSettings,
    updateSiteSettings,
    updateEmailSettings,
    isLoading,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
