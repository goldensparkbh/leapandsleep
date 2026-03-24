import { httpsCallable } from 'firebase/functions';
import { functions } from '@/config/firebase';
import type { AiGeneratedPostDraft, PostSection } from '@/types';

interface GeneratePostDraftInput {
  title: string;
  section: PostSection;
}

interface GeneratePostDraftResponse extends AiGeneratedPostDraft {}

const generatePostDraftCallable = httpsCallable<
  GeneratePostDraftInput,
  GeneratePostDraftResponse
>(functions, 'generateBlogPostDraft');

export async function generateAiPostDraft(input: GeneratePostDraftInput) {
  const result = await generatePostDraftCallable(input);
  return result.data;
}
