import {
  Timestamp,
  collection,
  onSnapshot,
  orderBy,
  query,
  type DocumentData,
  type QuerySnapshot,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { Subscriber } from '@/types';

interface FirestoreSubscriber {
  email?: string;
  emailLower?: string;
  firstName?: string | null;
  source?: string;
  pageUrl?: string | null;
  subscribedAt?: Timestamp | null;
  isActive?: boolean;
  tags?: string[];
  unsubscribeToken?: string | null;
  unsubscribedAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

const subscribersCollection = collection(db, 'subscribers');

function toDate(value?: Timestamp | null) {
  return value instanceof Timestamp ? value.toDate() : new Date();
}

function snapshotToSubscribers(
  snapshot: QuerySnapshot<DocumentData, DocumentData>
): Subscriber[] {
  return snapshot.docs.map((snapshotDoc) => {
    const data = snapshotDoc.data() as FirestoreSubscriber;

    return {
      id: snapshotDoc.id,
      email: String(data.email || snapshotDoc.id).trim(),
      emailLower: String(data.emailLower || data.email || snapshotDoc.id).trim().toLowerCase(),
      firstName: data.firstName ? String(data.firstName).trim() : undefined,
      source: String(data.source || 'newsletter').trim(),
      pageUrl: data.pageUrl ? String(data.pageUrl).trim() : undefined,
      subscribedAt: toDate(data.subscribedAt),
      isActive: data.isActive !== false,
      tags: Array.isArray(data.tags) ? data.tags.filter(Boolean) : [],
      unsubscribeToken: data.unsubscribeToken ? String(data.unsubscribeToken).trim() : undefined,
      unsubscribedAt: data.unsubscribedAt instanceof Timestamp ? data.unsubscribedAt.toDate() : undefined,
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : undefined,
    };
  });
}

export function subscribeToSubscribers(
  onSubscribers: (subscribers: Subscriber[]) => void,
  onError: (error: Error) => void
) {
  const subscribersQuery = query(subscribersCollection, orderBy('subscribedAt', 'desc'));

  return onSnapshot(
    subscribersQuery,
    (snapshot) => onSubscribers(snapshotToSubscribers(snapshot)),
    (error) => onError(error)
  );
}
