import React, { useMemo } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Sparkles, ChevronRight, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";

interface SEOAuditorProps {
  title: string;
  metaTitle?: string;
  metaDescription?: string;
  excerpt?: string;
  bannerImageAlt?: string;
  hasBannerImage: boolean;
  hasH2: boolean;
  isOpen: boolean;
  onToggle: () => void;
}

export const SEOAuditorSidebar: React.FC<SEOAuditorProps> = ({
  title,
  metaTitle = "",
  metaDescription = "",
  excerpt = "",
  bannerImageAlt = "",
  hasBannerImage,
  hasH2,
  isOpen,
  onToggle,
}) => {
  const audit = useMemo(() => {
    const checks = [];
    let score = 0;

    // 1. Meta Title Check
    const effectiveTitle = metaTitle || title;
    const titleLen = effectiveTitle.length;
    if (titleLen >= 50 && titleLen <= 60) {
      checks.push({
        label: `Meta Title Length (${titleLen}/60 chars)`,
        status: "pass",
        text: "Optimal length for Google SERP",
      });
      score += 20;
    } else if (titleLen >= 30 && titleLen <= 70) {
      checks.push({
        label: `Meta Title Length (${titleLen}/60 chars)`,
        status: "warn",
        text: "Slightly short or long",
      });
      score += 10;
    } else {
      checks.push({
        label: `Meta Title Length (${titleLen}/60 chars)`,
        status: "fail",
        text: "Aim for 50-60 characters",
      });
    }

    // 2. Meta Description Check
    const descLen = metaDescription.length;
    if (descLen >= 150 && descLen <= 160) {
      checks.push({
        label: `Meta Description (${descLen}/160 chars)`,
        status: "pass",
        text: "Optimal snippet length",
      });
      score += 20;
    } else if (descLen >= 100 && descLen <= 180) {
      checks.push({
        label: `Meta Description (${descLen}/160 chars)`,
        status: "warn",
        text: "Aim for 150-160 characters",
      });
      score += 10;
    } else {
      checks.push({
        label: `Meta Description (${descLen}/160 chars)`,
        status: "fail",
        text: "Missing or poorly formatted",
      });
    }

    // 3. Featured Image & Alt Text Check
    if (hasBannerImage && bannerImageAlt.trim().length > 0) {
      checks.push({
        label: "Featured Image Alt Text",
        status: "pass",
        text: "Alt text present for screen readers & SEO",
      });
      score += 20;
    } else if (hasBannerImage) {
      checks.push({
        label: "Featured Image Alt Text",
        status: "warn",
        text: "Image present, but Alt text is missing!",
      });
      score += 10;
    } else {
      checks.push({
        label: "Featured Image",
        status: "fail",
        text: "Add a cover image to increase CTR",
      });
    }

    // 4. Heading Structure (H2 Check)
    if (hasH2) {
      checks.push({
        label: "Heading Hierarchy",
        status: "pass",
        text: "Contains H2 section headers",
      });
      score += 20;
    } else {
      checks.push({
        label: "Heading Hierarchy",
        status: "fail",
        text: "Add H2 headings to break up content",
      });
    }

    // 5. Excerpt Check
    if (excerpt.length >= 80) {
      checks.push({
        label: "Post Excerpt",
        status: "pass",
        text: "Good summary provided",
      });
      score += 20;
    } else {
      checks.push({
        label: "Post Excerpt",
        status: "fail",
        text: "Add an excerpt for RSS feeds & card previews",
      });
    }

    return { checks, score };
  }, [title, metaTitle, metaDescription, excerpt, bannerImageAlt, hasBannerImage, hasH2]);

  const getScoreConfig = (score: number) => {
    if (score >= 80) return { colorClass: "bg-green text-green-600 border-green/20", progressColor: "bg-green", text: "Excellent" };
    if (score >= 50) return { colorClass: "bg-orange/10 text-orange border-orange/20", progressColor: "bg-orange", text: "Good" };
    return { colorClass: "bg-red-50 text-red-600 border-red-200", progressColor: "bg-red-500", text: "Needs Work" };
  };

  const scoreConfig = getScoreConfig(audit.score);

  return (
    <motion.div
      animate={{ width: isOpen ? 320 : 48 }}
      transition={{ type: "spring", stiffness: 350, damping: 30 }}
      className="sticky top-10 shrink-0 h-fit z-30 overflow-hidden"
    >
      {!isOpen ? (
        <button
          type="button"
          onClick={onToggle}
          className="w-12 bg-white/70 backdrop-blur-xl border border-gray rounded-3xl p-3 shadow-lg shadow-dark-blue/3 flex flex-col items-center gap-4 hover:border-primary/30 hover:bg-white transition-all cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5 text-dark-blue/40" />
          <Sparkles className="w-5 h-5 text-primary animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-dark-blue/40 [writing-mode:vertical-lr] my-2">
            SEO Audit
          </span>
        </button>
      ) : (
        <div className="w-80 bg-white/70 backdrop-blur-xl p-6 shadow-xl shadow-dark-blue/3 flex flex-col gap-6 text-dark-blue">
          <div className="flex items-center justify-between border-b border-gray pb-4">
            <h3 className="font-black text-sm uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" /> Live SEO Audit
            </h3>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-full border ${scoreConfig.colorClass}`}>
                {scoreConfig.text}
              </span>
              <button
                type="button"
                onClick={onToggle}
                className="p-1 rounded-lg hover:bg-gray text-dark-blue/30 hover:text-dark-blue/60 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-dark-blue/45 font-bold">SEO Health Score</span>
              <span className="font-black text-primary">{audit.score}/100</span>
            </div>
            <div className="w-full bg-gray h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${scoreConfig.progressColor}`}
                style={{ width: `${audit.score}%` }}
              />
            </div>
          </div>

          {/* Checklist Items */}
          <div className="space-y-4 pt-2">
            {audit.checks.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 text-xs leading-relaxed">
                {item.status === "pass" && <CheckCircle2 className="w-4.5 h-4.5 text-green shrink-0 mt-0.5" />}
                {item.status === "warn" && <AlertTriangle className="w-4.5 h-4.5 text-orange shrink-0 mt-0.5" />}
                {item.status === "fail" && <XCircle className="w-4.5 h-4.5 text-red-500 shrink-0 mt-0.5" />}
                <div>
                  <div className="font-bold text-dark-blue">{item.label}</div>
                  <div className="text-[10px] text-dark-blue/50 font-medium mt-0.5">{item.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};
