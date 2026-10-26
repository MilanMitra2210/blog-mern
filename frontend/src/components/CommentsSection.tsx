'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Comment, fetchComments, submitComment } from '@/lib/api';
import { 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  CornerDownRight, 
  ShieldCheck, 
  Sparkles, 
  User, 
  Reply, 
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface CommentsSectionProps {
  postId: string;
}

export interface ThreadedComment extends Comment {
  id: string;
  replies: ThreadedComment[];
}

interface CommentItemProps {
  comment: ThreadedComment;
  depth?: number;
  replyingToId: string | null;
  onStartReply: (comment: ThreadedComment) => void;
  onCancelReply: () => void;
  onSubmitReply: (parentId: string, name: string, email: string, text: string) => Promise<boolean>;
  submitting: boolean;
}

function CommentItem({
  comment,
  depth = 0,
  replyingToId,
  onStartReply,
  onCancelReply,
  onSubmitReply,
  submitting,
}: CommentItemProps) {
  const isReplying = replyingToId === comment.id;
  const [inlineName, setInlineName] = useState('');
  const [inlineEmail, setInlineEmail] = useState('');
  const [inlineContent, setInlineContent] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleInlineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineContent.trim() || !inlineName.trim() || !inlineEmail.trim()) return;
    const ok = await onSubmitReply(comment.id, inlineName, inlineEmail, inlineContent);
    if (ok) {
      setInlineContent('');
    }
  };

  const formattedDate = comment.createdAt
    ? new Date(comment.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  // Max visual indentation depth clamp to preserve layout on mobile
  const maxDepth = 4;
  const clampedDepth = Math.min(depth, maxDepth);

  return (
    <div className={`space-y-3 ${clampedDepth > 0 ? 'mt-3 sm:mt-4' : 'mt-4'}`}>
      <div 
        className={`relative group rounded-2xl p-4 sm:p-5 transition-all duration-200 border ${
          comment.isAdmin
            ? 'bg-linear-to-r from-sky-950/40 to-indigo-950/20 border-sky-500/30 shadow-md shadow-sky-950/20'
            : 'bg-gray-900/60 hover:bg-gray-900/80 border-gray-800/80 shadow-sm'
        }`}
      >
        {/* Branch line for nested comments */}
        {depth > 0 && (
          <div className="absolute -left-4 sm:-left-6 top-6 w-3 sm:w-5 h-0.5 bg-sky-500/40 rounded-full" />
        )}

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-inner ${
              comment.isAdmin
                ? 'bg-sky-500 text-white shadow-sky-400/30'
                : 'bg-linear-to-br from-gray-800 to-gray-700 text-sky-300 border border-gray-700'
            }`}>
              {comment.authorName ? comment.authorName.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold text-white tracking-tight">
                  {comment.authorName}
                </span>

                {comment.isAdmin && (
                  <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 text-[10px] font-black uppercase tracking-wider">
                    Author
                  </span>
                )}
              </div>

              <span className="text-[11px] text-gray-400 font-medium">
                {formattedDate}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {comment.replies.length > 0 && (
              <button
                type="button"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer text-xs flex items-center gap-1"
                title={isCollapsed ? 'Expand replies' : 'Collapse replies'}
              >
                {isCollapsed ? (
                  <>
                    <ChevronDown className="w-3.5 h-3.5 text-sky-400" />
                    <span className="text-[10px] text-sky-400 font-bold">+{comment.replies.length}</span>
                  </>
                ) : (
                  <ChevronUp className="w-3.5 h-3.5" />
                )}
              </button>
            )}

            <button
              type="button"
              onClick={() => (isReplying ? onCancelReply() : onStartReply(comment))}
              className={`text-xs font-semibold flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                isReplying
                  ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                  : 'bg-gray-800/60 hover:bg-sky-500/10 text-gray-400 hover:text-sky-300 border border-gray-800 hover:border-sky-500/30'
              }`}
            >
              {isReplying ? (
                <>
                  <X className="w-3 h-3" />
                  <span>Cancel</span>
                </>
              ) : (
                <>
                  <Reply className="w-3 h-3 text-sky-400" />
                  <span>Reply</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Comment Content */}
        <p className="text-sm text-gray-200 leading-relaxed mt-3 pl-1 sm:pl-12 whitespace-pre-wrap">
          {comment.content}
        </p>

        {/* Inline Reply Form */}
        {isReplying && (
          <form 
            onSubmit={handleInlineSubmit}
            className="mt-4 pt-4 border-t border-gray-800/80 space-y-3 sm:pl-12 animate-fadeIn"
          >
            <div className="flex items-center gap-1.5 text-xs text-sky-400 font-semibold mb-1">
              <CornerDownRight className="w-3.5 h-3.5" />
              <span>Replying to <strong>{comment.authorName}</strong></span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                required
                placeholder="Your Name *"
                value={inlineName}
                onChange={(e) => setInlineName(e.target.value)}
                className="px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-sky-500 transition-colors"
              />
              <input
                type="email"
                required
                placeholder="Your Email *"
                value={inlineEmail}
                onChange={(e) => setInlineEmail(e.target.value)}
                className="px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-sky-500 transition-colors"
              />
            </div>

            <textarea
              required
              rows={2}
              placeholder={`Write your technical reply to ${comment.authorName}...`}
              value={inlineContent}
              onChange={(e) => setInlineContent(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-sky-500 transition-colors resize-y"
            />

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onCancelReply}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 transition-colors shadow-md shadow-sky-600/30 disabled:opacity-50 cursor-pointer"
              >
                {submitting ? (
                  <span className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-3 h-3" />
                )}
                <span>Send Reply</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Recursive Nested Replies Container */}
      {!isCollapsed && comment.replies && comment.replies.length > 0 && (
        <div className="pl-4 sm:pl-6 border-l-2 border-sky-500/25 space-y-3 relative">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              replyingToId={replyingToId}
              onStartReply={onStartReply}
              onCancelReply={onCancelReply}
              onSubmitReply={onSubmitReply}
              submitting={submitting}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CommentsSection({ postId }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  
  // Main form fields (for new root comments or selected reply target)
  const [authorName, setAuthorName] = useState<string>('');
  const [authorEmail, setAuthorEmail] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [replyingToComment, setReplyingToComment] = useState<ThreadedComment | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const loadComments = async () => {
    setLoading(true);
    const data = await fetchComments(postId);
    setComments(data);
    setLoading(false);
  };

  useEffect(() => {
    if (postId) {
      loadComments();
    }
  }, [postId]);

  // Transform flat comment array into a hierarchical tree based on parentId
  const threadedComments = useMemo<ThreadedComment[]>(() => {
    if (!comments || !Array.isArray(comments)) return [];
    const map = new Map<string, ThreadedComment>();
    const roots: ThreadedComment[] = [];

    // 1. Initialize all nodes
    comments.forEach((c) => {
      const cid = (c.id || c._id || '').toString();
      if (!cid) return;
      map.set(cid, {
        ...c,
        id: cid,
        replies: [],
      });
    });

    // 2. Build parent-child relationships
    comments.forEach((c) => {
      const cid = (c.id || c._id || '').toString();
      const node = map.get(cid);
      if (!node) return;

      const pId = c.parentId ? c.parentId.toString() : null;
      if (pId && map.has(pId)) {
        map.get(pId)!.replies.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }, [comments]);

  // Count total comments across all threads
  const totalCommentsCount = comments.length;

  const handleStartReply = (targetComment: ThreadedComment) => {
    setReplyingToComment(targetComment);
    setStatusMessage(null);
  };

  const handleCancelReply = () => {
    setReplyingToComment(null);
  };

  const handleInlineSubmitReply = async (
    parentId: string,
    name: string,
    email: string,
    text: string
  ): Promise<boolean> => {
    setSubmitting(true);
    setStatusMessage(null);

    const result = await submitComment({
      postId,
      authorName: name,
      authorEmail: email,
      content: text,
      parentId,
    });

    setSubmitting(false);

    if (result.success) {
      setStatusMessage({
        text: 'Your reply has been posted successfully!',
        type: 'success',
      });
      setReplyingToComment(null);
      await loadComments();
      return true;
    } else {
      setStatusMessage({
        text: result.message || 'Failed to submit reply. Please try again.',
        type: 'error',
      });
      return false;
    }
  };

  const handleMainFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !authorName.trim() || !authorEmail.trim()) return;

    setSubmitting(true);
    setStatusMessage(null);

    const result = await submitComment({
      postId,
      authorName,
      authorEmail,
      content,
      parentId: replyingToComment ? replyingToComment.id : undefined,
    });

    setSubmitting(false);

    if (result.success) {
      setStatusMessage({
        text: replyingToComment
          ? 'Your reply has been posted successfully!'
          : 'Your comment has been submitted successfully!',
        type: 'success',
      });
      setContent('');
      setReplyingToComment(null);
      await loadComments();
    } else {
      setStatusMessage({
        text: result.message || 'Failed to submit comment. Please try again.',
        type: 'error',
      });
    }
  };

  return (
    <section className="pt-10 border-t border-gray-800 space-y-8">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-white flex items-center gap-2.5 tracking-tight">
            <MessageSquare className="w-6 h-6 text-sky-400" />
            <span>Discussion ({totalCommentsCount})</span>
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Threaded architectural commentary and community feedback
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-300 text-xs font-semibold self-start sm:self-auto shadow-inner">
          <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
          <span>Hierarchical Discussion</span>
        </div>
      </div>

      {/* Submission Status Message */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl text-sm flex items-start gap-3 transition-all ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
          }`}
        >
          {statusMessage.type === 'success' && (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
          )}
          <span className="font-medium leading-relaxed">{statusMessage.text}</span>
        </div>
      )}

      {/* Main Comment Form */}
      <form 
        onSubmit={handleMainFormSubmit} 
        className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span>
              {replyingToComment ? (
                <>Replying to <span className="text-sky-300 underline">{replyingToComment.authorName}</span></>
              ) : (
                'Contribute to the Conversation'
              )}
            </span>
          </h4>

          {replyingToComment && (
            <button
              type="button"
              onClick={handleCancelReply}
              className="text-xs text-rose-400 hover:text-rose-300 underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3 h-3" />
              <span>Cancel reply</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-400">
              Full Name <span className="text-sky-400">*</span>
            </label>
            <input
              type="text"
              required
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="e.g. Alex Morgan"
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-400">
              Email Address <span className="text-sky-400">*</span>
            </label>
            <input
              type="email"
              required
              value={authorEmail}
              onChange={(e) => setAuthorEmail(e.target.value)}
              placeholder="alex@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-gray-400">
            {replyingToComment ? 'Your Reply' : 'Technical Insight or Question'}{' '}
            <span className="text-sky-400">*</span>
          </label>
          <textarea
            required
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              replyingToComment
                ? `Replying to ${replyingToComment.authorName}: share your perspective or clarification...`
                : 'Share your architectural thoughts, benchmarks, or technical feedback...'
            }
            className="w-full px-3.5 py-3 rounded-xl bg-gray-950 border border-gray-800 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-sky-500 transition-colors resize-y"
          />
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-sky-600 hover:bg-sky-500 transition-colors shadow-md shadow-sky-600/30 disabled:opacity-50 cursor-pointer"
          >
            {submitting ? (
              <span className="animate-spin w-4 h-4 border-2 border-white/20 border-t-white rounded-full"></span>
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>{replyingToComment ? 'Submit Reply' : 'Post Comment'}</span>
          </button>
        </div>
      </form>

      {/* Threaded Hierarchical Comments List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-10 text-gray-500 text-sm">
            <div className="w-6 h-6 border-2 border-sky-500/20 border-t-sky-500 rounded-full animate-spin mx-auto mb-2" />
            Loading discussion tree...
          </div>
        ) : threadedComments.length === 0 ? (
          <div className="text-center py-12 bg-gray-900/30 border border-gray-800/80 rounded-2xl space-y-1">
            <MessageSquare className="w-8 h-8 text-gray-600 mx-auto" />
            <p className="font-semibold text-white text-sm">No comments yet</p>
            <p className="text-xs text-gray-400">
              Start the discussion by posting your thoughts or questions above.
            </p>
          </div>
        ) : (
          threadedComments.map((rootComment) => (
            <CommentItem
              key={rootComment.id}
              comment={rootComment}
              depth={0}
              replyingToId={replyingToComment ? replyingToComment.id : null}
              onStartReply={handleStartReply}
              onCancelReply={handleCancelReply}
              onSubmitReply={handleInlineSubmitReply}
              submitting={submitting}
            />
          ))
        )}
      </div>
    </section>
  );
}
