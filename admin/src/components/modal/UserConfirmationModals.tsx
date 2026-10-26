import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Ban, AlertTriangle, ShieldCheck } from "lucide-react";
import { PrimaryButton, SecondaryButton } from "@/components/ui/Button";

interface BlockModalProps {
  user: User | null;
  reason: string;
  onReasonChange: (val: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

export function BlockModal({ user, reason, onReasonChange, onCancel, onConfirm }: BlockModalProps) {
  return (
    <AnimatePresence>
      {user && (
        <div className="fixed inset-0 bg-dark-blue/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl border border-white/80 shadow-2xl w-full max-w-md overflow-hidden relative"
          >
            <div className="h-1 bg-orange" />
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-orange/10 flex items-center justify-center text-orange shrink-0">
                  <Ban className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-dark-blue leading-tight">Block User Account</h3>
                  <p className="text-xs text-dark-blue/40 font-medium mt-0.5">
                    {user.name || user.email}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="extra-small-paragraph font-bold text-dark-blue/40 uppercase tracking-wider block mb-1.5">
                    Reason for Blocking
                  </label>
                  <textarea
                    placeholder="Specify a brief explanation for suspending this user..."
                    value={reason}
                    onChange={(e) => onReasonChange(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray/20 border border-gray rounded-2xl text-sm font-medium text-dark-blue focus:outline-none focus:border-orange placeholder:text-dark-blue/20 transition-all resize-none"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <SecondaryButton onClick={onCancel} className="flex-1 rounded-xl">
                    Cancel
                  </SecondaryButton>
                  <PrimaryButton
                    onClick={onConfirm}
                    className="flex-1 rounded-xl bg-orange hover:bg-orange/90 shadow-orange/10 border-orange"
                  >
                    Block User
                  </PrimaryButton>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

interface DeleteModalProps {
  user: User | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteModal({ user, onCancel, onConfirm }: DeleteModalProps) {
  return (
    <AnimatePresence>
      {user && (
        <div className="fixed inset-0 bg-dark-blue/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl border border-white/80 shadow-2xl w-full max-w-md overflow-hidden relative"
          >
            <div className="h-1 bg-red" />
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-red/10 flex items-center justify-center text-red shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-dark-blue leading-tight">Delete User Account</h3>
                  <p className="text-xs text-dark-blue/40 font-medium mt-0.5">
                    This action is permanent and cannot be undone.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-red-50/50 border border-red/10 rounded-2xl p-3.5">
                  <p className="text-xs font-semibold text-red/80 leading-relaxed">
                    Are you sure you want to permanently delete user{" "}
                    <strong className="font-extrabold">{user.name || user.email}</strong>?
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <SecondaryButton onClick={onCancel} className="flex-1 rounded-xl">
                    Cancel
                  </SecondaryButton>
                  <PrimaryButton
                    onClick={onConfirm}
                    className="flex-1 rounded-xl bg-red hover:bg-red/90 shadow-red/10 border-red"
                  >
                    Delete Account
                  </PrimaryButton>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

interface RoleModalProps {
  user: User | null;
  onCancel: () => void;
  onConfirm: (selectedRole: string, isCustomRole: boolean) => void;
  roles: Role[];
}

export function RoleModal({ user, onCancel, onConfirm, roles }: RoleModalProps) {
  const [selected, setSelected] = useState<string | null>(null);

  // Determine current effective role value
  const currentRoleValue = user?.roleId || user?.role_id || user?.role || "";

  // Reset selection when user changes
  useEffect(() => {
    setSelected(null);
  }, [user?.id]);

  const currentDisplayName = (() => {
    const dynamicRole = user?.roleRel || user?.role_rel;
    return dynamicRole ? dynamicRole.name : user?.role || "";
  })();

  const allOptions = [
    { value: "ADMIN", label: "Administrator (Super Admin)", isCustom: false },
    { value: "USER", label: "Standard User (Public)", isCustom: false },
    ...roles.map((r) => ({
      value: r.id,
      label: `${r.name} (Custom Role)`,
      isCustom: true,
    })),
  ];

  const handleConfirm = () => {
    if (!selected) return;
    const opt = allOptions.find((o) => o.value === selected);
    onConfirm(selected, opt?.isCustom || false);
  };

  return (
    <AnimatePresence>
      {user && (
        <div className="fixed inset-0 bg-dark-blue/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl border border-white/80 shadow-2xl w-full max-w-md overflow-hidden relative"
          >
            <div className="h-1 bg-purple-500" />
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-dark-blue leading-tight">Change User Role</h3>
                  <p className="text-xs text-dark-blue/40 font-medium mt-0.5">
                    {user.name || user.email} — currently <strong>{currentDisplayName}</strong>
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5 max-h-60 overflow-y-auto custom-scrollbar">
                  {allOptions.map((opt) => {
                    const isCurrent = opt.value === currentRoleValue;
                    const isSelected = selected === opt.value;

                    return (
                      <button
                        key={opt.value}
                        type="button"
                        disabled={isCurrent}
                        onClick={() => setSelected(opt.value)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left text-sm font-semibold transition-all border cursor-pointer ${
                          isCurrent
                            ? "bg-purple-50/50 border-purple-200 text-purple-600 cursor-default opacity-70"
                            : isSelected
                            ? "bg-purple-50 border-purple-300 text-purple-700 shadow-sm"
                            : "bg-white border-gray hover:bg-light-blue/30 text-dark-blue/70 hover:text-dark-blue"
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          isSelected || isCurrent ? "border-purple-500" : "border-dark-blue/20"
                        }`}>
                          {(isSelected || isCurrent) && (
                            <div className="w-2 h-2 rounded-full bg-purple-500" />
                          )}
                        </div>
                        <span className="flex-1">{opt.label}</span>
                        {isCurrent && (
                          <span className="text-[10px] bg-purple-100 text-purple-500 font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                            Current
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <SecondaryButton onClick={onCancel} className="flex-1 rounded-xl">
                    Cancel
                  </SecondaryButton>
                  <PrimaryButton
                    onClick={handleConfirm}
                    disabled={!selected || selected === currentRoleValue}
                    className="flex-1 rounded-xl bg-purple-600 hover:bg-purple-700 shadow-purple-600/10 border-purple-600 disabled:opacity-50"
                  >
                    Change Role
                  </PrimaryButton>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

interface ActiveModalProps {
  user: User | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ActiveModal({ user, onCancel, onConfirm }: ActiveModalProps) {
  return (
    <AnimatePresence>
      {user && (
        <div className="fixed inset-0 bg-dark-blue/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl border border-white/80 shadow-2xl w-full max-w-md overflow-hidden relative"
          >
            <div className={user.active ? "h-1 bg-red" : "h-1 bg-green"} />
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                  user.active ? "bg-red-50 text-red" : "bg-green-50 text-green"
                }`}>
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    user.active ? "bg-red" : "bg-green"
                  }`} />
                </div>
                <div>
                  <h3 className="text-base font-black text-dark-blue leading-tight">
                    {user.active ? "Deactivate User Account" : "Activate User Account"}
                  </h3>
                  <p className="text-xs text-dark-blue/40 font-medium mt-0.5">
                    Confirming user account state change
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className={`rounded-2xl p-3.5 border ${
                  user.active 
                    ? "bg-red-50/50 border-red/10 text-red-700" 
                    : "bg-green-50/50 border-green/10 text-green-700"
                }`}>
                  <p className="text-xs font-semibold leading-relaxed">
                    Are you sure you want to {user.active ? "deactivate" : "activate"}{" "}
                    <strong className="font-extrabold">{user.name || user.email}</strong>?
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <SecondaryButton onClick={onCancel} className="flex-1 rounded-xl">
                    Cancel
                  </SecondaryButton>
                  <PrimaryButton
                    onClick={onConfirm}
                    className={`flex-1 rounded-xl border ${
                      user.active
                        ? "bg-red hover:bg-red/90 shadow-red/10 border-red"
                        : "bg-green hover:bg-green/90 shadow-green/10 border-green"
                    }`}
                  >
                    {user.active ? "Deactivate" : "Activate"}
                  </PrimaryButton>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
