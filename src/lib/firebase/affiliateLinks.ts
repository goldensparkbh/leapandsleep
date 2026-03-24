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

export interface AffiliateLinkUpsertInput {
  name: string;
  destinationUrl?: string;
  cloakedPath?: string;
  toolId?: string;
  campaignLabel?: string;
  notes?: string;
  isActive?: boolean;
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

function normalizeOptionalValue(value?: string) {
  const trimmedValue = String(value || '').trim();
  return trimmedValue || null;
}

function buildAffiliateLinkPayload(input: AffiliateLinkUpsertInput) {
  return {
    name: input.name.trim(),
    destinationUrl: normalizeOptionalValue(input.destinationUrl),
    cloakedPath: normalizeOptionalValue(input.cloakedPath),
    toolId: normalizeOptionalValue(input.toolId),
    campaignLabel: normalizeOptionalValue(input.campaignLabel),
    notes: normalizeOptionalValue(input.notes),
    isActive: input.isActive ?? true,
    updatedAt: serverTimestamp(),
  };
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

export async function createAffiliateLink(input: AffiliateLinkUpsertInput) {
  const docRef = await addDoc(affiliateLinksCollection, {
    ...buildAffiliateLinkPayload(input),
    clickCount: 0,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function updateAffiliateLink(id: string, input: AffiliateLinkUpsertInput) {
  await updateDoc(doc(affiliateLinksCollection, id), buildAffiliateLinkPayload(input));
}

export async function deleteAffiliateLink(id: string) {
  await deleteDoc(doc(affiliateLinksCollection, id));
}
