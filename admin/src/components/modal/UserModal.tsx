import React, { useEffect, useState, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { X, RefreshCw, Check, Camera, ShieldAlert } from "lucide-react";
import { useForm, Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { userSchema, UserFormValues } from "@/components/pages/users/schema";
import TextField from "@/components/ui/Form/TextField";
import SelectField from "@/components/ui/Form/SelectField";
import { PrimaryButton, SecondaryButton } from "../ui/Button";

import { useGetRolesQuery } from "@/services/api";

const MediaPickerModal = lazy(() => import("@/components/modal/MediaPickerModal"));

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: UserFormValues) => Promise<void>;
  initialData?: UserFormValues | null;
  isLoading?: boolean;
  isSelf?: boolean;
  isCurrentUserAdmin?: boolean;
}

const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
  isSelf = false,
  isCurrentUserAdmin = false,
}) => {
  const [isMediaOpen, setIsMediaOpen] = useState(false);
  const { data: rolesResp } = useGetRolesQuery();
  const dbRoles = rolesResp?.data || [];

  const defaultValues: UserFormValues = {
    name: "",
    email: "",
    password: "",
    role: "USER",
    roleId: null,
    active: true,
    imageId: null,
    image: null,
    blocked: false,
    blockReason: "",
    siteId: null,
  };

  const isEdit = !!initialData;

  const getMappedInitialData = (data: UserFormValues | null | undefined) => {
    if (!data) return null;
    return {
      ...data,
      role: data.roleId ? data.roleId : data.role,
    };
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<UserFormValues>({
    resolver: yupResolver(userSchema) as Resolver<UserFormValues>,
    context: { isEdit },
    defaultValues: initialData
      ? {
          ...defaultValues,
          ...getMappedInitialData(initialData),
        }
      : defaultValues,
  });

  const active = watch("active");


  const image = watch("image") as any;

  useEffect(() => {
    if (isOpen) {
      reset(
        initialData
          ? {
              ...defaultValues,
              ...getMappedInitialData(initialData),
            }
          : defaultValues
      );
    }
  }, [isOpen, initialData, reset]);

  const handleMediaSelect = (media: any) => {
    setValue("imageId", media.id, { shouldDirty: true });
    setValue("image", media, { shouldDirty: true });
    setIsMediaOpen(false);
  };

  return (
    <>
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
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-8 py-5 border-b border-gray bg-light-blue/10">
                <div>
                  <h2 className="h3">
                    {initialData ? "Edit User Account" : "Add New User"}
                  </h2>
                  <p className="extra-small-paragraph mt-1">
                    Manage authentication credentials and authorization roles
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
              <form
                onSubmit={handleSubmit((values) => {
                  const isCustomRole = values.role !== "ADMIN" && values.role !== "USER";
                  const mappedValues: UserFormValues = {
                    ...values,
                    role: isCustomRole ? "USER" : values.role,
                    roleId: isCustomRole ? values.role : null,
                  };
                  onSubmit(mappedValues);
                })}
                className="flex flex-col flex-1"
              >
                <div className="p-8 space-y-6 overflow-y-auto max-h-125 custom-scrollbar">
                  {isSelf && (
                    <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/10 rounded-2xl">
                      <ShieldAlert className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-black text-primary uppercase tracking-widest leading-none mb-1">
                          Viewing Your Own Account
                        </p>
                        <p className="extra-small-paragraph text-primary/85 leading-relaxed font-medium">
                          For security and access integrity reasons, you cannot change your own Administrator role or deactivate your own account state from this console.
                        </p>
                      </div>
                    </div>
                  )}

                  {watch("blocked") && (
                    <div className="flex items-start gap-3 p-4 bg-orange/10 border border-orange/20 rounded-2xl">
                      <ShieldAlert className="w-5 h-5 text-orange shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-black text-orange uppercase tracking-widest leading-none mb-1">
                          Account Blocked
                        </p>
                        <p className="extra-small-paragraph text-orange/90 leading-relaxed">
                          <span className="font-bold">Reason:</span> {watch("blockReason") || "No reason specified"}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Profile Avatar Selection Section */}
                  <div className="flex flex-col items-center justify-center space-y-3 pb-6 border-b border-gray">
                    <div className="relative group cursor-pointer" onClick={() => setIsMediaOpen(true)}>
                      <div className="w-24 h-24 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center overflow-hidden text-primary font-black text-3xl transition-all group-hover:opacity-80">
                        {image?.url ? (
                          <img src={image.url} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <span>{(watch("name") || watch("email") || "U")[0].toUpperCase()}</span>
                        )}
                      </div>
                      <div className="absolute inset-0 bg-dark-blue/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Camera className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-dark-blue/50 text-center uppercase tracking-widest">
                        Profile Image
                      </p>
                      <p className="extra-small-paragraph text-center mt-0.5">
                        Click avatar to select or upload a custom image
                      </p>
                    </div>
                  </div>

                  {/* Form fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <TextField
                      label="Full Name (Optional)"
                      placeholder="e.g. John Doe"
                      error={errors.name}
                      {...register("name")}
                    />

                    <TextField
                      label="Email Address"
                      placeholder="e.g. johndoe@example.com"
                      error={errors.email}
                      autoComplete="off"
                      {...register("email")}
                    />

                    <TextField
                      label={initialData ? "New Password (Optional)" : "Password"}
                      type="password"
                      placeholder={initialData ? "Leave blank to keep current" : "••••••••"}
                      error={errors.password}
                      autoComplete="new-password"
                      {...register("password")}
                    />

                    <SelectField
                      label="Role"
                      placeholder="Select a role"
                      options={[
                        { label: "Administrator", value: "ADMIN" },
                        { label: "Standard User (Public)", value: "USER" },
                        ...dbRoles.map((r) => ({
                          label: `${r.name} (Custom Role)`,
                          value: r.id,
                        })),
                      ]}
                      error={errors.role}
                      disabled={isSelf || !isCurrentUserAdmin}
                      {...register("role")}
                    />
                  </div>

                  {/* Active Toggle Switch */}
                  <div className="flex items-center justify-between p-4 rounded-2xl border border-gray bg-light-blue/5">
                    <div>
                      <p className="extra-small-paragraph font-black text-dark-blue uppercase tracking-widest">
                        Active Status
                      </p>
                      <p className="small-paragraph">
                        Enable or disable account access instantly
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={isSelf}
                      onClick={() => !isSelf && setValue("active", !active, { shouldDirty: true })}
                      className={clsx(
                        "relative w-12 h-6 rounded-full transition-all duration-300",
                        isSelf ? "cursor-not-allowed opacity-50 bg-primary/40" : "cursor-pointer bg-dark-blue/10",
                        !isSelf && active && "bg-primary shadow-lg shadow-primary/20",
                        isSelf && active && "bg-primary/50 shadow-sm"
                      )}
                    >
                      <div
                        className={clsx(
                          "absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300",
                          active && "translate-x-6"
                        )}
                      />
                    </button>
                  </div>
                </div>

                {/* Footer buttons */}
                <div className="px-8 py-5 bg-white border-t border-gray flex items-center justify-end gap-3">
                  <SecondaryButton type="button" onClick={onClose}>
                    Cancel
                  </SecondaryButton>
                  <PrimaryButton type="submit" disabled={isLoading || (!!initialData && !isDirty)}>
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    {initialData ? "Save Changes" : "Create User"}
                  </PrimaryButton>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Suspense fallback={null}>
        <MediaPickerModal
          isOpen={isMediaOpen}
          onClose={() => setIsMediaOpen(false)}
          onSelect={handleMediaSelect}
          title="Select Profile Avatar"
        />
      </Suspense>
    </>
  );
};

export default UserModal;
