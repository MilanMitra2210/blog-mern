import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Inbox, BookOpen, ArrowRight } from "lucide-react";

import { useAppSelector } from "@/store/store";
import clsx from "clsx";

import { Permission } from "@/constants/permissions";

const MotionLink = motion.create(Link);

interface KpiGridProps {
  stats: {
    pendingEnquiries: number;
    totalEnquiries: number;
    totalBlogs: number;
  } | undefined;
}

const KpiGrid: React.FC<KpiGridProps> = ({ stats }) => {
  const user = useAppSelector((state) => state.auth.user);
  const permissions = user?.roleRel?.permissions || user?.role_rel?.permissions || [];
  const isAdmin = user?.role === "ADMIN";
  
  const canReadEnquiries = isAdmin || permissions.includes(Permission.ENQUIRIES_READ);
  const canReadBlogs = isAdmin || permissions.includes(Permission.BLOGS_READ);

  const kpis = [
    {
      label: "Pending Enquiries",
      value: stats?.pendingEnquiries ?? 0,
      subtext: `Out of ${stats?.totalEnquiries ?? 0} total`,
      icon: Inbox,
      colorClass: "text-orange bg-orange/10",
      link: "/enquiries",
      clickable: canReadEnquiries,
    },
    {
      label: "Blog Posts",
      value: stats?.totalBlogs ?? 0,
      subtext: "Articles published",
      icon: BookOpen,
      colorClass: "text-dark-blue bg-dark-blue/10",
      link: "/blogs",
      clickable: canReadBlogs,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        const cardContent = (
          <div className={clsx(
            "bg-white/70 backdrop-blur-xl border border-gray rounded-2xl p-6 shadow-sm transition-all group h-full",
            kpi.clickable && "hover:shadow-md cursor-pointer"
          )}>
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${kpi.colorClass} shrink-0`}>
                <Icon className="w-5 h-5" />
              </div>
              {kpi.clickable && (
                <span className="extra-small-text text-dark-blue/30 group-hover:text-primary font-black uppercase tracking-widest transition-colors flex items-center gap-1">
                  Manage <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              )}
            </div>
            <p className="h1 leading-none mb-1 text-dark-blue">
              {kpi.value}
            </p>
            <h3 className="small-paragraph text-dark-blue font-black uppercase tracking-wider">
              {kpi.label}
            </h3>
            <p className="extra-small-text text-dark-blue/40 mt-1 leading-none">
              {kpi.subtext}
            </p>
          </div>
        );

        if (kpi.clickable) {
          return (
            <MotionLink
              key={kpi.label}
              to={kpi.link}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4, scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 20,
                delay: idx * 0.05 
              }}
            >
              {cardContent}
            </MotionLink>
          );
        }

        return (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            {cardContent}
          </motion.div>
        );
      })}
    </div>
  );
};

export default KpiGrid;
