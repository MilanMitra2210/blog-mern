import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  ChevronLeft,
  ChevronRight,
  Image,
  BookOpen,
  X,
  MessageSquare,
  Shield,
} from "lucide-react";
import { Permission } from "@/constants/permissions";
import { useAppSelector } from "@/store/store";

interface NavItem {
  label: string;
  icon: React.ElementType;
  path?: string;
  badge?: string;
  permission?: Permission;
}

interface SidebarProps {
  isMobileOpen?: boolean;
  onClose?: () => void;
}

const navItems: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { label: "Blogs", icon: BookOpen, path: "/blogs", permission: Permission.BLOGS_READ },
  { label: "Comments", icon: MessageSquare, path: "/comments", permission: Permission.BLOGS_READ },
  { label: "Media Manager", icon: Image, path: "/media", permission: Permission.MEDIA_READ },
  { label: "Users", icon: Users, path: "/users", permission: Permission.USERS_READ },
  { label: "Roles", icon: Shield, path: "/roles", permission: Permission.ROLES_READ },
];

const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen = false, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const user = useAppSelector((state) => state.auth.user);
  const isAdmin = user?.role === "ADMIN";

  const handleSecretRedirect = () => {
    if (isAdmin) {
      navigate("/roles");
    }
  };

  const allowedNavItems = isAdmin
    ? navItems
    : navItems.filter(
        (item) =>
          !item.permission ||
          (user?.roleRel?.permissions || user?.role_rel?.permissions)?.includes(
            item.permission
          )
      );

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-dark-blue/40 backdrop-blur-xs z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={`bg-white border-r border-gray flex flex-col transition-all duration-300 ${
          isMobileOpen
            ? "fixed inset-y-0 left-0 z-50 h-screen w-64 shadow-2xl translate-x-0"
            : "sticky top-20 h-[calc(100vh-5rem)] z-40 hidden lg:flex translate-x-0"
        } ${collapsed && !isMobileOpen ? "w-20" : "w-64"}`}
      >
        {/* Edge Toggle - Hidden on Mobile */}
        {!isMobileOpen && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="absolute -right-3 top-6 w-6 h-6 bg-white border border-gray rounded-md flex items-center justify-center shadow-sm hover:border-primary transition-all cursor-pointer z-50 text-dark-blue/40 hover:text-primary"
          >
            {collapsed ? (
              <ChevronRight className="w-3.5 h-3.5" />
            ) : (
              <ChevronLeft className="w-3.5 h-3.5" />
            )}
          </button>
        )}

        {/* Close Button - Mobile Only */}
        {isMobileOpen && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-1.5 rounded-lg text-dark-blue/45 hover:bg-gray/50 hover:text-dark-blue lg:hidden cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}

      {/* Nav Items */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {!collapsed && (
          <p className="extra-small-paragraph uppercase tracking-[0.2em] font-black text-dark-blue/30 px-3 mb-4">
            Navigation
          </p>
        )}

        {allowedNavItems.map((item) => {
          const isActive = item.path ? location.pathname === item.path : false;
          const Icon = item.icon;

          const content = (
            <div
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all group relative ${
                isActive
                  ? "bg-primary/5 text-primary"
                  : "text-dark-blue/60 hover:bg-gray/50 hover:text-dark-blue"
              } ${collapsed ? "justify-center" : ""}`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
                />
              )}

              <Icon
                className={`w-5 h-5 shrink-0 transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-dark-blue/30 group-hover:text-dark-blue/60"
                }`}
              />

              {!collapsed && (
                <span
                  className={`text-[13px] font-bold truncate ${isActive ? "text-primary" : ""}`}
                >
                  {item.label}
                </span>
              )}

              {collapsed && (
                <div className="absolute left-full ml-3 px-2 py-1 bg-dark-blue text-white extra-small-paragraph font-bold rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-lg">
                  {item.label}
                </div>
              )}
            </div>
          );

          return item.path ? (
            <Link key={item.label} to={item.path} className="block" onClick={onClose}>
              {content}
            </Link>
          ) : (
            <div key={item.label} className="opacity-40 cursor-not-allowed">
              {content}
            </div>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray select-none">
        {!collapsed ? (
          <div className="flex items-center justify-between">
            <span className="extra-small-paragraph font-black text-dark-blue/20 uppercase tracking-widest">
              QuillForge Admin
            </span>
            <span 
              onDoubleClick={handleSecretRedirect}
              className="extra-small-paragraph font-bold text-primary cursor-pointer active:opacity-75"
            >
              v1.0
            </span>
          </div>
        ) : (
          <div className="flex justify-center">
            <span 
              onDoubleClick={handleSecretRedirect}
              className="extra-small-paragraph font-black text-primary cursor-pointer active:opacity-75"
            >
              Z
            </span>
          </div>
        )}
      </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
