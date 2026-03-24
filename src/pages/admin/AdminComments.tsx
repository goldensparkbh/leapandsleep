import { useEffect, useState } from 'react';
import { Ban, Eye, EyeOff, Loader2, MessageSquareText, Search, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import {
  blockCommentIp,
  deleteComment,
  setCommentStatus,
  subscribeToAdminComments,
  subscribeToBlockedCommentIps,
  subscribeToCommentModerationRecords,
  unblockCommentIp,
} from '@/lib/firebase/comments';
import { formatDate } from '@/utils/helpers';
import type {
  BlockedCommentIp,
  CommentModerationRecord,
  PostComment,
  PostCommentStatus,
} from '@/types';

type CommentFilter = 'all' | 'visible' | 'hidden';

export function AdminComments() {
  const { currentUser } = useAuth();
  const [comments, setComments] = useState<PostComment[]>([]);
  const [moderationRecords, setModerationRecords] = useState<CommentModerationRecord[]>([]);
  const [blockedIps, setBlockedIps] = useState<BlockedCommentIp[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<CommentFilter>('all');
  const [pageError, setPageError] = useState('');
  const [loadingState, setLoadingState] = useState({
    comments: true,
    moderation: true,
    blockedIps: true,
  });
  const [processingCommentId, setProcessingCommentId] = useState<string | null>(null);
  const [processingIpHash, setProcessingIpHash] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribeComments = subscribeToAdminComments(
      (nextComments) => {
        setComments(nextComments);
        setLoadingState((current) => ({ ...current, comments: false }));
      },
      (error) => {
        setPageError(error.message || 'Could not load comments.');
        setLoadingState((current) => ({ ...current, comments: false }));
      },
    );

    const unsubscribeModeration = subscribeToCommentModerationRecords(
      (nextRecords) => {
        setModerationRecords(nextRecords);
        setLoadingState((current) => ({ ...current, moderation: false }));
      },
      (error) => {
        setPageError(error.message || 'Could not load comment moderation records.');
        setLoadingState((current) => ({ ...current, moderation: false }));
      },
    );

    const unsubscribeBlockedIps = subscribeToBlockedCommentIps(
      (nextEntries) => {
        setBlockedIps(nextEntries);
        setLoadingState((current) => ({ ...current, blockedIps: false }));
      },
      (error) => {
        setPageError(error.message || 'Could not load blocked IPs.');
        setLoadingState((current) => ({ ...current, blockedIps: false }));
      },
    );

    return () => {
      unsubscribeComments();
      unsubscribeModeration();
      unsubscribeBlockedIps();
    };
  }, []);

  const moderationByCommentId: Record<string, CommentModerationRecord> = {};
  for (const record of moderationRecords) {
    moderationByCommentId[record.commentId] = record;
  }

  const blockedIpHashes = new Set(blockedIps.map((entry) => entry.ipHash));
  const filteredComments = comments.filter((comment) => {
    if (filter !== 'all' && comment.status !== filter) {
      return false;
    }

    const moderation = moderationByCommentId[comment.id];
    const haystack = [
      comment.postTitle,
      comment.authorName,
      comment.content,
      moderation?.authorEmail,
      moderation?.guestIp,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return haystack.includes(searchQuery.trim().toLowerCase());
  });

  const isLoading =
    loadingState.comments || loadingState.moderation || loadingState.blockedIps;

  const visibleCount = comments.filter((comment) => comment.status === 'visible').length;
  const hiddenCount = comments.filter((comment) => comment.status === 'hidden').length;

  const updateVisibility = async (commentId: string, status: PostCommentStatus) => {
    try {
      setProcessingCommentId(commentId);
      setPageError('');
      await setCommentStatus(commentId, status);
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Could not update the comment.');
    } finally {
      setProcessingCommentId(null);
    }
  };

  const handleDelete = async (comment: PostComment) => {
    const shouldDelete = window.confirm(
      `Delete this comment from ${comment.authorName}? This cannot be undone.`,
    );
    if (!shouldDelete) return;

    try {
      setProcessingCommentId(comment.id);
      setPageError('');
      await deleteComment(comment.id);
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Could not delete the comment.');
    } finally {
      setProcessingCommentId(null);
    }
  };

  const handleBlockIp = async (comment: PostComment) => {
    const moderation = moderationByCommentId[comment.id];
    if (!moderation?.guestIp || !moderation.guestIpHash) {
      setPageError('This comment does not have an IP address available to block.');
      return;
    }

    const shouldBlock = window.confirm(
      `Block IP ${moderation.guestIp}? This will also hide the current comment.`,
    );
    if (!shouldBlock) return;

    try {
      setProcessingCommentId(comment.id);
      setPageError('');
      await blockCommentIp({
        commentId: comment.id,
        commentAuthorName: comment.authorName,
        ipAddress: moderation.guestIp,
        ipHash: moderation.guestIpHash,
        createdBy: currentUser?.displayName || currentUser?.email || currentUser?.uid,
        reason: `Blocked after moderation for "${comment.postTitle}"`,
      });
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Could not block the IP.');
    } finally {
      setProcessingCommentId(null);
    }
  };

  const handleUnblock = async (entry: BlockedCommentIp) => {
    const shouldUnblock = window.confirm(`Unblock IP ${entry.ipAddress}?`);
    if (!shouldUnblock) return;

    try {
      setProcessingIpHash(entry.ipHash);
      setPageError('');
      await unblockCommentIp(entry.ipHash);
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Could not unblock the IP.');
    } finally {
      setProcessingIpHash(null);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#0B0D10]">Comments</h1>
          <p className="text-[#6D727A]">
            Review guest comments, hide or delete abuse, and block repeat offenders by IP.
          </p>
        </div>
      </div>

      {pageError ? (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {pageError}
        </div>
      ) : null}

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <SummaryCard label="All comments" value={comments.length} />
        <SummaryCard label="Visible" value={visibleCount} />
        <SummaryCard label="Hidden" value={hiddenCount} />
        <SummaryCard label="Blocked IPs" value={blockedIps.length} />
      </div>

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6D727A]" />
          <Input
            className="pl-10"
            placeholder="Search author, post, IP, email, or text..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {(['all', 'visible', 'hidden'] as CommentFilter[]).map((value) => (
            <Button
              key={value}
              type="button"
              variant={filter === value ? 'default' : 'outline'}
              className={
                filter === value
                  ? 'rounded-full bg-[#0B0D10] text-white hover:bg-[#1A1D21]'
                  : 'rounded-full'
              }
              onClick={() => setFilter(value)}
            >
              {value === 'all' ? 'All' : value === 'visible' ? 'Visible' : 'Hidden'}
            </Button>
          ))}
        </div>
      </div>

      <div className="rounded-[28px] border border-[rgba(11,13,16,0.08)] bg-white overflow-hidden">
        {isLoading ? (
          <div className="px-6 py-12 text-center text-[#6D727A]">Loading comments...</div>
        ) : filteredComments.length === 0 ? (
          <div className="px-6 py-12 text-center text-[#6D727A]">
            No comments matched the current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F6F7F9]">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-[#6D727A]">Comment</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-[#6D727A]">Source</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-[#6D727A]">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-[#6D727A]">Date</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-[#6D727A]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredComments.map((comment) => {
                  const moderation = moderationByCommentId[comment.id];
                  const isBlocked = moderation?.guestIpHash
                    ? blockedIpHashes.has(moderation.guestIpHash)
                    : false;
                  const isProcessing = processingCommentId === comment.id;

                  return (
                    <tr key={comment.id} className="border-t border-[rgba(11,13,16,0.08)] align-top">
                      <td className="px-6 py-4">
                        <p className="font-medium text-[#0B0D10]">{comment.authorName}</p>
                        <p className="mt-1 text-xs text-[#6D727A]">{comment.postTitle}</p>
                        <p className="mt-3 max-w-2xl whitespace-pre-wrap text-sm leading-7 text-[#454B54]">
                          {comment.content}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-[#0B0D10]">{moderation?.guestIp || 'Unknown IP'}</p>
                        <p className="mt-1 text-xs text-[#6D727A]">
                          {moderation?.authorEmail || 'No email provided'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-start gap-2">
                          <Badge
                            className={
                              comment.status === 'visible'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-amber-100 text-amber-700'
                            }
                          >
                            {comment.status === 'visible' ? 'Visible' : 'Hidden'}
                          </Badge>
                          {isBlocked ? (
                            <Badge className="bg-red-100 text-red-700">IP blocked</Badge>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-[#0B0D10]">{formatDate(comment.createdAt)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isProcessing}
                            onClick={() =>
                              updateVisibility(
                                comment.id,
                                comment.status === 'visible' ? 'hidden' : 'visible',
                              )
                            }
                          >
                            {isProcessing ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : comment.status === 'visible' ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                            {comment.status === 'visible' ? 'Hide' : 'Show'}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isProcessing || isBlocked || !moderation?.guestIpHash}
                            onClick={() => void handleBlockIp(comment)}
                          >
                            <Ban className="w-4 h-4" />
                            {isBlocked ? 'Blocked' : 'Block IP'}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-red-600"
                            disabled={isProcessing}
                            onClick={() => void handleDelete(comment)}
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-10 rounded-[28px] border border-[rgba(11,13,16,0.08)] bg-white overflow-hidden">
        <div className="border-b border-[rgba(11,13,16,0.08)] px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F6F7F9] text-[#0B0D10]">
              <MessageSquareText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#0B0D10]">Blocked IP addresses</h2>
              <p className="text-sm text-[#6D727A]">
                Unblock an IP here if you blocked someone by mistake.
              </p>
            </div>
          </div>
        </div>

        {blockedIps.length === 0 ? (
          <div className="px-6 py-10 text-sm text-[#6D727A]">No blocked IPs yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F6F7F9]">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-[#6D727A]">IP</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-[#6D727A]">Reason</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-[#6D727A]">Blocked</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-[#6D727A]">Action</th>
                </tr>
              </thead>
              <tbody>
                {blockedIps.map((entry) => (
                  <tr key={entry.id} className="border-t border-[rgba(11,13,16,0.08)]">
                    <td className="px-6 py-4">
                      <p className="font-medium text-[#0B0D10]">{entry.ipAddress}</p>
                      <p className="mt-1 text-xs text-[#6D727A]">
                        {entry.commentAuthorName || 'Unknown commenter'}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#454B54]">
                      {entry.reason || 'Blocked from comment moderation'}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#6D727A]">
                      {formatDate(entry.updatedAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={processingIpHash === entry.ipHash}
                        onClick={() => void handleUnblock(entry)}
                      >
                        {processingIpHash === entry.ipHash ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : null}
                        Unblock
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[24px] border border-[rgba(11,13,16,0.08)] bg-white px-5 py-4">
      <p className="text-sm text-[#6D727A]">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-[#0B0D10]">{value.toLocaleString()}</p>
    </div>
  );
}
