import React from "react";
import { Check, Trash2, Reply, Send, CornerDownRight, User } from "lucide-react";

interface ThreadedComment extends BlogComment {
  replies: ThreadedComment[];
}

interface CommentCardProps {
  comment: ThreadedComment;
  depth?: number;
  replyToId: string | null;
  setReplyToId: (id: string | null) => void;
  replyContent: string;
  setReplyContent: (val: string) => void;
  deleteConfirmId: string | null;
  setDeleteConfirmId: (id: string | null) => void;
  handleApprove: (id: string) => void;
  handleDelete: (id: string) => void;
  handleSendReply: (parentId: string) => void;
  isApproving: boolean;
}

export const CommentCard: React.FC<CommentCardProps> = ({
  comment: c,
  depth = 0,
  replyToId,
  setReplyToId,
  replyContent,
  setReplyContent,
  deleteConfirmId,
  setDeleteConfirmId,
  handleApprove,
  handleDelete,
  handleSendReply,
  isApproving,
}) => {
  const isReplying = replyToId === c.id;
  const isDeleting = deleteConfirmId === c.id;

  return (
    <div className="space-y-4">
      <div
        className={`flex gap-4 p-4 rounded-xl border transition-all ${
          c.isAdmin
            ? "bg-primary/5 border-primary/20 shadow-sm"
            : c.approved
            ? "bg-white/80 border-gray hover:bg-white"
            : "bg-amber-50/40 border-amber-200/50 hover:bg-amber-50/60"
        }`}
        style={{ marginLeft: `${depth * 24}px` }}
      >
        {depth > 0 && (
          <div className="text-dark-blue/20 shrink-0 self-start mt-1">
            <CornerDownRight className="w-4 h-4" />
          </div>
        )}

        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-dark-blue/80 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-dark-blue/40" />
                {c.authorName}
              </span>
              {c.isAdmin && (
                <span className="px-1.5 py-0.5 rounded-sm bg-primary text-white text-[8px] font-black uppercase tracking-wider">
                  Author
                </span>
              )}
              {!c.approved && (
                <span className="px-1.5 py-0.5 rounded-sm bg-amber-500 text-white text-[8px] font-black uppercase tracking-wider animate-pulse">
                  Pending Approval
                </span>
              )}
            </div>
            <span className="text-[10px] text-dark-blue/40 font-medium">
              {new Date(c.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          <p className="text-xs text-dark-blue/70 whitespace-pre-wrap wrap-break-word leading-relaxed">
            {c.content}
          </p>

          <div className="flex items-center gap-4 pt-1 text-[11px] font-bold text-dark-blue/50">
            {!c.approved && (
              <button
                onClick={() => handleApprove(c.id)}
                className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                Approve
              </button>
            )}

            <button
              onClick={() => {
                setReplyToId(isReplying ? null : c.id);
                setReplyContent("");
              }}
              className="flex items-center gap-1 hover:text-primary cursor-pointer"
            >
              <Reply className="w-3.5 h-3.5" />
              Reply
            </button>

            {isDeleting ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDelete(c.id)}
                  className="text-rose-600 hover:text-rose-700 font-black uppercase tracking-wider cursor-pointer"
                >
                  Confirm
                </button>
                <button onClick={() => setDeleteConfirmId(null)} className="hover:text-dark-blue cursor-pointer">
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setDeleteConfirmId(c.id)}
                className="flex items-center gap-1 text-rose-500 hover:text-rose-600 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            )}
          </div>

          {isReplying && (
            <div className="flex gap-2 pt-3 border-t border-gray mt-2">
              <input
                type="text"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder={`Reply to ${c.authorName}...`}
                className="flex-1 px-3 py-1.5 bg-white border border-gray rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold text-dark-blue/70"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendReply(c.id);
                }}
              />
              <button
                onClick={() => handleSendReply(c.id)}
                className="bg-primary hover:bg-indigo-600 text-white p-2 rounded-lg transition-all cursor-pointer shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {(c.replies || []).map((reply) => (
        <CommentCard
          key={reply.id}
          comment={reply}
          depth={depth + 1}
          replyToId={replyToId}
          setReplyToId={setReplyToId}
          replyContent={replyContent}
          setReplyContent={setReplyContent}
          deleteConfirmId={deleteConfirmId}
          setDeleteConfirmId={setDeleteConfirmId}
          handleApprove={handleApprove}
          handleDelete={handleDelete}
          handleSendReply={handleSendReply}
          isApproving={isApproving}
        />
      ))}
    </div>
  );
};
