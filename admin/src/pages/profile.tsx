import ChangePassword from "@/components/shared/ChangePassword";
import UserProfile from "@/components/pages/profile/UserProfile";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { UserCog, Lock, ChevronRight } from "lucide-react";
import React, { useState, lazy, Suspense } from "react";
import { useUpdateUserMutation } from "@/services/api";
import { useAppSelector } from "@/store/store";
import { toast } from "react-toastify";

const MediaPickerModal = lazy(() => import("@/components/modal/MediaPickerModal"));

const Profile: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);
  const [isMediaOpen, setIsMediaOpen] = useState(false);
  const [updateUser] = useUpdateUserMutation();

  if (!user) return null;

  const handleMediaSelect = async (media: any) => {
    try {
      await updateUser({
        id: user.id,
        imageId: media.id,
      }).unwrap();
      toast.success("Profile picture updated successfully!");
      setIsMediaOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.detail || "Failed to update profile picture");
    }
  };

  return (
    <div className="py-8 space-y-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="flex items-center gap-2 text-sm text-dark-blue/40 font-medium">
          <Link to="/" className="hover:text-primary transition-colors">Dashboard</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-dark-blue/80 font-bold">Account Settings</span>
        </div>
      </motion.div>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/80 shadow-xl shadow-dark-blue/3 overflow-hidden">
          <div className="h-1.5 bg-linear-to-r from-primary via-primary/60 to-transparent" />

          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <UserCog className="w-5 h-5 text-primary" />
              <h1 className="text-xl font-black text-dark-blue tracking-tight">Profile Information</h1>
            </div>
            <UserProfile data={user} onEditAvatar={() => setIsMediaOpen(true)} />
          </div>
        </div>
      </motion.section>

      {/* Security Card */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/80 shadow-xl shadow-dark-blue/3 overflow-hidden">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-orange/10 flex items-center justify-center">
                <Lock className="w-5 h-5 text-orange" />
              </div>
              <div>
                <h2 className="text-lg font-black text-dark-blue tracking-tight">Security</h2>
                <p className="text-sm text-dark-blue/40 font-medium">Update your password to keep your account secure</p>
              </div>
            </div>
            <ChangePassword user={user} />
          </div>
        </div>
      </motion.section>

      <Suspense fallback={null}>
        <MediaPickerModal
          isOpen={isMediaOpen}
          onClose={() => setIsMediaOpen(false)}
          onSelect={handleMediaSelect}
          title="Select Profile Avatar"
        />
      </Suspense>
    </div>
  );
};

export default Profile;
