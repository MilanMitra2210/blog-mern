import React, { useState, useEffect } from "react";
import { useFieldArray, Controller } from "react-hook-form";
import { ChevronUp, ChevronDown, Trash2, Plus, Settings, Code, ToggleLeft, ToggleRight } from "lucide-react";
import TextField from "@/components/ui/Form/TextField";
import JsonEditorField from "@/components/ui/Form/JsonEditorField";
import { GhostButton } from "@/components/ui/Button";
import clsx from "clsx";

interface ContentBlockFieldsProps {
  register: any;
  control: any;
  errors: any;
  watch: any;
  basePath?: string;
  className?: string;
  hideHeader?: boolean;
}

interface VisualValueFieldProps {
  value: any;
  onChange: (val: any) => void;
}

const getValueType = (val: any): "text" | "number" | "boolean" | "array" | "object" => {
  if (Array.isArray(val)) return "array";
  if (typeof val === "boolean") return "boolean";
  if (typeof val === "number") return "number";
  if (typeof val === "object" && val !== null) return "object";
  return "text";
};

interface VisualObjectEditorProps {
  value: Record<string, any>;
  onChange: (val: Record<string, any>) => void;
}

const VisualObjectEditor: React.FC<VisualObjectEditorProps> = ({ value, onChange }) => {
  const [entries, setEntries] = useState<{ id: string; key: string; value: any }[]>([]);

  useEffect(() => {
    const currentKeys = entries.map((e) => e.key);
    const valueKeys = Object.keys(value || {});
    const isSame =
      currentKeys.length === valueKeys.length &&
      currentKeys.every((k) => valueKeys.includes(k));

    if (!isSame) {
      setEntries(
        Object.entries(value || {}).map(([k, v]) => ({
          id: Math.random().toString(36).substring(2, 9),
          key: k,
          value: v,
        }))
      );
    }
  }, [value]);

  const propagate = (newEntries: typeof entries) => {
    const obj: Record<string, any> = {};
    newEntries.forEach((e) => {
      if (e.key.trim()) {
        obj[e.key.trim()] = e.value;
      }
    });
    onChange(obj);
  };

  const handleKeyChange = (index: number, newKey: string) => {
    const updated = [...entries];
    updated[index].key = newKey;
    setEntries(updated);
    propagate(updated);
  };

  const handleValueChange = (index: number, newVal: any) => {
    const updated = [...entries];
    updated[index].value = newVal;
    setEntries(updated);
    propagate(updated);
  };

  const handleTypeChange = (index: number, newType: string) => {
    let defaultValue: any = "";
    if (newType === "number") defaultValue = 0;
    else if (newType === "boolean") defaultValue = false;
    else if (newType === "array") defaultValue = [];
    else if (newType === "object") defaultValue = {};

    const updated = [...entries];
    updated[index].value = defaultValue;
    setEntries(updated);
    propagate(updated);
  };

  const handleAddProperty = () => {
    let baseKey = "property";
    let key = baseKey;
    let counter = 1;
    while (key in value) {
      key = `${baseKey}_${counter}`;
      counter++;
    }
    const newEntry = {
      id: Math.random().toString(36).substring(2, 9),
      key,
      value: "",
    };
    const updated = [...entries, newEntry];
    setEntries(updated);
    propagate(updated);
  };

  const handleRemoveProperty = (index: number) => {
    const updated = entries.filter((_, i) => i !== index);
    setEntries(updated);
    propagate(updated);
  };

  return (
    <div className="space-y-3 border-l-2 border-primary/20 pl-3 py-1">
      <div className="space-y-3">
        {entries.map((entry, idx) => (
          <div
            key={entry.id}
            className="flex flex-col gap-1.5 p-2 bg-white rounded-lg border border-gray"
          >
            <div className="flex items-start gap-2">
              <input
                type="text"
                value={entry.key}
                placeholder="Key"
                onChange={(e) => handleKeyChange(idx, e.target.value)}
                className="w-1/4 small-paragraph font-bold text-dark-blue/80 bg-light-blue/10 rounded-md border border-gray px-2.5 py-1.5 outline-hidden focus:border-primary mt-0.5"
              />

              <select
                value={getValueType(entry.value)}
                onChange={(e) => handleTypeChange(idx, e.target.value)}
                className="text-[10px] font-bold text-dark-blue/70 bg-white rounded-md border border-gray px-1.5 py-1 mt-1.5 shrink-0 cursor-pointer outline-hidden focus:border-primary"
              >
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="boolean">Boolean</option>
                <option value="array">List (Array)</option>
                <option value="object">Object</option>
              </select>

              <span className="text-[10px] text-dark-blue/30 mt-2">:</span>

              <div className="flex-1 min-w-0">
                <VisualValueField
                  value={entry.value}
                  onChange={(newVal) => handleValueChange(idx, newVal)}
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemoveProperty(idx)}
                className="p-1 rounded-lg hover:bg-red-50 text-dark-blue/30 hover:text-red-500 transition-colors cursor-pointer shrink-0 mt-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {entries.length === 0 && (
        <p className="text-[10px] text-dark-blue/40 italic">Empty Object</p>
      )}

      <button
        type="button"
        onClick={handleAddProperty}
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/5 hover:bg-primary/10 text-primary text-[10px] font-bold border border-primary/10 cursor-pointer transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        Add Field
      </button>
    </div>
  );
};

