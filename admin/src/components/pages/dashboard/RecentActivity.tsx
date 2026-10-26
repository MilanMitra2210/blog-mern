import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, Clock, Edit } from "lucide-react";
import { useAppSelector } from "@/store/store";
import { Permission } from "@/constants/permissions";

interface BlogItem {
  id: string;
  title: string;
  categoryName?: string;
  slug: string;
  status: string;
  createdAt: string;
}

interface RecentActivityProps {
  blogs: BlogItem[] | undefined;
  enquiries?: any;
}

const RecentActivity: React.FC<RecentActivityProps> = ({ blogs }) => {
  const user = useAppSelector((state) => state.auth.user);
  const permissions = user?.roleRel?.permissions || user?.role_rel?.permissions || [];
  const canWriteBlogs = user?.role === "ADMIN" || permissions.includes(Permission.BLOGS_WRITE);

  return (
    <div className="bg-white/70 backdrop-blur-xl border border-gray rounded-3xl p-6 shadow-sm flex flex-col h-130">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray pb-4 mb-4">
        <div>
          <h3 className="small-paragraph text-dark-blue font-black uppercase tracking-wider">
            Recent Publications & Activity
          </h3>
          <p className="extra-small-text text-dark-blue/40 font-medium">
            Review latest blog posts and publications
          </p>
        </div>

        <div className="flex bg-light-blue/30 p-1 rounded-xl shrink-0">
          <span className="px-3 py-1.5 rounded-lg extra-small-text font-black bg-white text-primary shadow-sm">
            Publications
          </span>
        </div>
      </div>

      {/* Feed list */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
        {!blogs || blogs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-dark-blue/30 py-8">
            <BookOpen className="w-8 h-8 mb-2 opacity-50 text-dark-blue/20" />
            <span className="small-paragraph font-semibold">
              No blogs created yet.
            </span>
          </div>
        ) : (
          blogs.map((blog) => (
            <div
              key={blog.id}
              className="p-3.5 rounded-xl border border-gray bg-white/50 hover:bg-white transition-all flex items-center justify-between gap-4 group/item hover:shadow-sm"
            >
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {blog.categoryName && (
                    <span className="bg-orange/5 text-orange extra-small-text font-black uppercase tracking-wider px-2 py-0.5 rounded-md border border-orange/5 shrink-0">
                      {blog.categoryName}
                    </span>
                  )}
                  <p className="small-paragraph font-black text-dark-blue truncate leading-none">
                    {blog.title}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 extra-small-text text-dark-blue/40 font-medium">
                  <Clock className="w-3.5 h-3.5 text-dark-blue/20 shrink-0" />
                  <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span
                  className={`px-2.5 py-1 rounded-full extra-small-text font-black uppercase tracking-wider border shrink-0 ${
                    blog.status === "published"
                      ? "bg-emerald-500/5 text-emerald-600 border-emerald-500/10"
                      : "bg-gray/40 text-dark-blue/40 border-gray"
                  }`}
                >
                  {blog.status}
                </span>
                {canWriteBlogs && (
                  <Link
                    to={`/blogs/${blog.id}/edit`}
                    className="p-1.5 hover:bg-light-blue/30 rounded-lg text-dark-blue/40 hover:text-orange transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentActivity;
