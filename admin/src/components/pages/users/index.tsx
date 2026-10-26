import React, { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useTableParams } from "@/hooks/useTableParams";
import {
  useGetUsersQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useCreateUserMutation,
  useGetRolesQuery,
} from "@/services/api";
import { useAppSelector } from "@/store/store";
import { toast } from "react-toastify";
import { Plus, RefreshCw } from "lucide-react";
import DataTable from "@/components/ui/Table/DataTable";
import Pagination from "@/components/ui/Table/Pagination";
import { GhostButton, PrimaryButton } from "@/components/ui/Button";
import UserFilters from "./UserFilters";
import UserModal from "@/components/modal/UserModal";
import { UserFormValues } from "./schema";
import { getColumns } from "./columns";
import { Permission } from "@/constants/permissions";
import {
  BlockModal,
  DeleteModal,
  ActiveModal,
  RoleModal,
} from "@/components/modal/UserConfirmationModals";

const UsersFeature: React.FC = () => {
  const [tableParams, setParam] = useTableParams({
    page: 1,
    limit: 8,
    search: "",
    roleFilter: "ALL" as "ALL" | "ADMIN" | "USER",
    statusFilter: "ALL" as "ALL" | "ACTIVE" | "INACTIVE" | "BLOCKED",
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const editUserId = searchParams.get("editUserId");
  const userModalAction = searchParams.get("modal");

  const {
    data: usersResponse,
    isLoading,
    isFetching,
    refetch,
  } = useGetUsersQuery({
    page: tableParams.page,
    limit: tableParams.limit,
    search: tableParams.search || undefined,
    role: tableParams.roleFilter === "ALL" ? undefined : tableParams.roleFilter,
    status: tableParams.statusFilter === "ALL" ? undefined : tableParams.statusFilter.toLowerCase(),
  });

  const currentUser = useAppSelector((state) => state.auth.user);
  const { data: rolesResp } = useGetRolesQuery();
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();

  const [blockUser, setBlockUser] = useState<User | null>(null);
  const [blockReason, setBlockReason] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<User | null>(null);
  const [activeConfirmUser, setActiveConfirmUser] = useState<User | null>(null);
  const [roleConfirmUser, setRoleConfirmUser] = useState<User | null>(null);

  const users = usersResponse?.data?.items || [];

  const isModalOpen = userModalAction === "create" || !!editUserId;
  const editingUser = useMemo(() => {
    if (!editUserId) return null;
    return users.find((u) => u.id === editUserId) || null;
  }, [editUserId, users]);

  const handleSearchChange = (val: string) => {
    setParam("search", val);
  };

  const handleRoleChange = (val: "ALL" | "ADMIN" | "USER") => {
    setParam("roleFilter", val);
  };

  const handleStatusChange = (
    val: "ALL" | "ACTIVE" | "INACTIVE" | "BLOCKED",
  ) => {
    setParam("statusFilter", val);
  };

  const handleOpenCreate = () => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("editUserId");
        next.set("modal", "create");
        return next;
      },
      { replace: true }
    );
  };

  const handleOpenEdit = (user: User) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("modal");
        next.set("editUserId", user.id);
        return next;
      },
      { replace: true }
    );
  };

  const handleCloseModal = () => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("modal");
        next.delete("editUserId");
        return next;
      },
      { replace: true }
    );
  };

  const handleFormSubmit = async (values: UserFormValues) => {
    try {
      if (editingUser) {
        await updateUser({
          id: editingUser.id,
          name: values.name || undefined,
          email: values.email,
          role: values.role as any,
          roleId: values.roleId,
          active: values.active,
          imageId: values.imageId || undefined,
          ...(values.password ? { password: values.password } : {}),
        }).unwrap();
        toast.success("User updated successfully");
      } else {
        await createUser({
          name: values.name || undefined,
          email: values.email,
          password: values.password,
          role: values.role as any,
          roleId: values.roleId,
          active: values.active,
          imageId: values.imageId || undefined,
        }).unwrap();
        toast.success("User created successfully");
      }
      handleCloseModal();
    } catch (err: any) {
      toast.error(err?.data?.detail || "Action failed");
    }
  };

  const handleOpenRoleConfirm = (user: User) => {
    if (user.id === currentUser?.id) {
      toast.error("You cannot change your own role!");
      return;
    }
    setRoleConfirmUser(user);
  };

  const handleChangeRole = async (selectedRole: string, isCustomRole: boolean) => {
    if (!roleConfirmUser) return;
    try {
      if (isCustomRole) {
        await updateUser({
          id: roleConfirmUser.id,
          role: "USER" as any,
          roleId: selectedRole,
        }).unwrap();
      } else {
        await updateUser({
          id: roleConfirmUser.id,
          role: selectedRole as any,
          roleId: null,
        }).unwrap();
      }
      toast.success(
        `Role updated for ${roleConfirmUser.name || roleConfirmUser.email}`,
      );
      setRoleConfirmUser(null);
    } catch (err: any) {
      toast.error(err?.data?.detail || "Failed to update role");
    }
  };

  const handleOpenActiveConfirm = (user: User) => {
    if (user.id === currentUser?.id) {
      toast.error("You cannot deactivate yourself!");
      return;
    }
    setActiveConfirmUser(user);
  };

  const handleToggleActive = async () => {
    if (!activeConfirmUser) return;
    try {
      await updateUser({
        id: activeConfirmUser.id,
        active: !activeConfirmUser.active,
      }).unwrap();
      toast.success(
        `User ${activeConfirmUser.active ? "deactivated" : "activated"} successfully`,
      );
      setActiveConfirmUser(null);
    } catch (err: any) {
      toast.error(err?.data?.detail || "Failed to update status");
    }
  };

  const handleOpenBlockModal = (user: User) => {
    if (user.id === currentUser?.id) {
      toast.error("You cannot block yourself!");
      return;
    }
    setBlockUser(user);
    setBlockReason("");
  };

  const handleBlockUser = async () => {
    if (!blockUser) return;
    if (!blockReason.trim()) {
      toast.error("Please enter a reason for blocking");
      return;
    }

    try {
      await updateUser({
        id: blockUser.id,
        blocked: true,
        block_reason: blockReason.trim(),
      }).unwrap();
      toast.success(
        `User ${blockUser.name || blockUser.email} has been blocked`,
      );
      setBlockUser(null);
    } catch (err: any) {
      toast.error(err?.data?.detail || "Failed to block user");
    }
  };

  const handleUnblockUser = async (user: User) => {
    try {
      await updateUser({
        id: user.id,
        blocked: false,
        block_reason: "",
      }).unwrap();
      toast.success(`User ${user.name || user.email} has been unblocked`);
    } catch (err: any) {
      toast.error(err?.data?.detail || "Failed to unblock user");
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.id === currentUser?.id) {
      toast.error("You cannot delete yourself!");
      return;
    }

    try {
      await deleteUser(deleteConfirm.id).unwrap();
      toast.success(
        `User ${deleteConfirm.name || deleteConfirm.email} deleted successfully`,
      );
      setDeleteConfirm(null);
    } catch (err: any) {
      toast.error(err?.data?.detail || "Failed to delete user");
    }
  };

  const userInitialData = useMemo(() => {
    if (!editingUser) return null;
    const img = typeof editingUser.image === "object" ? editingUser.image : null;
    const customRoleId = editingUser.roleRel?.id || editingUser.role_rel?.id || editingUser.roleId || editingUser.role_id || null;
    return {
      name: editingUser.name || "",
      email: editingUser.email,
      password: "",
      role: editingUser.role,
      roleId: customRoleId,
      active: editingUser.active,
      imageId: img?.id || null,
      image: img || null,
      blocked: editingUser.blocked,
      blockReason: editingUser.blockReason,
      siteId: editingUser.siteId || editingUser.site_id || null,
    };
  }, [editingUser]);

  const permissions = currentUser?.roleRel?.permissions || currentUser?.role_rel?.permissions || [];
  const canWrite = currentUser?.role === "ADMIN" || permissions.includes(Permission.USERS_WRITE);

  const columns = getColumns({
    currentUser: currentUser || undefined,
    canWrite,
    handleOpenEdit,
    handleOpenRoleConfirm,
    handleOpenActiveConfirm,
    handleUnblockUser,
    handleOpenBlockModal,
    setDeleteConfirm,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="h1 flex items-center gap-2.5">Users Administration</h1>
          <p className="small-paragraph mt-1">
            Manage user roles, block parameters, and account statuses
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <GhostButton
            onClick={() => refetch()}
            paddingClassName="p-2.5"
            className="rounded-xl border border-gray bg-white/60 hover:bg-white text-dark-blue/40 hover:text-dark-blue/70 transition-all cursor-pointer"
          >
            <RefreshCw
              className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
            />
          </GhostButton>

          {canWrite && (
            <PrimaryButton
              onClick={handleOpenCreate}
              className="flex-1 sm:flex-none shadow-primary/20"
            >
              <Plus className="w-4 h-4" />
              Add User
            </PrimaryButton>
          )}
        </div>
      </div>

      <UserFilters
        search={tableParams.search}
        onSearchChange={handleSearchChange}
        roleFilter={tableParams.roleFilter}
        onRoleChange={handleRoleChange}
        statusFilter={tableParams.statusFilter}
        onStatusChange={handleStatusChange}
      />

      <DataTable
        columns={columns}
        data={users}
        isLoading={isLoading}
        rowKey={(user) => user.id}
        emptyMessage="No users found matching your filters"
        onRowClick={canWrite ? handleOpenEdit : undefined}
      />

      <Pagination
        currentPage={tableParams.page}
        totalPages={Math.ceil((usersResponse?.data?.total || 0) / tableParams.limit) || 1}
        onPageChange={(p) => setParam("page", p)}
        totalItems={usersResponse?.data?.total || 0}
        itemsPerPage={tableParams.limit}
        onPageSizeChange={(size) => setParam("limit", size)}
      />

      <UserModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        isSelf={editingUser?.id === currentUser?.id}
        isCurrentUserAdmin={currentUser?.role === "ADMIN"}
        initialData={userInitialData}
        isLoading={isCreating || isUpdating}
      />

      <BlockModal
        user={blockUser}
        reason={blockReason}
        onReasonChange={setBlockReason}
        onCancel={() => setBlockUser(null)}
        onConfirm={handleBlockUser}
      />

      <DeleteModal
        user={deleteConfirm}
        onCancel={() => setDeleteConfirm(null)}
        onConfirm={handleDeleteUser}
      />

      <RoleModal
        user={roleConfirmUser}
        onCancel={() => setRoleConfirmUser(null)}
        onConfirm={handleChangeRole}
        roles={rolesResp?.data || []}
      />

      <ActiveModal
        user={activeConfirmUser}
        onCancel={() => setActiveConfirmUser(null)}
        onConfirm={handleToggleActive}
      />
    </div>
  );
};

export default UsersFeature;
