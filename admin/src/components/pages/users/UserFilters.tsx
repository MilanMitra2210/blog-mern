import React from "react";
import { Shield } from "lucide-react";
import SearchBar from "@/components/ui/SearchBar";
import StatusFilter from "@/components/ui/StatusFilter";

interface UserFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  roleFilter: "ALL" | "ADMIN" | "USER";
  onRoleChange: (val: "ALL" | "ADMIN" | "USER") => void;
  statusFilter: "ALL" | "ACTIVE" | "INACTIVE" | "BLOCKED";
  onStatusChange: (val: "ALL" | "ACTIVE" | "INACTIVE" | "BLOCKED") => void;
}

const USER_STATUS_OPTIONS: { value: "ALL" | "ACTIVE" | "INACTIVE" | "BLOCKED"; label: string }[] = [
  { value: "ALL", label: "all" },
  { value: "ACTIVE", label: "active" },
  { value: "INACTIVE", label: "inactive" },
  { value: "BLOCKED", label: "blocked" },
];

const UserFilters: React.FC<UserFiltersProps> = ({
  search,
  onSearchChange,
  roleFilter,
  onRoleChange,
  statusFilter,
  onStatusChange,
}) => {
  return (
    <div className="flex flex-col md:flex-row items-center gap-4">
      {/* Search Bar */}
      <SearchBar
        value={search}
        onChange={onSearchChange}
        placeholder="Search users..."
      />

      <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
        {/* Role Filter */}
        <div className="relative w-full sm:w-48 group">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-blue/30">
            <Shield className="w-3.5 h-3.5" />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => onRoleChange(e.target.value as "ALL" | "ADMIN" | "USER")}
            className="w-full pl-10 pr-4 py-2.5 bg-white/60 border border-gray rounded-xl text-sm appearance-none focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all cursor-pointer"
          >
            <option value="ALL">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="USER">User</option>
          </select>
        </div>

        {/* Status Filter Toggle Button - Beautifully inferred by generic arrow type with NO assertions or any! */}
        <StatusFilter
          value={statusFilter}
          onChange={onStatusChange}
          options={USER_STATUS_OPTIONS}
          className="w-full sm:w-auto"
        />
      </div>
    </div>
  );
};

export default UserFilters;
