import { GhostButton } from "@/components/ui/Button";
import clsx from "clsx";
import {
  Edit3,
  Trash2,
  UserCheck,
  Ban,
  ShieldCheck,
  Users,
  ShieldAlert,
  ChevronDown,
} from "lucide-react";
import { toast } from "react-toastify";

interface GetColumnsParams {
  currentUser: User | undefined;
  canWrite: boolean;
  handleOpenEdit: (user: User) => void;
  handleOpenRoleConfirm: (user: User) => void;
  handleOpenActiveConfirm: (user: User) => void;
  handleUnblockUser: (user: User) => void;
  handleOpenBlockModal: (user: User) => void;
  setDeleteConfirm: (user: User) => void;
}

export const getColumns = ({
  currentUser,
  canWrite,
  handleOpenEdit,
  handleOpenRoleConfirm,
  handleOpenActiveConfirm,
  handleUnblockUser,
  handleOpenBlockModal,
  setDeleteConfirm,
}: GetColumnsParams) => {
  const cols: any[] = [
    {
      header: "User Details",
      accessor: (user: User) => {
        const firstLetter = (user.name || user.email)[0].toUpperCase();
        const avatarUrl = typeof user.image === "string" ? user.image : user.image?.url;

        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 overflow-hidden text-primary font-black text-sm">
              {avatarUrl ? (
                <img src={avatarUrl} alt={user.name || "Avatar"} className="w-full h-full object-cover" />
              ) : (
                <span>{firstLetter}</span>
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-dark-blue flex items-center gap-1.5">
                {user.name || "N/A"}{" "}
                {user.id === currentUser?.id && (
                  <span className="text-[10px] bg-primary/10 text-primary font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                    You
                  </span>
                )}
              </p>
              <p className="extra-small-paragraph font-medium text-dark-blue/40">{user.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      header: "Role",
      accessor: (user: User) => {
        const customRole = user.roleRel || user.role_rel;
        const displayName = user.role === "ADMIN" ? "ADMIN" : customRole ? customRole.name : "USER";
        const isAdmin = user.role === "ADMIN";
        const isCustomRole = !!customRole;

        const badgeClass = clsx(
          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border shadow-sm whitespace-nowrap",
          isAdmin && "bg-purple-50 text-purple-600 border-purple-200",
          isCustomRole && !isAdmin && "bg-teal-50 text-teal-600 border-teal-200",
          !isAdmin && !isCustomRole && "bg-blue-50 text-blue-600 border-blue-200"
        );

        const icon = isAdmin
          ? <ShieldCheck className="w-3.5 h-3.5" />
          : <Users className="w-3.5 h-3.5" />;

        if (!canWrite) {
          return (
            <div className="flex items-center gap-2">
              <span className={badgeClass}>
                {icon}
                {displayName}
              </span>
            </div>
          );
        }

        return (
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleOpenRoleConfirm(user);
              }}
              className={clsx(
                badgeClass,
                "hover:shadow-md cursor-pointer select-none active:scale-95",
                isAdmin && "hover:bg-purple-100",
                isCustomRole && !isAdmin && "hover:bg-teal-100",
                !isAdmin && !isCustomRole && "hover:bg-blue-100"
              )}
              title="Click to change user role"
            >
              {icon}
              {displayName}
              <ChevronDown className="w-3 h-3 opacity-50 ml-0.5 shrink-0" />
            </button>
          </div>
        );
      },
    },
    {
      header: "Provider",
      accessor: (user: User) => (
        <span className="extra-small-paragraph bg-light-blue px-2.5 py-1 rounded-lg font-bold text-dark-blue/50 border border-gray/50 uppercase tracking-wide">
          {user.provider || "MANUAL"}
        </span>
      ),
    },
    {
      header: "Active Status",
      accessor: (user: User) => {
        const badgeClass = clsx(
          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border",
          user.active
            ? "bg-green/10 text-green border-green/20"
            : "bg-orange/10 text-orange border-orange/20"
        );

        const dotClass = clsx(
          "w-1.5 h-1.5 rounded-full",
          user.active ? "bg-green" : "bg-orange"
        );

        const badgeContent = (
          <>
            <span className={dotClass} />
            {user.active ? "Active" : "Inactive"}
          </>
        );

        if (!canWrite) {
          return (
            <div className={badgeClass}>
              {badgeContent}
            </div>
          );
        }

        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleOpenActiveConfirm(user);
            }}
            className={clsx(
              badgeClass,
              "shadow-sm hover:shadow-md cursor-pointer transition-all active:scale-95"
            )}
            title="Click to toggle active status"
          >
            {badgeContent}
            <ChevronDown className="w-3 h-3 opacity-50 ml-0.5 shrink-0" />
          </button>
        );
      },
    },
    {
      header: "Created By",
      accessor: (user: User) => {
        if (!user.createdBy) {
          return (
            <span className="extra-small-paragraph text-dark-blue/30 italic">
              System
            </span>
          );
        }

        const roleColor =
          user.createdBy.role === "ADMIN"
            ? "text-purple-500 bg-purple-50 border-purple-200"
            : "text-blue-500 bg-blue-50 border-blue-200";

        return (
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-bold text-dark-blue">
              {user.createdBy.name || "Unknown"}
            </p>
            <span
              className={clsx(
                "inline-flex items-center gap-1 w-fit px-1.5 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider",
                roleColor
              )}
            >
              {user.createdBy.role}
            </span>
          </div>
        );
      },
    },
    {
      header: "Account State",
      accessor: (user: User) => (
        <div className="flex items-center gap-2">
          {user.blocked ? (
            <div className="relative group">
              <span className="badge-warning flex items-center gap-1 cursor-help bg-orange/10 text-orange border border-orange/20">
                <ShieldAlert className="w-3.5 h-3.5" />
                Blocked
              </span>
              {user.blockReason && (
                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-48 p-2.5 bg-dark-blue text-white extra-small-paragraph rounded-xl shadow-lg z-50 transition-opacity border border-white/10 leading-relaxed">
                  <p className="font-bold text-white/50 mb-0.5 uppercase tracking-wider text-[9px]">Reason:</p>
                  {user.blockReason}
                </div>
              )}
            </div>
          ) : (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-dark-blue/40 border border-gray/30 bg-gray/10">
              <UserCheck className="w-3.5 h-3.5" />
              Good Standing
            </span>
          )}
        </div>
      ),
    },
  ];

  if (canWrite) {
    cols.push({
      header: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      accessor: (user: User) => (
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <GhostButton
            onClick={(e) => {
              e.stopPropagation();
              handleOpenEdit(user);
            }}
            paddingClassName="p-2"
            className="hover:bg-primary/10 text-dark-blue/30 hover:text-primary transition-all cursor-pointer"
            title="Edit User"
          >
            <Edit3 className="w-4 h-4" />
          </GhostButton>

          {user.blocked ? (
            <GhostButton
              onClick={(e) => {
                e.stopPropagation();
                handleUnblockUser(user);
              }}
              paddingClassName="p-2"
              className="hover:bg-green-50 text-dark-blue/30 hover:text-green transition-all cursor-pointer"
              title="Unblock User"
            >
              <UserCheck className="w-4 h-4" />
            </GhostButton>
          ) : (
            <GhostButton
              onClick={(e) => {
                e.stopPropagation();
                handleOpenBlockModal(user);
              }}
              paddingClassName="p-2"
              className="hover:bg-orange/10 text-dark-blue/30 hover:text-orange transition-all cursor-pointer"
              title="Block User"
            >
              <Ban className="w-4 h-4" />
            </GhostButton>
          )}

          <GhostButton
            onClick={(e) => {
              e.stopPropagation();
              if (user.id === currentUser?.id) {
                toast.error("You cannot delete yourself!");
                return;
              }
              setDeleteConfirm(user);
            }}
            paddingClassName="p-2"
            className="hover:bg-red-50 text-dark-blue/30 hover:text-red-500 transition-all cursor-pointer"
            title="Delete User"
          >
            <Trash2 className="w-4 h-4" />
          </GhostButton>
        </div>
      ),
    });
  }

  return cols;
};;