const VisualValueField: React.FC<VisualValueFieldProps> = ({ value, onChange }) => {
  // 1. Boolean Toggle
  if (typeof value === "boolean") {
    return (
      <button
        type="button"
        onClick={() => onChange(!value)}
        className="flex items-center gap-2 small-paragraph font-bold text-dark-blue cursor-pointer"
      >
        {value ? (
          <ToggleRight className="w-7 h-7 text-primary shrink-0" />
        ) : (
          <ToggleLeft className="w-7 h-7 text-dark-blue/20 shrink-0" />
        )}
        <span>{value ? "True" : "False"}</span>
      </button>
    );
  }

  // 2. Number Input
  if (typeof value === "number") {
    return (
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full small-paragraph text-dark-blue bg-white rounded-lg border border-gray px-3 py-2 outline-hidden focus:border-primary focus:ring-1 focus:ring-primary/20"
      />
    );
  }

  // 3. Array (List of Items)
  if (Array.isArray(value)) {
    const handleItemChange = (index: number, newVal: any) => {
      const updated = [...value];
      updated[index] = newVal;
      onChange(updated);
    };

    const handleAddItem = (type: "text" | "object") => {
      const newItem = type === "object" ? {} : "";
      onChange([...value, newItem]);
    };

    const handleRemoveItem = (index: number) => {
      onChange(value.filter((_, i) => i !== index));
    };

    return (
      <div className="space-y-2 border-l-2 border-primary/20 pl-3 py-1">
        <div className="space-y-2">
          {value.map((item, idx) => (
            <div key={idx} className="flex gap-2 items-start bg-dark-blue/2 py-2 px-2.5 rounded-lg border border-gray/50">
              <span className="text-[10px] font-black text-dark-blue/30 shrink-0 mt-2.5">
                #{idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <VisualValueField value={item} onChange={(newVal) => handleItemChange(idx, newVal)} />
              </div>
              <button
                type="button"
                onClick={() => handleRemoveItem(idx)}
                className="p-1 rounded-lg hover:bg-red-50 text-dark-blue/30 hover:text-red-500 transition-colors cursor-pointer shrink-0 mt-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {value.length === 0 && (
          <p className="text-[10px] text-dark-blue/40 italic">Empty List</p>
        )}

        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => handleAddItem("text")}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/5 hover:bg-primary/10 text-primary text-[10px] font-bold border border-primary/10 cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Text
          </button>
          <button
            type="button"
            onClick={() => handleAddItem("object")}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/5 hover:bg-primary/10 text-primary text-[10px] font-bold border border-primary/10 cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Object
          </button>
        </div>
      </div>
    );
  }

  // 4. Object (Key-Value map)
  if (typeof value === "object" && value !== null) {
    return <VisualObjectEditor value={value} onChange={onChange} />;
  }

  // 5. Default Fallback (String / Null)
  return (
    <input
      type="text"
      value={value ?? ""}
      placeholder="Value"
      onChange={(e) => onChange(e.target.value)}
      className="w-full small-paragraph text-dark-blue bg-white rounded-lg border border-gray px-3 py-2 outline-hidden focus:border-primary focus:ring-1 focus:ring-primary/20"
    />
  );
};

// Sub-component for Visual Key-Value Editor
interface VisualKvEditorProps {
  value: string;
  onChange: (val: string) => void;
  error?: any;
}

const VisualKvEditor: React.FC<VisualKvEditorProps> = ({ value, onChange, error }) => {
  const [data, setData] = useState<any>(null);

  // Parse JSON string
  useEffect(() => {
    try {
      const parsed = JSON.parse(value || "{}");
      if (typeof parsed === "object" && parsed !== null) {
        setData(parsed);
      } else {
        setData({});
      }
    } catch {
      setData({});
    }
  }, [value]);

  const handleDataChange = (updated: any) => {
    setData(updated);
    onChange(JSON.stringify(updated, null, 2));
  };

  if (data === null) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest text-dark-blue/40">
          Visual Fields Editor
        </span>
      </div>

      <VisualValueField value={data} onChange={handleDataChange} />

      {error && (
        <p className="text-red-500 text-[11px] font-medium mt-1">
          {error.message || "Invalid configuration value"}
        </p>
      )}
    </div>
  );
};

