import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, Image, Users, User, ArrowRight, MessageSquare } from "lucide-react";
import clsx from "clsx";

interface QuickOperationsProps {
  isFullWidth?: boolean;
  isAdmin?: boolean;
}

const QuickOperations: React.FC<QuickOperationsProps> = ({ isFullWidth, isAdmin = false }) => {
  return (
    <div
      className={clsx(
        "bg-white/70 backdrop-blur-xl border border-gray rounded-3xl p-6 shadow-sm flex flex-col",
        isFullWidth ? "h-75 lg:h-65" : "h-130"
      )}
    >
      <h3 className="small-paragraph text-dark-blue font-black uppercase tracking-widest border-b border-gray pb-3 mb-2 shrink-0">
        Quick Operations
      </h3>

      <div
        className={clsx(
          "flex-1 overflow-y-auto pr-1 custom-scrollbar",
          isFullWidth ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-2" : "space-y-2.5"
        )}
      >
        <Link
          to="/blogs/new"
          className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-gray bg-white hover:bg-light-blue/20 text-left transition-all cursor-pointer group shadow-sm hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Sparkles className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="small-paragraph font-black text-dark-blue leading-none">Write Blog</p>
              <p className="extra-small-text text-dark-blue/40 mt-1">Create publication</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-dark-blue/20 group-hover:translate-x-0.5 group-hover:text-primary transition-all" />
        </Link>

        <Link
          to="/media?modal=upload"
          className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-gray bg-white hover:bg-light-blue/20 text-left transition-all cursor-pointer group shadow-sm hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600">
              <Image className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="small-paragraph font-black text-dark-blue leading-none">Upload Media</p>
              <p className="extra-small-text text-dark-blue/40 mt-1">Upload images & files</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-dark-blue/20 group-hover:translate-x-0.5 group-hover:text-emerald-600 transition-all" />
        </Link>

        {isAdmin && (
          <Link
            to="/comments"
            className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-gray bg-white hover:bg-light-blue/20 text-left transition-all cursor-pointer group shadow-sm hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-600">
                <MessageSquare className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="small-paragraph font-black text-dark-blue leading-none">Manage Comments</p>
                <p className="extra-small-text text-dark-blue/40 mt-1">Moderate blog comments</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-dark-blue/20 group-hover:translate-x-0.5 group-hover:text-violet-600 transition-all" />
          </Link>
        )}

        {isAdmin && (
          <Link
            to="/users"
            className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-gray bg-white hover:bg-light-blue/20 text-left transition-all cursor-pointer group shadow-sm hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-600">
                <Users className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="small-paragraph font-black text-dark-blue leading-none">Manage Users</p>
                <p className="extra-small-text text-dark-blue/40 mt-1">Accounts & permissions</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-dark-blue/20 group-hover:translate-x-0.5 group-hover:text-teal-600 transition-all" />
          </Link>
        )}

        <Link
          to="/profile"
          className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-gray bg-white hover:bg-light-blue/20 text-left transition-all cursor-pointer group shadow-sm hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-dark-blue/10 text-dark-blue">
              <User className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="small-paragraph font-black text-dark-blue leading-none">My Profile</p>
              <p className="extra-small-text text-dark-blue/40 mt-1">Account settings</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-dark-blue/20 group-hover:translate-x-0.5 group-hover:text-dark-blue transition-all" />
        </Link>
      </div>
    </div>
  );
};

export default QuickOperations;
