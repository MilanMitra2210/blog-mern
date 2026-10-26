import * as React from "react";
import { FieldError } from "react-hook-form";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: FieldError;
  options: { label: string; value: string | number }[];
  placeholder?: string;
}

const SelectField = React.forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ label, error, options, placeholder, className, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between ml-1">
          <label className="text-[10px] font-black uppercase tracking-[0.15em] text-dark-blue/40">
            {label}
          </label>
        </div>
        <div className="relative group">
          <select
            ref={ref}
            className={clsx(
              "input-field appearance-none cursor-pointer pr-10",
              error && "input-field-error",
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled hidden>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-dark-blue/20 group-focus-within:text-primary transition-colors">
            <ChevronDown className="w-5 h-5" />
          </div>
        </div>
        <AnimatePresence mode="wait">
          {error && (
            <motion.p
              initial={{ opacity: 0, height: 0, y: -5 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -5 }}
              className="text-red-500 extra-small-paragraph mt-1! ml-1! overflow-hidden"
            >
              {error.message}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

SelectField.displayName = "SelectField";

export default SelectField;
