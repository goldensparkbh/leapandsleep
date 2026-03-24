import { useEffect, useState } from 'react';
import { Loader2, MessageSquareText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { subscribeToVisibleComments, submitPostComment } from '@/lib/firebase/comments';
import { formatDate, getInitials, isValidEmail } from '@/utils/helpers';
import type { PostComment } from '@/types';

interface PostCommentsProps {
  postId: string;
  allowComments: boolean;
}

export function PostComments({ postId, allowComments }: PostCommentsProps) {
  const [comments, setComments] = useState<PostComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToVisibleComments(
      postId,
      (nextComments) => {
        setComments(nextComments);
        setIsLoading(false);
      },
      (subscriptionError) => {
        setError(subscriptionError.message || 'Could not load comments.');
        setIsLoading(false);
      },
    );

    return () => unsubscribe();
  }, [postId]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');

    const trimmedName = authorName.trim();
    const trimmedEmail = authorEmail.trim();
    const trimmedContent = content.trim();

    if (trimmedName.length < 2) {
      setError('Enter your name before posting.');
      return;
    }

    if (trimmedEmail && !isValidEmail(trimmedEmail)) {
      setError('Enter a valid email or leave it blank.');
      return;
    }

    if (trimmedContent.length < 8) {
      setError('Comment must be at least 8 characters.');
      return;
    }

    try {
      setIsSubmitting(true);
      await submitPostComment({
        postId,
        authorName: trimmedName,
        authorEmail: trimmedEmail || undefined,
        content: trimmedContent,
      });
      setContent('');
      setSuccessMessage('Comment posted successfully.');
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'Could not submit your comment.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mt-12" id="comments">
      <div className="rounded-[28px] border border-[rgba(11,13,16,0.08)] bg-white p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F6F7F9] text-[#0B0D10]">
            <MessageSquareText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-[#0B0D10]">
              Comments ({comments.length})
            </h2>
            <p className="text-sm text-[#6D727A]">
              Join the discussion or read what other visitors shared.
            </p>
          </div>
        </div>

        {allowComments ? (
          <form onSubmit={handleSubmit} className="mb-8 rounded-[24px] border border-[rgba(11,13,16,0.08)] bg-[#F6F7F9] p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="comment-name">Name</Label>
                <Input
                  id="comment-name"
                  value={authorName}
                  onChange={(event) => setAuthorName(event.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="comment-email">Email (optional)</Label>
                <Input
                  id="comment-email"
                  type="email"
                  value={authorEmail}
                  onChange={(event) => setAuthorEmail(event.target.value)}
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <Label htmlFor="comment-content">Comment</Label>
              <Textarea
                id="comment-content"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                rows={5}
                placeholder="Share your thoughts, questions, or experience."
              />
            </div>

            <p className="mt-3 text-xs text-[#6D727A]">
              Your email stays private. Comments from abusive IP addresses can be blocked by the admin.
            </p>

            {error ? (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            {successMessage ? (
              <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {successMessage}
              </div>
            ) : null}

            <div className="mt-4 flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full bg-[#0B0D10] text-white hover:bg-[#1A1D21]"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Post comment
              </Button>
            </div>
          </form>
        ) : (
          <div className="mb-8 rounded-[24px] border border-[rgba(11,13,16,0.08)] bg-[#F6F7F9] px-5 py-4 text-sm text-[#6D727A]">
            Comments are closed for this post.
          </div>
        )}

        {isLoading ? (
          <div className="py-6 text-sm text-[#6D727A]">Loading comments...</div>
        ) : comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map((comment) => (
              <article
                key={comment.id}
                className="rounded-[24px] border border-[rgba(11,13,16,0.08)] bg-[#FDFDFD] p-5"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#B8B1F5] font-medium text-[#0B0D10]">
                    {getInitials(comment.authorName)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <p className="font-medium text-[#0B0D10]">{comment.authorName}</p>
                      <p className="text-xs text-[#6D727A]">{formatDate(comment.createdAt)}</p>
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#454B54]">
                      {comment.content}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="py-6 text-sm text-[#6D727A]">
            No comments yet. Be the first to start the discussion.
          </div>
        )}
      </div>
    </section>
  );
}
