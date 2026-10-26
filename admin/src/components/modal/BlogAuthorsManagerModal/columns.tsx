import type React from "react";
import { UserCircle, Copy, Check, Edit2, Trash2, X } from "lucide-react";
import { GhostButton } from "@/components/ui/Button";

interface GetColumnsParams {
  handleOpenEdit: (author: BlogAuthor) => void;
  handleDeleteAuthor: (
    event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>,
    author: BlogAuthor
  ) => void;
  deleteConfirm: string | null;
  setDeleteConfirm: (id: string | null) => void;
  handleCopyId: (id: string) => void;
  copiedId: string | null;
  isAdmin?: boolean;
  currentUserId?: string;
}

export const getColumns = ({
  handleOpenEdit,
  handleDeleteAuthor,
  deleteConfirm,
  setDeleteConfirm,
  handleCopyId,
  copiedId,
  isAdmin,
  currentUserId,
}: GetColumnsParams) => [
  {
    header: "Author",
    accessor: (author: BlogAuthor) => (
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-xl overflow-hidden bg-primary/5 border border-gray flex items-center justify-center shrink-0">
          {author.image?.url ? (
            <img
              src={author.image.url}
              alt={author.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <UserCircle className="w-5 h-5 text-dark-blue/20" />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-dark-blue truncate">{author.name}</p>
          {author.designation && (
            <p className="extra-small-paragraph text-dark-blue/40 truncate">
              {author.designation}
            </p>
          )}
        </div>
      </div>
    ),
  },
  {
    header: "UUID",
    accessor: (author: BlogAuthor) => (
      <div className="flex items-center bg-light-blue/20 p-2 rounded-xl border border-gray w-fit gap-3" onClick={(e) => e.stopPropagation()}>
        <span className="text-[10px] font-mono font-bold text-dark-blue truncate max-w-30 sm:max-w-50">
          {author.id}
        </span>
        <button
          type="button"
          onClick={() => handleCopyId(author.id)}
          className={`p-1.5 rounded-lg transition-all shrink-0 ${
            copiedId === author.id ? "bg-green text-white" : "bg-primary/5 text-primary hover:bg-primary/10"
          }`}
        >
          {copiedId === author.id ? (
            <Check className="w-3 h-3" />
          ) : (
            <Copy className="w-3 h-3" />
          )}
        </button>
      </div>
    ),
  },
  {
    header: "Created By",
    accessor: (author: BlogAuthor) => {
      const creator = author.createdBy as any;
      if (!creator) {
        return <span className="extra-small-paragraph text-dark-blue/30 italic">System</span>;
      }
      const name = creator.name || creator.email || "System";
      return (
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-bold text-dark-blue">{name}</p>
          {creator.role && (
            <span className="inline-flex items-center gap-1 w-fit px-1.5 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider text-purple-500 bg-purple-50 border-purple-200">
              {creator.role}
            </span>
          )}
        </div>
      );
    },
  },
  {
    header: "Updated By",
    accessor: (author: BlogAuthor) => {
      const updater = author.updatedBy as any;
      if (!updater) {
        return <span className="extra-small-paragraph text-dark-blue/30 italic">—</span>;
      }
      const name = updater.name || updater.email || "System";
      return (
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-bold text-dark-blue">{name}</p>
          {updater.role && (
            <span className="inline-flex items-center gap-1 w-fit px-1.5 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider text-blue-500 bg-blue-50 border-blue-200">
              {updater.role}
            </span>
          )}
        </div>
      );
    },
  },
  {
    header: "Actions",
    headerClassName: "text-right",
    className: "text-right",
    accessor: (author: BlogAuthor) => {
      const creator = author.createdBy as any;
      const creatorId = creator?.id || creator?._id || (typeof creator === "string" ? creator : null);
      const isOwner = !creatorId || (currentUserId && creatorId === currentUserId);

      if (!isAdmin && !isOwner) {
        return (
          <div className="flex items-center justify-end">
            <span className="text-dark-blue/20 text-xs italic pr-2">Read-only</span>
          </div>
        );
      }

      return (
        <div
          className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          {deleteConfirm === author.id ? (
            <>
              <GhostButton
                onClick={(e) => handleDeleteAuthor(e, author)}
                paddingClassName="p-2"
                className="rounded-lg bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600! transition-all cursor-pointer"
              >
                <Check className="w-4 h-4" />
              </GhostButton>
              <GhostButton
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteConfirm(null);
                }}
                paddingClassName="p-2"
                className="rounded-lg hover:bg-gray text-dark-blue/30 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </GhostButton>
            </>
          ) : (
            <>
              <GhostButton
                onClick={() => handleOpenEdit(author)}
                paddingClassName="p-2"
                className="rounded-lg hover:bg-primary/5 text-dark-blue/30 hover:text-primary transition-all cursor-pointer"
              >
                <Edit2 className="w-4 h-4" />
              </GhostButton>
              <GhostButton
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteConfirm(author.id);
                }}
                paddingClassName="p-2"
                className="rounded-lg hover:bg-red-50 text-dark-blue/30 hover:text-red-500 transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </GhostButton>
            </>
          )}
        </div>
      );
    },
  },
];
