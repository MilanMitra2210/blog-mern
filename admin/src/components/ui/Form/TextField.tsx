import * as React from "react";
import { FieldError } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label: string;
  error?: FieldError;
  isTextArea?: boolean;
  rows?: number;
  maxLength?: number;
  currentLength?: number;
}

const TextField = React.forwardRef<HTMLInputElement | HTMLTextAreaElement, TextFieldProps>(
  ({ label, error, isTextArea, className, maxLength, currentLength, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === "password";
    const InputComponent = isTextArea ? "textarea" : "input";
    
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;
    
    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between ml-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-dark-blue/40">
            {label}
          </label>
          {maxLength && (
            <span className={clsx(
              "text-[9px] font-bold uppercase tracking-widest transition-colors",
              currentLength && currentLength > maxLength ? "text-red-500" : "text-dark-blue/20"
            )}>
              {currentLength || 0} / {maxLength}
            </span>
          )}
        </div>
        <div className="relative">
          <InputComponent
            ref={ref as any}
            type={inputType}
            className={clsx(
              "input-field",
              isPassword && "pr-12",
              error && "input-field-error",
              className
            )}
            {...(props as any)}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-dark-blue/20 hover:text-dark-blue/60 transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          )}
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

TextField.displayName = "TextField";

export default TextField;
