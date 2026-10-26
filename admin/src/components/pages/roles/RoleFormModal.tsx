import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, RefreshCw } from "lucide-react";
import { useForm } from "react-hook-form";
import TextField from "@/components/ui/Form/TextField";
import { PrimaryButton, SecondaryButton } from "@/components/ui/Button";
import { useGetAvailablePermissionsQuery } from "@/services/api";

interface RoleFormValues {
  name: string;
  description: string;
  permissions: string[];
}

interface RoleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: RoleFormValues) => Promise<void>;
  initialData?: Role | null;
  isLoading?: boolean;
}

const RoleFormModal: React.FC<RoleFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}) => {
  const { data: permissionsResp } = useGetAvailablePermissionsQuery();
  const permissionsList = permissionsResp?.data || [];

  const defaultValues: RoleFormValues = {
    name: "",
    description: "",
    permissions: [],
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<RoleFormValues>({
    defaultValues,
  });

  const selectedPermissions = watch("permissions") || [];

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          name: initialData.name,
          description: initialData.description || "",
          permissions: initialData.permissions || [],
        });
      } else {
        reset(defaultValues);
      }
    }
  }, [isOpen, initialData, reset]);

  const handlePermissionToggle = (permKey: string) => {
    let updated: string[];
    if (selectedPermissions.includes(permKey)) {
      updated = selectedPermissions.filter((k) => k !== permKey);
    } else {
      updated = [...selectedPermissions, permKey];
    }
    setValue("permissions", updated, { shouldDirty: true });
  };

  // Group permissions by group field
  const groupedPermissions = permissionsList.reduce<
    Record<string, typeof permissionsList>
  >((acc, curr) => {
    const group = curr.group || "Other";
    if (!acc[group]) acc[group] = [];
    acc[group].push(curr);
    return acc;
  }, {});

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6"
        >
          <div
            className="absolute inset-0 bg-dark-blue/30 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            className="relative w-full max-w-3xl bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-5 border-b border-gray bg-light-blue/10">
              <div>
                <h2 className="h3">
                  {initialData ? "Edit Administrative Role" : "Create New Role"}
                </h2>
                <p className="extra-small-paragraph mt-1">
                  Define user permissions and operational access profiles
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-gray text-dark-blue/30 hover:text-dark-blue/60 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <TextField
                    label="Role Name"
                    placeholder="e.g. Editor, Catalog Manager"
                    error={errors.name}
                    {...register("name", { required: "Role name is required" })}
                  />

                  <TextField
                    label="Role Description"
                    placeholder="Briefly describe what this role does..."
                    error={errors.description}
                    {...register("description")}
                  />
                </div>

                <div className="border-t border-gray pt-6">
                  <h4 className="text-xs font-black text-dark-blue uppercase tracking-widest mb-4">
                    Assigned Permissions
                  </h4>
                  <p className="extra-small-paragraph mb-6">
                    Select the operations and endpoints that accounts assigned to this role will be allowed to access.
                  </p>

                  <div className="space-y-6">
                    {Object.entries(groupedPermissions).map(([groupName, items]) => (
                      <div key={groupName} className="bg-light-blue/5 border border-gray rounded-2xl p-4">
                        <h5 className="text-[11px] font-black text-dark-blue/60 uppercase tracking-widest mb-3 border-b border-gray/50 pb-1.5">
                          {groupName} Management
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {items.map((perm) => {
                            const isChecked = selectedPermissions.includes(perm.key);
                            return (
                              <label
                                key={perm.key}
                                className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                                  isChecked
                                    ? "bg-primary/5 border-primary/20 text-primary font-bold"
                                    : "bg-white border-gray/80 text-dark-blue/70 hover:border-dark-blue/20"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handlePermissionToggle(perm.key)}
                                  className="w-4 h-4 mt-0.5 rounded border-gray text-primary focus:ring-primary/20 cursor-pointer"
                                />
                                <div>
                                  <p className="text-[12px] leading-tight font-bold">
                                    {perm.label}
                                  </p>
                                  <p className="text-[10px] text-dark-blue/40 font-medium mt-0.5">
                                    Key: {perm.key}
                                  </p>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-8 py-5 bg-white border-t border-gray flex items-center justify-end gap-3 shrink-0">
                <SecondaryButton type="button" onClick={onClose}>
                  Cancel
                </SecondaryButton>
                <PrimaryButton type="submit" disabled={isLoading || (!!initialData && !isDirty)}>
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  {initialData ? "Save Role" : "Create Role"}
                </PrimaryButton>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RoleFormModal;
