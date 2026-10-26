import React, { useState, useRef, useLayoutEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Plus, Sparkles, FileText, Layers, Video, Code, Quote, Image, HelpCircle } from "lucide-react";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { BlogSectionType } from "../schema";
import { PrimaryButton } from "@/components/ui/Button";

interface SectionAdderMenuProps {
  isAddMenuOpen?: boolean;
  setIsAddMenuOpen?: (isOpen: boolean) => void;
  handleAddSection: (type: BlogSectionType) => void;
  label?: string;
  direction?: "up" | "down";
}

interface MenuCoords {
  left: number;
  top: number;
  flipUp: boolean;
  maxHeight: number;
}

const getMenuCoords = (btn: HTMLElement, dir: "up" | "down"): MenuCoords => {
  const rect = btn.getBoundingClientRect();
  const vh = window.innerHeight;
  const vw = window.innerWidth;
  const spaceBelow = vh - rect.bottom - 16;
  const spaceAbove = rect.top - 16;

  const shouldFlipUp =
    dir === "up"
      ? spaceAbove >= 180 || spaceAbove >= spaceBelow
      : spaceBelow < 380 && spaceAbove > spaceBelow;

  const availableSpace = shouldFlipUp ? spaceAbove : spaceBelow;
  const maxHeight = Math.min(360, Math.max(160, availableSpace));

  const left = Math.min(vw - 140, Math.max(140, rect.left + rect.width / 2));
  const top = shouldFlipUp ? rect.top - 8 : rect.bottom + 8;

  return { left, top, flipUp: shouldFlipUp, maxHeight };
};

