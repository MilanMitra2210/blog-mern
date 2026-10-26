import {
  api,
  useMeQuery,
  useLogoutMutation,
} from "@/services/api";
import { Permission } from "@/constants/permissions";
import { store, useAppDispatch } from "@/store/store";
import { motion, AnimatePresence } from "framer-motion";
import {
  User as UserIcon,
  LogOut,
  Settings,
  Bell,
  Sun,
  Moon,
  Loader2,
  Menu,
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import React, { useEffect, useRef, useState } from "react";
import {
  Link,
  Outlet,
  useNavigate,
  useRevalidator,
  redirect,
  useLocation,
} from "react-router-dom";
import { GhostButton } from "@/components/ui/Button";
import AdminSidebar from "@/components/ui/Sidebar";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import { io } from "socket.io-client";
import { toast } from "react-toastify";

export const authLoader = () => {
  const { isAuthenticated } = store.getState().auth;

  if (!isAuthenticated) {
    throw redirect("/login");
  }

  return null;
};

const Authenticated: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigation = useNavigate();
  const [logoutUser] = useLogoutMutation();
  const { theme, toggleTheme } = useTheme();
  const { data: userResponse, isLoading } = useMeQuery();
  const user = userResponse?.data;
  const permissions =
    user?.roleRel?.permissions || user?.role_rel?.permissions || [];
  const { revalidate } = useRevalidator();
  const dispatch = useAppDispatch();
  const location = useLocation();

  useEffect(() => {
    if (!user) return;
    const socket = io("http://localhost:8080");

    socket.on("notification:new_comment", (data: any) => {
      toast.info(`💬 New comment on "${data.post}": "${(data.content || '').slice(0, 45)}..."`);
      dispatch(api.util.invalidateTags(["Comments", "Blogs"] as any));
    });

    socket.on("notification:new_post", (data: any) => {
      toast.success(`📝 New blog post published: "${data.title}"`);
      dispatch(api.util.invalidateTags(["Blogs"] as any));
    });

    return () => {
      socket.disconnect();
    };
  }, [user, dispatch]);

  useEffect(() => {
    if (!user) return;
    if (user.role === "ADMIN") return;

    const path = location.pathname;

    const routePermissions: {
      path: string;
      permission: Permission;
      pattern?: RegExp;
    }[] = [
      { path: "/roles", permission: Permission.ROLES_READ },
      { path: "/users", permission: Permission.USERS_READ },
      { path: "/blogs/new", permission: Permission.BLOGS_WRITE },
      {
        path: "",
        pattern: /^\/blogs\/[^/]+\/edit$/,
        permission: Permission.BLOGS_WRITE,
      },
      { path: "/blogs", permission: Permission.BLOGS_READ },
      { path: "/comments", permission: Permission.BLOGS_READ },
      { path: "/media", permission: Permission.MEDIA_READ },
    ];

    const matched = routePermissions.find((rp) => {
      if (rp.pattern) {
        return rp.pattern.test(path);
      }
      return path.startsWith(rp.path);
    });
    if (matched && !permissions.includes(matched.permission)) {
      navigation("/", { replace: true });
    }
  }, [user, location.pathname, navigation]);

  const afterLogout = async () => {
    await revalidate();
    dispatch(api.util.resetApiState());
  };

  const handleAction = async (action: "profile" | "logout") => {
    setIsMenuOpen(false);
    if (action === "logout") {
      await logoutUser().finally(afterLogout);
    } else {
      navigation("/" + action);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-blue">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // Reverted onboarding

  return (
    <div className="min-h-screen bg-light-blue">
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/80 backdrop-blur-md border-b border-gray sticky top-0 z-50"
      >
        <div className="root-container px-3">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="p-2.5 rounded-2xl bg-gray/30 hover:bg-gray/50 text-dark-blue/70 hover:text-dark-blue lg:hidden cursor-pointer shrink-0"
                title="Toggle Sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>

              <Link to="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:rotate-6 transition-transform">
                  <span className="text-white font-black text-xl">Q</span>
                </div>
                <span className="text-2xl font-black text-dark-blue tracking-tight hidden sm:block">
                  QuillForge<span className="text-primary">.</span>
                </span>
              </Link>

              {/* Site Selector Removed */}
            </div>

            <div className="flex items-center gap-4">
              <GhostButton className="p-2.5 rounded-2xl relative w-auto">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-orange rounded-full border-2 border-white"></span>
              </GhostButton>

              <GhostButton
                onClick={() => {
                  toggleTheme();
                }}
                className="p-2.5 rounded-2xl relative w-auto"
                title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              >
                {theme === "light" ? (
                  <Moon className="w-5 h-5" />
                ) : (
                  <Sun className="w-5 h-5" />
                )}
              </GhostButton>

              <div className="h-8 w-px bg-gray mx-2" />

              <div className="relative" ref={dropdownRef}>
                <GhostButton
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="w-auto py-1 px-2 group"
                >
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-bold text-dark-blue leading-none">
                      {user?.name ?? "Admin"}
                    </p>
                    <p className="text-[10px] font-bold text-dark-blue/40 uppercase tracking-widest mt-1">
                      {user?.role ?? "ADMIN"}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-gray border-2 border-gray overflow-hidden group-hover:border-primary transition-colors flex items-center justify-center">
                    {user?.image ? (
                      <img
                        src={
                          typeof user.image === "string"
                            ? user.image
                            : user.image?.url
                        }
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserIcon className="w-6 h-6 text-dark-blue/40" />
                    )}
                  </div>
                </GhostButton>

                <AnimatePresence>
                  {isMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-56 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl py-2 border border-white/60 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-gray mb-1">
                        <p className="text-xs font-black text-dark-blue/40 uppercase tracking-widest">
                          Account settings
                        </p>
                      </div>
                      <button
                        onClick={() => handleAction("profile")}
                        className="w-full text-left px-4 py-3 text-sm text-dark-blue/80 hover:bg-primary/5 hover:text-primary flex items-center gap-3 transition-colors font-semibold"
                      >
                        <Settings className="w-4 h-4" />
                        Manage Profile
                      </button>
                      <hr className="my-1 border-gray" />
                      <button
                        onClick={() => handleAction("logout")}
                        className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors font-bold"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="flex root-container relative">
        <AdminSidebar
          isMobileOpen={isMobileOpen}
          onClose={() => setIsMobileOpen(false)}
        />
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex-1 min-w-0 px-0 lg:px-6 py-6"
        >
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </motion.main>
      </div>
    </div>
  );
};

export default Authenticated;
