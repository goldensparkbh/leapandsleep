import { httpsCallable } from 'firebase/functions';
import { functions } from '@/config/firebase';

export interface SubscribeToNewsletterInput {
  email: string;
  firstName?: string;
  source?: string;
  pageUrl?: string;
}

interface SubscribeToNewsletterResponse {
  status: 'subscribed' | 'already-subscribed' | 'reactivated';
  emailSent: boolean;
}

interface UnsubscribeNewsletterInput {
  token: string;
}

interface UnsubscribeNewsletterResponse {
  status: 'unsubscribed' | 'already-unsubscribed';
}

const subscribeToNewsletterCallable = httpsCallable<
  SubscribeToNewsletterInput,
  SubscribeToNewsletterResponse
>(functions, 'subscribeToNewsletter');

const unsubscribeNewsletterCallable = httpsCallable<
  UnsubscribeNewsletterInput,
  UnsubscribeNewsletterResponse
>(functions, 'unsubscribeNewsletter');

export async function subscribeToNewsletter(input: SubscribeToNewsletterInput) {
  const result = await subscribeToNewsletterCallable(input);
  return result.data;
}

export async function unsubscribeNewsletter(token: string) {
  const result = await unsubscribeNewsletterCallable({ token });
  return result.data;
}
