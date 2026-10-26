import * as React from "react";
import { FieldError } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { Check } from "lucide-react";

interface CheckboxFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: FieldError;
}

const CheckboxField = React.forwardRef<HTMLInputElement, CheckboxFieldProps>(
  ({ label, error, className, checked, onChange, ...props }, ref) => {
    const [isChecked, setIsChecked] = React.useState(checked || false);

    React.useEffect(() => {
      if (checked !== undefined) {
        setIsChecked(checked);
      }
    }, [checked]);

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setIsChecked(e.target.checked);
      if (onChange) {
        onChange(e);
      }
    };

    return (
      <div className="space-y-1">
        <label className="flex items-center gap-2.5 cursor-pointer select-none group">
          <div className="relative flex items-center justify-center shrink-0">
            <input
              ref={ref}
              type="checkbox"
              className="sr-only"
              checked={isChecked}
              onChange={handleCheckboxChange}
              {...props}
            />
            <motion.div
              animate={{
                backgroundColor: isChecked ? "var(--color-primary, #306198)" : "transparent",
                borderColor: isChecked ? "var(--color-primary, #306198)" : (error ? "#ef4444" : "#cbd5e1"),
                scale: isChecked ? [0.95, 1.05, 1] : 1,
              }}
              transition={{ duration: 0.2 }}
              className={clsx(
                "w-5 h-5 border-2 rounded-lg flex items-center justify-center transition-colors shadow-sm",
                "group-hover:border-primary/60",
                error && "border-red-500"
              )}
            >
              <AnimatePresence>
                {isChecked && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    <Check className="w-3.5 h-3.5 text-white stroke-[3.5]" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
          <span className="text-xs font-semibold text-dark-blue/80 group-hover:text-dark-blue transition-colors">
            {label}
          </span>
        </label>
        <AnimatePresence mode="wait">
          {error && (
            <motion.p
              initial={{ opacity: 0, height: 0, y: -5 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -5 }}
              className="text-red-500 extra-small-paragraph mt-1! ml-1! overflow-hidden font-medium"
            >
              {error.message}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

CheckboxField.displayName = "CheckboxField";

export default CheckboxField;
