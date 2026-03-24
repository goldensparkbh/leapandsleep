export type UserRole = 'visitor' | 'subscriber' | 'editor' | 'admin';

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  isActive: boolean;
}

export type PostStatus = 'draft' | 'published' | 'scheduled' | 'archived';
export type PostSection = 'start-the-leap' | 'build-the-flow' | 'scale-in-sleep';

export interface Post {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: ContentBlock[];
  contentHtml?: string;
  section: PostSection;
  categories: string[];
  tags: string[];
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
  featuredImage?: string;
  status: PostStatus;
  publishDate?: Date;
  updatedAt: Date;
  createdAt: Date;
  seoTitle?: string;
  metaDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  readingTime: number;
  faqs?: FAQ[];
  relatedTools?: string[];
  relatedPosts?: string[];
  isFeatured: boolean;
  allowComments: boolean;
  isPillarContent: boolean;
  affiliateBlocks?: AffiliateBlock[];
  viewCount: number;
}

export type PostCommentStatus = 'visible' | 'hidden';

export interface PostComment {
  id: string;
  postId: string;
  postSlug: string;
  postTitle: string;
  authorName: string;
  content: string;
  status: PostCommentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommentModerationRecord {
  id: string;
  commentId: string;
  authorEmail?: string;
  guestIp?: string;
  guestIpHash?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BlockedCommentIp {
  id: string;
  ipAddress: string;
  ipHash: string;
  reason?: string;
  commentId?: string;
  commentAuthorName?: string;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentBlock {
  id: string;
  type: 'paragraph' | 'heading' | 'list' | 'image' | 'quote' | 'callout' | 'comparison' | 'pros-cons' | 'cta' | 'affiliate' | 'faq' | 'toc' | 'divider';
  content?: string;
  level?: number;
  items?: string[];
  imageUrl?: string;
  alt?: string;
  caption?: string;
  style?: 'info' | 'warning' | 'success' | 'tip';
  affiliateId?: string;
  comparisonId?: string;
  faqs?: FAQ[];
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export interface AffiliateBlock {
  id: string;
  toolId: string;
  position: 'inline' | 'sidebar' | 'bottom';
  style: 'card' | 'banner' | 'button';
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  section: PostSection;
  parentId?: string;
  displayOrder: number;
  isFeatured: boolean;
  postCount: number;
  image?: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  postCount: number;
}

export interface Tool {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  logo: string;
  images: string[];
  categoryId: string;
  pricingType: 'free' | 'freemium' | 'paid' | 'subscription';
  pricingDetails?: string;
  startingPrice?: string;
  keyFeatures: string[];
  bestFor: string[];
  pros: string[];
  cons: string[];
  editorRating: number;
  affiliateLinkId: string;
  couponCode?: string;
  couponOffer?: string;
  faqs?: FAQ[];
  alternatives: string[];
  relatedComparisons: string[];
  isFeatured: boolean;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
  clickCount: number;
}

export interface ToolCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  displayOrder: number;
  toolCount: number;
  isFeatured: boolean;
}

export interface AffiliateLink {
  id: string;
  name: string;
  destinationUrl: string;
  cloakedPath?: string;
  toolId?: string;
  campaignLabel?: string;
  notes?: string;
  isActive: boolean;
  clickCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Comparison {
  id: string;
  title: string;
  slug: string;
  description: string;
  categoryId: string;
  tools: ComparisonTool[];
  featuredWinnerId?: string;
  criteria: ComparisonCriteria[];
  content: ContentBlock[];
  isFeatured: boolean;
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
}

export interface ComparisonTool {
  toolId: string;
  toolSlug: string;
  toolName: string;
  toolLogo: string;
  ratings: Record<string, number | boolean>;
  affiliateLinkId: string;
}

export interface ComparisonCriteria {
  id: string;
  name: string;
  type: 'rating' | 'boolean' | 'text';
  weight: number;
}

export interface Resource {
  id: string;
  title: string;
  slug: string;
  description: string;
  type: 'template' | 'checklist' | 'planner' | 'guide' | 'calculator';
  downloadUrl?: string;
  image?: string;
  isFeatured: boolean;
  downloadCount: number;
  createdAt: Date;
}

export interface Subscriber {
  id: string;
  email: string;
  emailLower?: string;
  firstName?: string;
  source: string;
  pageUrl?: string;
  subscribedAt: Date;
  isActive: boolean;
  tags?: string[];
  unsubscribeToken?: string;
  unsubscribedAt?: Date;
  updatedAt?: Date;
}

export interface Lead {
  id: string;
  name?: string;
  email: string;
  message?: string;
  source: string;
  pageUrl?: string;
  status: 'new' | 'contacted' | 'qualified' | 'archived';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SiteSettings {
  id: string;
  siteName: string;
  siteUrl: string;
  tagline: string;
  logo: string;
  favicon: string;
  primaryColor: string;
  accentColor: string;
  socialLinks: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
    linkedin?: string;
  };
  seoDefaults: {
    titleTemplate: string;
    defaultDescription: string;
    defaultOgImage: string;
  };
  analyticsIds: {
    googleAnalytics?: string;
    facebookPixel?: string;
  };
  affiliateDisclaimer: string;
  footerContent: string;
  homepageFeatured: {
    featuredPosts: string[];
    featuredTools: string[];
    featuredComparisons: string[];
  };
}

export interface EmailSettings {
  id: string;
  fromName: string;
  fromEmail: string;
  replyTo?: string;
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  smtpSecure: boolean;
  welcomeSubject: string;
  newPostSubjectTemplate: string;
}

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video' | 'document';
  size: number;
  dimensions?: { width: number; height: number };
  uploadedAt: Date;
  uploadedBy: string;
  alt?: string;
  tags?: string[];
}

export interface SEOMetadata {
  id: string;
  path: string;
  title: string;
  description: string;
  ogImage?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  schemaType?: string;
  updatedAt: Date;
}

export interface Redirect {
  id: string;
  fromPath: string;
  toPath: string;
  type: '301' | '302';
  isActive: boolean;
  createdAt: Date;
}

export interface AiYoutubeSuggestion {
  placementHeading: string;
  title: string;
  query: string;
  reason: string;
}

export interface AiAffiliateSuggestion {
  id: string;
  name: string;
  destinationUrl: string;
  isActive: boolean;
  placementHeading: string;
  anchorText: string;
  reason: string;
  createdAsDraft: boolean;
}

export interface AiGeneratedPostDraft {
  title: string;
  slug: string;
  summary: string;
  seoTitle: string;
  metaDescription: string;
  tags: string[];
  section: PostSection;
  featuredImageUrl: string;
  featuredImagePrompt: string;
  contentHtml: string;
  youtubeSuggestions: AiYoutubeSuggestion[];
  affiliateSuggestions: AiAffiliateSuggestion[];
  faqs: FAQ[];
  warnings: string[];
}
