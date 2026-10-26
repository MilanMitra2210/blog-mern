import * as React from "react";
import { FieldError } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertTriangle, Sparkles, Trash2 } from "lucide-react";
import clsx from "clsx";

interface JsonEditorFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: FieldError;
  onChangeValue?: (value: string) => void;
}

const JsonEditorField = React.forwardRef<HTMLTextAreaElement, JsonEditorFieldProps>(
  ({ label, error: hookFormError, className, value: propsValue, defaultValue, onChange, ...props }, ref) => {
    const localRef = React.useRef<HTMLTextAreaElement | null>(null);
    const lineNumbersRef = React.useRef<HTMLDivElement | null>(null);

    // Combine refs
    React.useImperativeHandle(ref, () => localRef.current!);

    // Controlled or uncontrolled internal value
    const [value, setValue] = React.useState<string>((propsValue as string) || (defaultValue as string) || "{}");
    const [jsonError, setJsonError] = React.useState<string | null>(null);
    const [lineCount, setLineCount] = React.useState(1);

    // Synchronize external value changes
    React.useEffect(() => {
      if (propsValue !== undefined && propsValue !== value) {
        setValue(propsValue as string);
        validateJson(propsValue as string);
        updateLineCount(propsValue as string);
      }
    }, [propsValue]);

    // Validation helper
    const validateJson = (val: string) => {
      if (!val || val.trim() === "") {
        setJsonError(null);
        return;
      }
      try {
        JSON.parse(val);
        setJsonError(null);
      } catch (err: any) {
        setJsonError(err.message || "Invalid JSON syntax");
      }
    };

    const updateLineCount = (val: string) => {
      const lines = val.split("\n").length;
      setLineCount(lines || 1);
    };

    // Format JSON
    const handleFormat = () => {
      try {
        const parsed = JSON.parse(value);
        const formatted = JSON.stringify(parsed, null, 2);
        setValue(formatted);
        setJsonError(null);
        updateLineCount(formatted);

        // Propagate change
        if (onChange) {
          const event = {
            target: {
              name: props.name,
              value: formatted,
            },
          } as React.ChangeEvent<HTMLTextAreaElement>;
          onChange(event);
        }
      } catch (err: any) {
        setJsonError(`Cannot format: ${err.message}`);
      }
    };

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const val = e.target.value;
      setValue(val);
      validateJson(val);
      updateLineCount(val);
      if (onChange) {
        onChange(e);
      }
    };

    // Sync scrolling of line numbers and textarea
    const handleScroll = () => {
      if (localRef.current && lineNumbersRef.current) {
        lineNumbersRef.current.scrollTop = localRef.current.scrollTop;
      }
    };

    // Prepopulate empty object if cleared
    const handleClear = () => {
      const clearedVal = "{\n  \n}";
      setValue(clearedVal);
      setJsonError(null);
      updateLineCount(clearedVal);
      if (onChange) {
        const event = {
          target: {
            name: props.name,
            value: clearedVal,
          },
        } as React.ChangeEvent<HTMLTextAreaElement>;
        onChange(event);
      }
    };

    // Keep state initialized correctly
    React.useEffect(() => {
      validateJson(value);
      updateLineCount(value);
    }, []);

    return (
      <div className="space-y-2 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 ml-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-dark-blue/40">
            {label}
          </label>
          <div className="flex items-center gap-2">
            {/* Status Indicator */}
            {jsonError ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-md border border-red-100">
                <AlertTriangle className="w-3 h-3" />
                Invalid JSON
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                <CheckCircle2 className="w-3 h-3" />
                Valid JSON
              </span>
            )}

            {/* Actions */}
            <button
              type="button"
              onClick={handleFormat}
              disabled={!!jsonError}
              className={clsx(
                "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-colors cursor-pointer",
                jsonError
                  ? "bg-gray/10 text-dark-blue/20 border-gray/25 cursor-not-allowed"
                  : "bg-primary/5 hover:bg-primary/10 text-primary border-primary/20"
              )}
            >
              <Sparkles className="w-3 h-3" />
              Format
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border border-gray bg-white text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              Clear
            </button>
          </div>
        </div>

        <div className="relative border border-gray rounded-xl overflow-hidden bg-slate-900 shadow-sm flex font-mono text-xs text-slate-100">
          {/* Line Numbers */}
          <div
            ref={lineNumbersRef}
            className="w-10 select-none bg-slate-950 py-3 text-right pr-2 text-slate-500 border-r border-slate-800 overflow-hidden text-[11px] leading-5 shrink-0"
            style={{ maxHeight: "320px" }}
          >
            {Array.from({ length: lineCount }).map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>

          {/* Text Area */}
          <textarea
            ref={localRef}
            value={value}
            onChange={handleTextareaChange}
            onScroll={handleScroll}
            spellCheck={false}
            className={clsx(
              "w-full bg-transparent px-3 py-3 outline-none resize-y font-mono text-[11px] leading-5 text-slate-100 caret-primary placeholder-slate-600 focus:ring-0 overflow-y-auto",
              className
            )}
            style={{ minHeight: "160px", maxHeight: "320px" }}
            {...props}
          />
        </div>

        {/* Validation Errors */}
        <AnimatePresence mode="wait">
          {(jsonError || hookFormError) && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -5 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -5 }}
              className="text-red-500 text-[11px] font-medium ml-1 mt-1 space-y-1 overflow-hidden"
            >
              {jsonError && (
                <div className="flex items-start gap-1.5 p-2 bg-red-50 border border-red-100 rounded-lg text-red-700">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{jsonError}</span>
                </div>
              )}
              {hookFormError && (
                <div className="text-red-500 font-bold">{hookFormError.message}</div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

JsonEditorField.displayName = "JsonEditorField";

export default JsonEditorField;
