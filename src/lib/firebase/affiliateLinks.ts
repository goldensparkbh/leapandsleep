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
import type { AffiliateLink } from '@/types';

interface FirestoreAffiliateLink {
  name?: string;
  destinationUrl?: string;
  cloakedPath?: string;
  toolId?: string;
  campaignLabel?: string;
  notes?: string;
  isActive?: boolean;
  clickCount?: number;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

const affiliateLinksCollection = collection(db, 'affiliateLinks');

function toDate(value?: Timestamp | null) {
  return value instanceof Timestamp ? value.toDate() : new Date();
}

function snapshotToAffiliateLinks(snapshot: QuerySnapshot<DocumentData, DocumentData>): AffiliateLink[] {
  return snapshot.docs.map((snapshotDoc) => {
    const data = snapshotDoc.data() as FirestoreAffiliateLink;

    return {
      id: snapshotDoc.id,
      name: data.name || 'Untitled link',
      destinationUrl: data.destinationUrl || '',
      cloakedPath: data.cloakedPath,
      toolId: data.toolId,
      campaignLabel: data.campaignLabel,
      notes: data.notes,
      isActive: Boolean(data.isActive),
      clickCount: Number(data.clickCount || 0),
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
    };
  });
}

export function subscribeToAffiliateLinks(
  onLinks: (links: AffiliateLink[]) => void,
  onError: (error: Error) => void
) {
  const affiliateLinksQuery = query(affiliateLinksCollection, orderBy('updatedAt', 'desc'));

  return onSnapshot(
    affiliateLinksQuery,
    (snapshot) => onLinks(snapshotToAffiliateLinks(snapshot)),
    (error) => onError(error)
  );
}
