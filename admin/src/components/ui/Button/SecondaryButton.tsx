import React from "react";
import { Link } from "react-router-dom";
import clsx from "clsx";

interface SecondaryButtonProps {
  href?: string;
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
  disabled?: boolean;
  fontClassName?: string;
  paddingClassName?: string;
}

const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  href,
  children,
  onClick,
  type = "button",
  className,
  disabled = false,
  fontClassName = "text-sm sm:text-base font-bold text-dark-blue",
  paddingClassName = "px-6 py-2"
}) => {
  const baseClasses = clsx(
    paddingClassName,
    "relative overflow-hidden rounded-xl",
    "flex items-center justify-center gap-2 cursor-pointer transition-all duration-300",
    "border-2 border-gray bg-white/50 backdrop-blur-sm hover:bg-gray/50 hover:border-dark-blue/20 active:scale-95",
    disabled && "opacity-50 grayscale cursor-not-allowed pointer-events-none",
    fontClassName,
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
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={handleOnClick}
      disabled={disabled}
      className={baseClasses}
    >
      {children}
    </button>
  );
};

export default SecondaryButton;
