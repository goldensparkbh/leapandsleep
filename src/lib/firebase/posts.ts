import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type QuerySnapshot,
  type DocumentData,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, functions, storage } from '@/config/firebase';
import { getPlainTextFromBlocks, htmlToPlainText } from '@/lib/posts';
import type { ContentBlock, FAQ, Post, PostStatus, PostSection } from '@/types';
import { calculateReadingTime } from '@/utils/helpers';

interface FirestorePost {
  title?: string;
  slug?: string;
  summary?: string;
  content?: ContentBlock[];
  contentHtml?: string;
  section?: PostSection;
  categories?: string[];
  tags?: string[];
  authorId?: string;
  authorName?: string;
  authorPhotoURL?: string;
  featuredImage?: string;
  status?: PostStatus;
  publishDate?: Timestamp | null;
  updatedAt?: Timestamp | null;
  createdAt?: Timestamp | null;
  seoTitle?: string;
  metaDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  readingTime?: number;
  faqs?: Post['faqs'];
  relatedTools?: string[];
  relatedPosts?: string[];
  isFeatured?: boolean;
  allowComments?: boolean;
  isPillarContent?: boolean;
  affiliateBlocks?: Post['affiliateBlocks'];
  viewCount?: number;
}

export interface PostUpsertInput {
  title: string;
  slug: string;
  summary: string;
  content: ContentBlock[];
  contentHtml?: string;
  section: PostSection;
  status: PostStatus;
  featuredImage: string;
  tags: string[];
  seoTitle?: string;
  metaDescription?: string;
  isFeatured: boolean;
  allowComments: boolean;
  publishDate?: Date;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
  faqs?: FAQ[];
}

const postsCollection = collection(db, 'posts');
const DEFAULT_POST_AUTHOR_NAME = 'Alexandar';
const recordPostViewCallable = httpsCallable<{ postId: string }, { counted: boolean; reason?: string }>(
  functions,
  'recordPostView'
);

function looksLikeEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function normalizeAuthorName(value?: string | null) {
  const trimmedValue = String(value || '').trim();

  if (!trimmedValue || looksLikeEmail(trimmedValue)) {
    return DEFAULT_POST_AUTHOR_NAME;
  }

  return trimmedValue;
}

function toDate(value?: Timestamp | null) {
  return value instanceof Timestamp ? value.toDate() : undefined;
}

function normalizeContentBlock(block: ContentBlock): ContentBlock {
  return {
    id: block.id,
    type: block.type,
    content: block.content,
    level: block.level,
    items: block.items,
    imageUrl: block.imageUrl,
    alt: block.alt,
    caption: block.caption,
    style: block.style,
    affiliateId: block.affiliateId,
    comparisonId: block.comparisonId,
    faqs: block.faqs,
  };
}

function snapshotToPosts(snapshot: QuerySnapshot<DocumentData, DocumentData>): Post[] {
  return snapshot.docs.map((snapshotDoc) => {
    const data = snapshotDoc.data() as FirestorePost;

    return {
      id: snapshotDoc.id,
      title: data.title || '',
      slug: data.slug || '',
      summary: data.summary || '',
      content: (data.content || []).map(normalizeContentBlock),
      contentHtml: data.contentHtml || '',
      section: data.section || 'start-the-leap',
      categories: data.categories || [],
      tags: data.tags || [],
      authorId: data.authorId || '',
      authorName: normalizeAuthorName(data.authorName),
      authorPhotoURL: data.authorPhotoURL,
      featuredImage: data.featuredImage,
      status: data.status || 'draft',
      publishDate: toDate(data.publishDate),
      updatedAt: toDate(data.updatedAt) || new Date(),
      createdAt: toDate(data.createdAt) || new Date(),
      seoTitle: data.seoTitle,
      metaDescription: data.metaDescription,
      ogImage: data.ogImage,
      canonicalUrl: data.canonicalUrl,
      readingTime: data.readingTime || 1,
      faqs: data.faqs || [],
      relatedTools: data.relatedTools || [],
      relatedPosts: data.relatedPosts || [],
      isFeatured: data.isFeatured || false,
      allowComments: data.allowComments !== false,
      isPillarContent: data.isPillarContent || false,
      affiliateBlocks: data.affiliateBlocks || [],
      viewCount: data.viewCount || 0,
    };
  });
}

function buildPostPayload(input: PostUpsertInput) {
  const plainTextContent = input.contentHtml
    ? htmlToPlainText(input.contentHtml)
    : getPlainTextFromBlocks(input.content);

  return {
    title: input.title,
    slug: input.slug,
    summary: input.summary,
    content: input.content,
    contentHtml: input.contentHtml || '',
    section: input.section,
    categories: [],
    tags: input.tags,
    authorId: input.authorId,
    authorName: normalizeAuthorName(input.authorName),
    authorPhotoURL: input.authorPhotoURL || null,
    featuredImage: input.featuredImage,
    status: input.status,
    publishDate: input.publishDate ? Timestamp.fromDate(input.publishDate) : null,
    seoTitle: input.seoTitle || '',
    metaDescription: input.metaDescription || '',
    ogImage: input.featuredImage,
    canonicalUrl: '',
    readingTime: calculateReadingTime(plainTextContent),
    faqs: input.faqs || [],
    relatedTools: [],
    relatedPosts: [],
    isFeatured: input.isFeatured,
    allowComments: input.allowComments,
    isPillarContent: false,
    affiliateBlocks: [],
  };
}

export function subscribeToPosts(
  onPosts: (posts: Post[]) => void,
  onError: (error: Error) => void
) {
  const postsQuery = query(postsCollection, orderBy('updatedAt', 'desc'));

  return onSnapshot(
    postsQuery,
    (snapshot) => onPosts(snapshotToPosts(snapshot)),
    (error) => onError(error)
  );
}

export async function createPost(input: PostUpsertInput) {
  const payload = buildPostPayload(input);
  const docRef = await addDoc(postsCollection, {
    ...payload,
    viewCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function updatePost(id: string, input: PostUpsertInput) {
  const payload = buildPostPayload(input);

  await updateDoc(doc(db, 'posts', id), {
    ...payload,
    updatedAt: serverTimestamp(),
  });
}

export async function deletePost(id: string) {
  await deleteDoc(doc(db, 'posts', id));
}

export async function incrementPostViews(id: string) {
  await recordPostViewCallable({ postId: id });
}

export async function uploadPostImage(file: File) {
  const safeName = file.name.replace(/[^\w.-]/g, '-');
  const storageRef = ref(storage, `public/posts/${Date.now()}-${safeName}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}