const ContentBlockFields: React.FC<ContentBlockFieldsProps> = ({
  register,
  control,
  errors,
  watch,
  basePath = "contentBlocks",
  className = "",
  hideHeader = false,
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: basePath,
  });

  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [editorModes, setEditorModes] = useState<Record<number, "visual" | "json">>({});

  const toggleBlock = (index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  const getError = (index: number, field: string) => {
    return (errors as any)[basePath]?.[index]?.[field];
  };

  return (
    <div className={clsx("space-y-6", className)}>
      {!hideHeader && (
        <div className="flex items-center justify-between">
          <div>
            <h3 className="h4">Content Blocks</h3>
            <p className="extra-small-paragraph mt-1">
              Add dynamic content blocks to layout this page
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {fields.map((field, index) => {
          const isExpanded = expandedIndex === index;
          const blockId = watch(`${basePath}.${index}.id`) || `Block ${index + 1}`;
          const currentMode = editorModes[index] || "visual";

          return (
            <div
              key={field.id}
              className="relative bg-white border border-gray rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group/section"
            >
              {/* Accordion Header */}
              <div
                onClick={() => toggleBlock(index)}
                role="button"
                tabIndex={0}
                aria-expanded={isExpanded}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleBlock(index);
                  }
                }}
                className={clsx(
                  "sticky top-0 z-20 flex items-center justify-between px-3 py-3 bg-light-blue/75 backdrop-blur-md border-b border-gray cursor-pointer select-none shadow-sm/5 transition-all duration-200 focus:outline-none",
                  isExpanded ? "rounded-t-[14px]" : "rounded-[14px]"
                )}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="flex-1 flex items-center gap-3 py-1.5 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-dark-blue/5 border border-gray flex items-center justify-center text-xs font-black text-dark-blue/40 shrink-0">
                      {index + 1}
                    </span>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 min-w-0 flex-1">
                      <span className="bg-primary/10 text-primary border border-primary/20 inline-flex items-center px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider shrink-0 w-fit">
                        Content Block
                      </span>
                      <p className="text-xs font-black text-dark-blue uppercase tracking-wider leading-none truncate max-w-37.5 sm:max-w-md">
                        {blockId}
                      </p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-dark-blue/30 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-dark-blue/30 shrink-0" />
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 opacity-60 group-hover/section:opacity-100 transition-opacity shrink-0" onClick={(e) => e.stopPropagation()}>
                  {/* Mode switcher tabs */}
                  {isExpanded && (
                    <div className="flex bg-white/80 rounded-lg p-0.5 border border-gray shadow-xs text-[10px] font-bold">
                      <button
                        type="button"
                        onClick={() => setEditorModes((prev) => ({ ...prev, [index]: "visual" }))}
                        className={clsx(
                          "px-2 py-1 rounded-md flex items-center gap-1 cursor-pointer transition-colors",
                          currentMode === "visual" ? "bg-primary text-white" : "text-dark-blue/50 hover:text-dark-blue"
                        )}
                      >
                        <Settings className="w-3.5 h-3.5" />
                        Visual
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditorModes((prev) => ({ ...prev, [index]: "json" }))}
                        className={clsx(
                          "px-2 py-1 rounded-md flex items-center gap-1 cursor-pointer transition-colors",
                          currentMode === "json" ? "bg-primary text-white" : "text-dark-blue/50 hover:text-dark-blue"
                        )}
                      >
                        <Code className="w-3.5 h-3.5" />
                        JSON
                      </button>
                    </div>
                  )}

                  <GhostButton
                    type="button"
                    onClick={() => remove(index)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-dark-blue/40 hover:text-red-500 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </GhostButton>
                </div>
              </div>

              {/* Accordion Body */}
              <div
                style={{
                  display: "grid",
                  gridTemplateRows: isExpanded ? "1fr" : "0fr",
                  transition: "grid-template-rows 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease-out",
                  opacity: isExpanded ? 1 : 0,
                }}
                className={clsx(!isExpanded && "overflow-hidden")}
              >
                <div className="min-h-0">
                  <div className="p-4 space-y-5">
                    <TextField
                      label="Block ID / Identifier"
                      placeholder="e.g. banner, featured-products"
                      error={getError(index, "id")}
                      {...register(`${basePath}.${index}.id`)}
                    />

                    <Controller
                      control={control}
                      name={`${basePath}.${index}.content`}
                      render={({ field: controllerField }) => {
                        if (currentMode === "visual") {
                          return (
                            <VisualKvEditor
                              value={controllerField.value}
                              onChange={controllerField.onChange}
                              error={getError(index, "content")}
                            />
                          );
                        }
                        return (
                          <JsonEditorField
                            label="Content (JSON)"
                            error={getError(index, "content")}
                            {...controllerField}
                          />
                        );
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => {
            append({ id: "", content: "{}" });
            setExpandedIndex(fields.length);
          }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Block
        </button>
      </div>
    </div>
  );
};

export default ContentBlockFields;