const SectionAdderMenu: React.FC<SectionAdderMenuProps> = ({
  isAddMenuOpen: controlledIsOpen,
  setIsAddMenuOpen: controlledSetIsOpen,
  handleAddSection,
  label = "Add New Section",
  direction = "down",
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = controlledSetIsOpen !== undefined ? controlledSetIsOpen : setInternalIsOpen;

  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [coords, setCoords] = useState<MenuCoords | null>(null);

  const updateCoords = useCallback(() => {
    if (buttonRef.current) {
      setCoords(getMenuCoords(buttonRef.current, direction));
    }
  }, [direction]);

  useLayoutEffect(() => {
    if (isOpen) {
      updateCoords();
      window.addEventListener("scroll", updateCoords, true);
      window.addEventListener("resize", updateCoords);
      return () => {
        window.removeEventListener("scroll", updateCoords, true);
        window.removeEventListener("resize", updateCoords);
      };
    }
  }, [isOpen, updateCoords]);

  const activeCoords = coords || (buttonRef.current ? getMenuCoords(buttonRef.current, direction) : null);
  const isFlipped = activeCoords?.flipUp ?? (direction === "up");

  const handleSelect = (type: BlogSectionType) => {
    handleAddSection(type);
    setIsOpen(false);
  };

  return (
    <>
      <PrimaryButton
        ref={buttonRef}
        type="button"
        onClick={() => {
          updateCoords();
          setIsOpen(!isOpen);
        }}
        fontClassName="text-xs font-bold"
        paddingClassName="px-6 py-3.5"
        className="rounded-full shadow-lg shadow-primary/20 hover:shadow-xl hover:scale-105 transition-all duration-300"
      >
        <Plus
          className={clsx(
            "w-4.5 h-4.5 transition-transform duration-300",
            isOpen && "rotate-45"
          )}
        />
        {label}
      </PrimaryButton>

      {isOpen && activeCoords && createPortal(
        <AnimatePresence>
          <div
            key="portal-backdrop"
            style={{ position: "fixed", inset: 0, zIndex: 99988 }}
            onClick={() => setIsOpen(false)}
            role="presentation"
            aria-hidden="true"
          />
          <div
            key="portal-popover-wrapper"
            style={{
              position: "fixed",
              left: `${activeCoords.left}px`,
              top: `${activeCoords.top}px`,
              transform: isFlipped ? "translate(-50%, -100%)" : "translate(-50%, 0)",
              zIndex: 99999,
              pointerEvents: "auto",
            }}
          >
            <motion.div
              key="portal-popover"
              initial={{ opacity: 0, scale: 0.95, y: isFlipped ? 8 : -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: isFlipped ? 8 : -8 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              style={{
                maxHeight: `${activeCoords.maxHeight}px`,
              }}
              className={clsx(
                "bg-white border border-gray rounded-2xl shadow-2xl p-2 flex flex-col gap-1 w-64 overflow-y-auto custom-scrollbar",
                isFlipped ? "origin-bottom" : "origin-top"
              )}
            >
              <p className="text-[10px] font-black text-dark-blue/40 uppercase tracking-widest text-center py-1.5 border-b border-gray mb-1 select-none">
                Choose Section Type
              </p>
              <button
                type="button"
                onClick={() => handleSelect(BlogSectionType.CONTENT)}
                className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-gray/50 text-dark-blue rounded-xl text-left text-xs font-bold transition-all cursor-pointer group"
              >
                <div className="w-5.5 h-5.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                Standard Content
              </button>
              <button
                type="button"
                onClick={() => handleSelect(BlogSectionType.FAQ)}
                className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-gray/50 text-dark-blue rounded-xl text-left text-xs font-bold transition-all cursor-pointer group"
              >
                <div className="w-5.5 h-5.5 rounded-lg bg-secondary/10 text-secondary group-hover:bg-secondary group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                  <HelpCircle className="w-3.5 h-3.5" />
                </div>
                FAQ Accordion
              </button>
              <button
                type="button"
                onClick={() => handleSelect(BlogSectionType.CTA)}
                className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-gray/50 text-dark-blue rounded-xl text-left text-xs font-bold transition-all cursor-pointer group"
              >
                <div className="w-5.5 h-5.5 rounded-lg bg-orange/10 text-orange group-hover:bg-orange group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                Call-To-Action Card
              </button>
              <button
                type="button"
                onClick={() => handleSelect(BlogSectionType.SUMMARY)}
                className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-gray/50 text-dark-blue rounded-xl text-left text-xs font-bold transition-all cursor-pointer group"
              >
                <div className="w-5.5 h-5.5 rounded-lg bg-green/10 text-green group-hover:bg-green group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                  <Layers className="w-3.5 h-3.5" />
                </div>
                Summary Section
              </button>
              <button
                type="button"
                onClick={() => handleSelect(BlogSectionType.EMBED)}
                className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-gray/50 text-dark-blue rounded-xl text-left text-xs font-bold transition-all cursor-pointer group"
              >
                <div className="w-5.5 h-5.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                  <Video className="w-3.5 h-3.5" />
                </div>
                Video Embed
              </button>
              <button
                type="button"
                onClick={() => handleSelect(BlogSectionType.CODE)}
                className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-gray/50 text-dark-blue rounded-xl text-left text-xs font-bold transition-all cursor-pointer group"
              >
                <div className="w-5.5 h-5.5 rounded-lg bg-orange/10 text-orange group-hover:bg-orange group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                  <Code className="w-3.5 h-3.5" />
                </div>
                Code Block
              </button>
              <button
                type="button"
                onClick={() => handleSelect(BlogSectionType.QUOTE)}
                className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-gray/50 text-dark-blue rounded-xl text-left text-xs font-bold transition-all cursor-pointer group"
              >
                <div className="w-5.5 h-5.5 rounded-lg bg-secondary/10 text-secondary group-hover:bg-secondary group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                  <Quote className="w-3.5 h-3.5" />
                </div>
                Quote
              </button>
              <button
                type="button"
                onClick={() => handleSelect(BlogSectionType.MEDIA)}
                className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-gray/50 text-dark-blue rounded-xl text-left text-xs font-bold transition-all cursor-pointer group"
              >
                <div className="w-5.5 h-5.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                  <Image className="w-3.5 h-3.5" />
                </div>
                Media Gallery
              </button>
            </motion.div>
          </div>
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default SectionAdderMenu;
