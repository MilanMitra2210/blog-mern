import React from "react";
import {
  Mail,
  Shield,
  AtSign,
  Fingerprint,
  ShieldAlert,
  Camera,
} from "lucide-react";
import { motion } from "framer-motion";

type Props = {
  data: User;
  onEditAvatar: () => void;
};

const UserProfile: React.FC<Props> = ({ data, onEditAvatar }) => {
  const initials = data.name
    ? data.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "AD";

  return (
    <div className="flex flex-col md:flex-row items-start gap-8">
      {/* Avatar */}
      <motion.div
        whileHover={{ scale: 1.03 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="relative group shrink-0 cursor-pointer"
        onClick={onEditAvatar}
      >
        <div className="w-28 h-28 rounded-3xl overflow-hidden bg-linear-to-br from-primary/20 to-primary/5 border-[5px] border-white shadow-2xl shadow-primary/10 flex items-center justify-center ring-4 ring-primary/10">
          {data.image ? (
            <img
              src={
                typeof data.image === "string" ? data.image : data.image?.url
              }
              alt={data.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-2xl font-black text-primary/70">
              {initials}
            </span>
          )}
        </div>

        {/* Camera Overlay */}
        <div className="absolute inset-0 bg-dark-blue/40 rounded-3xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity border-[5px] border-transparent">
          <Camera className="w-6 h-6 text-white" />
        </div>

        <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-emerald-400 rounded-xl border-[3px] border-white shadow-lg flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full" />
        </div>
      </motion.div>

      {/* User Details */}
      <div className="flex-1 pt-2">
        <div className="mb-5">
          <h2 className="text-2xl font-black text-dark-blue tracking-tight leading-tight">
            {data.name ?? "Admin User"}
          </h2>
          <p className="text-sm text-dark-blue/40 font-medium mt-0.5">
            Manage your personal details and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InfoPill
            icon={<Mail className="w-4 h-4" />}
            label="Email"
            value={data.email}
          />
          <InfoPill
            icon={<Shield className="w-4 h-4" />}
            label="Role"
            value={data.role ?? "ADMIN"}
          />
          <InfoPill
            icon={<AtSign className="w-4 h-4" />}
            label="Provider"
            value={data.provider ?? "MANUAL"}
          />
          <InfoPill
            icon={<Fingerprint className="w-4 h-4" />}
            label="Status"
            value={data.active ? "Active" : "Inactive"}
            valueClassName={data.active ? "text-emerald-600" : "text-red-500"}
          />
          {data.blocked && (
            <InfoPill
              icon={<ShieldAlert className="w-4 h-4" />}
              label="Blocked"
              value={data.blockReason ?? "Blocked"}
              valueClassName="text-red-500"
            />
          )}
        </div>
      </div>
    </div>
  );
};

function InfoPill({
  icon,
  label,
  value,
  valueClassName,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -1 }}
      className="flex items-center gap-3 bg-light-blue/50 hover:bg-light-blue border border-gray/60 px-4 py-3 rounded-2xl transition-all group cursor-default"
    >
      <div className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center text-dark-blue/40 group-hover:text-primary transition-colors shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-widest font-bold text-dark-blue/30 leading-none mb-1">
          {label}
        </p>
        <p
          className={`text-sm font-bold text-dark-blue/80 truncate ${valueClassName ?? ""}`}
        >
          {value}
        </p>
      </div>
    </motion.div>
  );
}

export default UserProfile;
