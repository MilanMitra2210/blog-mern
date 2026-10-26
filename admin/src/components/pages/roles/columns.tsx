import { GhostButton } from "@/components/ui/Button";
import { Edit3, Trash2, Shield } from "lucide-react";

interface GetColumnsParams {
  handleOpenEdit: (role: Role) => void;
  handleDeleteClick: (e: React.MouseEvent, id: string, name: string) => void;
}

export const getColumns = ({
  handleOpenEdit,
  handleDeleteClick,
}: GetColumnsParams) => [
  {
    header: "Role Name",
    accessor: (role: Role) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0 text-amber-600">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm font-bold text-dark-blue">{role.name}</p>
        </div>
      </div>
    ),
  },
  {
    header: "Description",
    accessor: (role: Role) => (
      <span className="text-sm text-dark-blue/60 font-medium">
        {role.description || "No description provided"}
      </span>
    ),
  },
  {
    header: "Permissions Count",
    accessor: (role: Role) => (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-800 border border-gray-200">
        {role.permissions?.length || 0} permissions
      </span>
    ),
  },
  {
    header: "Actions",
    accessor: (role: Role) => (
      <div className="flex items-center gap-2">
        <GhostButton
          onClick={(e) => {
            e.stopPropagation();
            handleOpenEdit(role);
          }}
          paddingClassName="p-2"
          className="rounded-xl border border-gray hover:border-primary/20 hover:bg-primary/5 text-dark-blue/40 hover:text-primary transition-all cursor-pointer"
          title="Edit Role"
        >
          <Edit3 className="w-4 h-4" />
        </GhostButton>

        {role.name.toUpperCase() !== "ADMIN" && (
          <GhostButton
            onClick={(e) => handleDeleteClick(e, role.id, role.name)}
            paddingClassName="p-2"
            className="rounded-xl border border-gray hover:border-red/20 hover:bg-red/5 text-dark-blue/40 hover:text-red transition-all cursor-pointer"
            title="Delete Role"
          >
            <Trash2 className="w-4 h-4" />
          </GhostButton>
        )}
      </div>
    ),
  },
];
