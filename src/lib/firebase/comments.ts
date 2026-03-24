import {
  Timestamp,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
  writeBatch,
  updateDoc,
  type DocumentData,
  type QuerySnapshot,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '@/config/firebase';
import type {
  BlockedCommentIp,
  CommentModerationRecord,
  PostComment,
  PostCommentStatus,
} from '@/types';

interface FirestoreComment {
  postId?: string;
  postSlug?: string;
  postTitle?: string;
  authorName?: string;
  content?: string;
  status?: PostCommentStatus;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

interface FirestoreCommentModerationRecord {
  commentId?: string;
  authorEmail?: string | null;
  guestIp?: string | null;
  guestIpHash?: string | null;
  userAgent?: string | null;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

interface FirestoreBlockedCommentIp {
  ipAddress?: string;
  ipHash?: string;
  reason?: string | null;
  commentId?: string | null;
  commentAuthorName?: string | null;
  createdBy?: string | null;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

interface SubmitPostCommentInput {
  postId: string;
  authorName: string;
  authorEmail?: string;
  content: string;
}

interface SubmitPostCommentResponse {
  commentId: string;
  status: PostCommentStatus;
}

const commentsCollection = collection(db, 'comments');
const commentModerationCollection = collection(db, 'commentModeration');
const blockedCommentIpsCollection = collection(db, 'blockedCommentIps');

const submitPostCommentCallable = httpsCallable<
  SubmitPostCommentInput,
  SubmitPostCommentResponse
>(functions, 'submitPostComment');

function toDate(value?: Timestamp | null) {
  return value instanceof Timestamp ? value.toDate() : new Date();
}

function snapshotToComments(snapshot: QuerySnapshot<DocumentData, DocumentData>): PostComment[] {
  return snapshot.docs.map((snapshotDoc) => {
    const data = snapshotDoc.data() as FirestoreComment;

    return {
      id: snapshotDoc.id,
      postId: data.postId || '',
      postSlug: data.postSlug || '',
      postTitle: data.postTitle || '',
      authorName: data.authorName || 'Guest',
      content: data.content || '',
      status: data.status || 'visible',
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
    };
  });
}

function snapshotToCommentModeration(
  snapshot: QuerySnapshot<DocumentData, DocumentData>,
): CommentModerationRecord[] {
  return snapshot.docs.map((snapshotDoc) => {
    const data = snapshotDoc.data() as FirestoreCommentModerationRecord;

    return {
      id: snapshotDoc.id,
      commentId: data.commentId || snapshotDoc.id,
      authorEmail: data.authorEmail || undefined,
      guestIp: data.guestIp || undefined,
      guestIpHash: data.guestIpHash || undefined,
      userAgent: data.userAgent || undefined,
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
    };
  });
}

function snapshotToBlockedCommentIps(
  snapshot: QuerySnapshot<DocumentData, DocumentData>,
): BlockedCommentIp[] {
  return snapshot.docs.map((snapshotDoc) => {
    const data = snapshotDoc.data() as FirestoreBlockedCommentIp;

    return {
      id: snapshotDoc.id,
      ipAddress: data.ipAddress || '',
      ipHash: data.ipHash || snapshotDoc.id,
      reason: data.reason || undefined,
      commentId: data.commentId || undefined,
      commentAuthorName: data.commentAuthorName || undefined,
      createdBy: data.createdBy || undefined,
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
    };
  });
}

export async function submitPostComment(input: SubmitPostCommentInput) {
  const result = await submitPostCommentCallable(input);
  return result.data;
}

export function subscribeToVisibleComments(
  postId: string,
  onComments: (comments: PostComment[]) => void,
  onError: (error: Error) => void,
) {
  const commentsQuery = query(
    commentsCollection,
    where('postId', '==', postId),
    where('status', '==', 'visible'),
    orderBy('createdAt', 'desc'),
  );

  return onSnapshot(
    commentsQuery,
    (snapshot) => onComments(snapshotToComments(snapshot)),
    (error) => onError(error),
  );
}

export function subscribeToAdminComments(
  onComments: (comments: PostComment[]) => void,
  onError: (error: Error) => void,
) {
  const commentsQuery = query(commentsCollection, orderBy('createdAt', 'desc'));

  return onSnapshot(
    commentsQuery,
    (snapshot) => onComments(snapshotToComments(snapshot)),
    (error) => onError(error),
  );
}

export function subscribeToCommentModerationRecords(
  onRecords: (records: CommentModerationRecord[]) => void,
  onError: (error: Error) => void,
) {
  const moderationQuery = query(commentModerationCollection, orderBy('createdAt', 'desc'));

  return onSnapshot(
    moderationQuery,
    (snapshot) => onRecords(snapshotToCommentModeration(snapshot)),
    (error) => onError(error),
  );
}

export function subscribeToBlockedCommentIps(
  onEntries: (entries: BlockedCommentIp[]) => void,
  onError: (error: Error) => void,
) {
  const blockedIpsQuery = query(blockedCommentIpsCollection, orderBy('updatedAt', 'desc'));

  return onSnapshot(
    blockedIpsQuery,
    (snapshot) => onEntries(snapshotToBlockedCommentIps(snapshot)),
    (error) => onError(error),
  );
}

export async function setCommentStatus(commentId: string, status: PostCommentStatus) {
  await updateDoc(doc(commentsCollection, commentId), {
    status,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteComment(commentId: string) {
  const batch = writeBatch(db);
  batch.delete(doc(commentsCollection, commentId));
  batch.delete(doc(commentModerationCollection, commentId));
  await batch.commit();
}

interface BlockCommentIpInput {
  commentId: string;
  commentAuthorName: string;
  ipAddress: string;
  ipHash: string;
  createdBy?: string;
  reason?: string;
}

export async function blockCommentIp(input: BlockCommentIpInput) {
  const batch = writeBatch(db);

  batch.set(doc(blockedCommentIpsCollection, input.ipHash), {
    ipAddress: input.ipAddress,
    ipHash: input.ipHash,
    reason: input.reason || 'Blocked from comment moderation',
    commentId: input.commentId,
    commentAuthorName: input.commentAuthorName,
    createdBy: input.createdBy || null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  batch.update(doc(commentsCollection, input.commentId), {
    status: 'hidden',
    updatedAt: serverTimestamp(),
  });

  await batch.commit();
}

export async function unblockCommentIp(ipHash: string) {
  await deleteDoc(doc(blockedCommentIpsCollection, ipHash));
}
