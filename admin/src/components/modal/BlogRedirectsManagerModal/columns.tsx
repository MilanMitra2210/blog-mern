import { Link2, ExternalLink, ArrowRight, Trash2 } from "lucide-react";
import { GhostButton } from "@/components/ui/Button";

export interface RedirectRow {
  id: string;
  oldSlug: string;
  currentSlug: string;
  blogTitle?: string;
  createdBy?: {
    id?: string;
    _id?: string;
    name?: string;
    email?: string;
    role?: string;
  } | string | null;
  createdAt?: string;
}

interface GetColumnsParams {
  nextUrl: string;
  setDeleteConfirm: (row: RedirectRow) => void;
  isAdmin?: boolean;
  currentUserId?: string;
}

export const getColumns = ({
  nextUrl,
  setDeleteConfirm,
  isAdmin,
  currentUserId,
}: GetColumnsParams) => [
  {
    header: "Legacy URL (Redirects From)",
    accessor: (row: RedirectRow) => {
      const fullUrl = `${nextUrl}/blog/${row.oldSlug}`;
      return (
        <div className="flex flex-col gap-1 min-w-0 max-w-[320px]">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-red-50 text-red-500 shrink-0">
              <Link2 className="w-3.5 h-3.5" />
            </span>
            <code className="text-xs font-mono font-bold text-dark-blue/80 bg-dark-blue/5 px-2 py-0.5 rounded truncate">
              /{row.oldSlug}
            </code>
          </div>
          <a
            href={fullUrl}
            target="_blank"
            rel="noreferrer"
            className="extra-small-paragraph text-primary hover:underline flex items-center gap-1 font-medium truncate ml-7"
          >
            {fullUrl}
            <ExternalLink className="w-2.5 h-2.5 shrink-0" />
          </a>
        </div>
      );
    },
  },
  {
    header: "",
    headerClassName: "w-10 text-center",
    className: "w-10 text-center",
    accessor: () => (
      <div className="flex items-center justify-center">
        <div className="p-1.5 rounded-full bg-primary/5">
          <ArrowRight className="w-3.5 h-3.5 text-primary/60" />
        </div>
      </div>
    ),
  },
  {
    header: "Active URL (Redirects To)",
    accessor: (row: RedirectRow) => {
      const fullUrl = `${nextUrl}/blog/${row.currentSlug}`;
      return (
        <div className="flex flex-col gap-1 min-w-0 max-w-[320px]">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-emerald-50 text-emerald-500 shrink-0">
              <ExternalLink className="w-3.5 h-3.5" />
            </span>
            <code className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded truncate">
              /{row.currentSlug}
            </code>
          </div>
          <a
            href={fullUrl}
            target="_blank"
            rel="noreferrer"
            className="extra-small-paragraph text-emerald-600 hover:underline flex items-center gap-1 font-medium truncate ml-7"
          >
            {fullUrl}
            <ExternalLink className="w-2.5 h-2.5 shrink-0" />
          </a>
        </div>
      );
    },
  },
  {
    header: "Created By",
    accessor: (row: RedirectRow) => {
      const creator = row.createdBy as any;
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
    header: "Actions",
    headerClassName: "text-right",
    className: "text-right",
    accessor: (row: RedirectRow) => {
      const creator = row.createdBy as any;
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
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <GhostButton
            onClick={() => setDeleteConfirm(row)}
            paddingClassName="p-2"
            className="rounded-lg hover:bg-red-50 text-dark-blue/30 hover:text-red-500 transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </GhostButton>
        </div>
      );
    },
  },
];
