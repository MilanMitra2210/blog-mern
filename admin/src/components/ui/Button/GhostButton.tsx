import React from "react";
import { Link } from "react-router-dom";
import clsx from "clsx";

interface GhostButtonProps {
  href?: string;
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  type?: "button" | "submit" | "reset";
  className?: string;
  disabled?: boolean;
  title?: string;
  paddingClassName?: string;
}

const GhostButton: React.FC<GhostButtonProps> = ({
  href,
  children,
  onClick,
  type = "button",
  className,
  disabled = false,
  title,
  paddingClassName = "px-4 py-2",
}) => {
  const baseClasses = clsx(
    paddingClassName,
    "relative overflow-hidden rounded-xl transition-all duration-300",
    "flex items-center justify-center gap-2 cursor-pointer",
    "bg-transparent text-dark-blue/70 hover:bg-gray/50 hover:text-dark-blue active:scale-95",
    disabled && "opacity-50 grayscale cursor-not-allowed pointer-events-none",
    className
  );

  const handleOnClick = (
    event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>
  ) => {
    if (disabled) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  if (href) {
    return (
      <Link to={href} className={baseClasses} onClick={handleOnClick} title={title}>
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
      title={title}
    >
      {children}
    </button>
  );
};

export default GhostButton;
