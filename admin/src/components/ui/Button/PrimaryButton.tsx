import React from "react";
import { Link } from "react-router-dom";
import clsx from "clsx";
import { motion } from "framer-motion";

interface PrimaryButtonProps {
  href?: string;
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
  disabled?: boolean;
  fontClassName?: string;
  textColorClassName?: string;
  paddingClassName?: string;
}

const Shine = () => (
  <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-inherit">
    <motion.span
      aria-hidden
      className="absolute top-0 -left-full block h-full w-full bg-linear-to-r from-transparent via-white/30 to-transparent skew-x-[-30deg]"
      animate={{
        left: ["-100%", "200%"],
      }}
      transition={{
        duration: 2.5,
        repeat: Infinity,
        ease: [0.45, 0, 0.55, 1],
        repeatDelay: 1,
      }}
    />
  </span>
);

const PrimaryButton = React.forwardRef<
  HTMLButtonElement,
  PrimaryButtonProps
>(({
  href,
  children,
  onClick,
  type = "button",
  className,
  disabled = false,
  fontClassName = "text-sm sm:text-base font-bold",
  textColorClassName = "text-pure-white",
  paddingClassName = "py-2.5 px-6",
}, ref) => {
  const baseClasses = clsx(
    paddingClassName,
    "relative overflow-hidden rounded-xl",
    "flex items-center justify-center gap-2 cursor-pointer transition-all duration-300",
    "bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_100%] bg-left hover:bg-right shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-95",
    disabled && "opacity-50 cursor-not-allowed pointer-events-none shadow-none",
    fontClassName,
    textColorClassName,
    className
  );

  const handleOnClick = (
    event?: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>
  ) => {
    if (disabled) {
      event?.preventDefault();
      return;
    }
    onClick?.();
  };

  if (href) {
    return (
      <Link to={href} className={baseClasses} onClick={handleOnClick}>
        <Shine />
        {children}
      </Link>
    );
  }

  return (
    <button
      ref={ref}
      type={type}
      onClick={handleOnClick}
      disabled={disabled}
      className={baseClasses}
    >
      <Shine />
      {children}
    </button>
  );
});

export default PrimaryButton;
