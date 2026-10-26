import * as React from "react";
import { MessageSquare, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";
import {
  useGetAdminCommentsQuery,
  useApproveCommentMutation,
  useDeleteCommentMutation,
  useCreateCommentMutation,
} from "@/services/api";
import { useAppSelector } from "@/store/store";
import { GhostButton } from "@/components/ui/Button";
import { BlogSidebar } from "./BlogSidebar";
import { CommentCard } from "./CommentCard";
import SearchBar from "@/components/ui/SearchBar";
import Pagination from "@/components/ui/Table/Pagination";
import { useTableParams } from "@/hooks/useTableParams";

interface ThreadedComment extends BlogComment {
  replies: ThreadedComment[];
}

const CommentsFeature: React.FC = () => {
  // Isolate Blog Sidebar params and Comments list params to prevent cross-deleting "page"
  const [blogParams, setBlogParam, setBlogParams] = useTableParams({
    blogPage: 1,
    blogSearch: "",
  });

  const [commentParams, setCommentParam, setCommentParams] = useTableParams({
    page: 1,
    limit: 5,
    search: "",
    statusFilter: "all",
    postId: "",
  });

  const [replyToId, setReplyToId] = React.useState<string | null>(null);
  const [replyContent, setReplyContent] = React.useState("");
  const [deleteConfirmId, setDeleteConfirmId] = React.useState<string | null>(null);

  const user = useAppSelector((state) => state.auth.user);

  const selectedPostId = commentParams.postId || null;

  // Map status filter
  let approvedParam: boolean | undefined = undefined;
  if (commentParams.statusFilter === "approved") {
    approvedParam = true;
  } else if (commentParams.statusFilter === "pending") {
    approvedParam = false;
  }

  // Fetch paginated comments (filtered by post if selected, or global feed)
  const {
    data: commentsResponse,
    isLoading,
    refetch,
    isFetching,
  } = useGetAdminCommentsQuery({
    postId: selectedPostId || undefined,
    page: commentParams.page,
    limit: commentParams.limit,
    approved: approvedParam,
    search: commentParams.search.trim() || undefined,
  });

  const [approveComment, { isLoading: isApproving }] = useApproveCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();
  const [createComment] = useCreateCommentMutation();

  const comments = commentsResponse?.data?.items || [];
  const totalComments = commentsResponse?.data?.total || 0;
  const totalPages = Math.ceil(totalComments / commentParams.limit) || 1;

  // Build Threaded Tree
  const threadedComments = React.useMemo(() => {
    if (!comments || !Array.isArray(comments)) return [];
    const map = new Map<string, ThreadedComment>();
    const roots: ThreadedComment[] = [];

    comments.forEach((c) => {
      map.set(c.id, { ...c, replies: [] });
    });

    comments.forEach((c) => {
      const node = map.get(c.id)!;
      if (c.parentId && map.has(c.parentId)) {
        map.get(c.parentId)!.replies.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }, [comments]);

  const handleApprove = async (id: string) => {
    try {
      await approveComment(id).unwrap();
      toast.success("Comment approved");
    } catch (err: unknown) {
      const error = err as { data?: { detail?: string } };
      toast.error(error?.data?.detail || "Approval failed");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteComment(id).unwrap();
      toast.success("Comment deleted");
      setDeleteConfirmId(null);
    } catch (err: unknown) {
      const error = err as { data?: { detail?: string } };
      toast.error(error?.data?.detail || "Delete failed");
    }
  };

  const handleSendReply = async (parentId: string) => {
    if (!replyContent.trim()) return;
    const parentComment = comments.find((c) => c.id === parentId);
    const targetPostId = selectedPostId || parentComment?.postId;

    if (!targetPostId) {
      toast.error("Unable to determine target post for reply");
      return;
    }

    try {
      await createComment({
        postId: targetPostId,
        parentId,
        content: replyContent,
        authorName: user?.name || "Author (Admin)",
        authorEmail: user?.email || "admin@quillforge.com",
      }).unwrap();
      toast.success("Reply posted successfully");
      setReplyContent("");
      setReplyToId(null);
    } catch (err: unknown) {
      const error = err as { data?: { detail?: string } };
      toast.error(error?.data?.detail || "Failed to post reply");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="h1 flex items-center gap-2.5">
            <MessageSquare className="w-8 h-8 text-primary" />
            Comment Moderation
          </h1>
          <p className="small-paragraph mt-1">
            Group comments by blog post, review nested replies, search content, and respond directly to readers.
          </p>
        </div>
        <GhostButton
          onClick={() => refetch()}
          disabled={isLoading || isFetching}
          className="hover:bg-primary/5 text-dark-blue/40 hover:text-primary transition-all p-2.5 rounded-xl border border-gray shrink-0 cursor-pointer"
        >
          <RefreshCw className={isFetching ? "w-4 h-4 animate-spin" : "w-4 h-4"} />
        </GhostButton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Paginated/Searchable Blogs Sidebar */}
        <BlogSidebar
          selectedPostId={selectedPostId}
          onSelect={(id) => {
            setCommentParams({ postId: id, page: 1 });
            setReplyToId(null);
          }}
          search={blogParams.blogSearch}
          onSearchChange={(val) => setBlogParams({ blogSearch: val, blogPage: 1 })}
          page={blogParams.blogPage}
          onPageChange={(p) => setBlogParam("blogPage", p)}
        />

        {/* Right Side: Paginated Comments Thread */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white border border-gray rounded-2xl p-6 shadow-sm space-y-6 min-h-125 flex flex-col">
            <div className="border-b border-gray pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="extra-small-paragraph uppercase tracking-wider font-black text-dark-blue/30">
                  {selectedPostId ? "Filtered By Post" : "Global Feed"}
                </span>
                <h2 className="text-sm font-black text-dark-blue mt-1 leading-snug">
                  {selectedPostId ? "Post Comments Thread" : "All Comments Moderation"}
                </h2>
              </div>
              <span className="text-xs font-bold text-dark-blue/40">
                {totalComments} comment{totalComments !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Filters Row */}
            <div className="flex flex-col md:flex-row gap-3 items-center">
              <div className="flex-1 w-full">
                <SearchBar
                  value={commentParams.search}
                  onChange={(val) => {
                    setCommentParams({ search: val, page: 1 });
                  }}
                  placeholder="Search comments..."
                />
              </div>

              <div className="relative w-full md:w-48 group">
                <select
                  value={commentParams.statusFilter}
                  onChange={(e) => {
                    setCommentParams({ statusFilter: e.target.value, page: 1 });
                  }}
                  className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray rounded-xl text-xs appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer font-bold text-dark-blue/70"
                >
                  <option value="all">All Comments</option>
                  <option value="pending">Pending Approval</option>
                  <option value="approved">Approved</option>
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-dark-blue/30">
                  <span className="text-[10px]">▼</span>
                </div>
              </div>
            </div>

            {/* Thread Area */}
            <div className="space-y-6 flex-1">
              {isLoading ? (
                <div className="flex items-center justify-center min-h-50">
                  <RefreshCw className="w-6 h-6 text-primary animate-spin" />
                </div>
              ) : threadedComments.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3 text-center">
                  <MessageSquare className="w-10 h-10 text-dark-blue/20" />
                  <p className="text-xs font-bold text-dark-blue/40">
                    No comments found matching the filters.
                  </p>
                </div>
              ) : (
                threadedComments.map((c) => (
                  <CommentCard
                    key={c.id}
                    comment={c}
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
                ))
              )}
            </div>

            {/* Thread Pagination */}
            {totalPages > 1 && (
              <div className="border-t border-gray pt-4">
                <Pagination
                  currentPage={commentParams.page}
                  totalPages={totalPages}
                  onPageChange={(p) => setCommentParam("page", p)}
                  totalItems={totalComments}
                  itemsPerPage={commentParams.limit}
                  onPageSizeChange={(size) => {
                    setCommentParams({ limit: size, page: 1 });
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentsFeature;
