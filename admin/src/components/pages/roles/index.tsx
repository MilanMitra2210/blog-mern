import React, { useState } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";
import {
  useGetRolesQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} from "@/services/api";
import DataTable from "@/components/ui/Table/DataTable";
import RoleFormModal from "./RoleFormModal";
import { GhostButton, PrimaryButton } from "@/components/ui/Button";
import { getColumns } from "./columns";
import { DeleteModal } from "@/components/modal/UserConfirmationModals";

const RolesFeature: React.FC = () => {
  const { data: rolesResp, isLoading, isFetching, refetch } = useGetRolesQuery();
  const [createRole, { isLoading: isCreating }] = useCreateRoleMutation();
  const [updateRole, { isLoading: isUpdating }] = useUpdateRoleMutation();
  const [deleteRole] = useDeleteRoleMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

  const roles = rolesResp?.data || [];

  const handleOpenCreate = () => {
    setEditingRole(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (role: Role) => {
    setEditingRole(role);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    setDeleteConfirm({ id, name });
  };

  const handleFormSubmit = async (values: any) => {
    try {
      if (editingRole) {
        await updateRole({ id: editingRole.id, ...values }).unwrap();
        toast.success("Role updated successfully");
      } else {
        await createRole(values).unwrap();
        toast.success("Role created successfully");
      }
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.detail || "Action failed");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteRole(deleteConfirm.id).unwrap();
      toast.success(`Role ${deleteConfirm.name} deleted successfully`);
      setDeleteConfirm(null);
    } catch (err: any) {
      toast.error(err?.data?.detail || "Failed to delete role");
    }
  };

  const columns = getColumns({
    handleOpenEdit,
    handleDeleteClick,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="h1 flex items-center gap-2.5">Roles Administration</h1>
          <p className="small-paragraph mt-1">
            Configure dynamic permission options and administrative profiles
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <GhostButton
            onClick={() => refetch()}
            paddingClassName="p-2.5"
            className="rounded-xl border border-gray bg-white/60 hover:bg-white text-dark-blue/40 hover:text-dark-blue/70 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
          </GhostButton>

          <PrimaryButton onClick={handleOpenCreate} className="flex-1 sm:flex-none shadow-primary/20">
            <Plus className="w-4 h-4" />
            Add Role
          </PrimaryButton>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={roles}
        isLoading={isLoading}
        rowKey={(role) => role.id}
        emptyMessage="No roles found"
        onRowClick={handleOpenEdit}
      />

      <RoleFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingRole}
        isLoading={isCreating || isUpdating}
      />

      <DeleteModal
        user={deleteConfirm ? { id: deleteConfirm.id, name: deleteConfirm.name, email: "" } as any : null}
        onCancel={() => setDeleteConfirm(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default RolesFeature;
