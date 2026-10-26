import React, { useState } from "react";
import {
  useFieldArray,
  Controller,
} from "react-hook-form";
import { ChevronUp, ChevronDown, Trash2, Plus } from "lucide-react";
import TextField from "@/components/ui/Form/TextField";
import JsonEditorField from "@/components/ui/Form/JsonEditorField";
import { GhostButton } from "@/components/ui/Button";
import clsx from "clsx";

interface SEOJsonLdFieldsProps {
  register: any;
  control: any;
  errors: any;
  watch: any;
  basePath?: string;
  className?: string;
}

const SEOJsonLdFields: React.FC<SEOJsonLdFieldsProps> = ({
  register,
  control,
  errors,
  watch,
  basePath = "seo.jsonLd",
  className = "",
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: basePath,
  });

  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const toggleBlock = (index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  const getError = (index: number, field: string) => {
    return (errors as any)?.seo?.jsonLd?.[index]?.[field];
  };

  return (
    <div className={clsx("space-y-4 pt-6 border-t border-gray/50", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-black uppercase tracking-wider text-dark-blue">Dynamic JSON-LD Schemas</h4>
          <p className="extra-small-paragraph mt-1">
            Add custom structured data schemas (JSON-LD) for search engines
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {fields.map((field, index) => {
          const isExpanded = expandedIndex === index;
          const blockId = watch(`${basePath}.${index}.id`) || `Schema ${index + 1}`;

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
                        JSON-LD Schema
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

                <div className="flex items-center gap-1 opacity-60 group-hover/section:opacity-100 transition-opacity shrink-0">
                  <GhostButton
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      remove(index);
                    }}
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
                  <div className="p-4 space-y-4">
                    <TextField
                      label="Schema ID / Type"
                      placeholder="e.g. Organization, Product, LocalBusiness"
                      error={getError(index, "id")}
                      {...register(`${basePath}.${index}.id`)}
                    />

                    <Controller
                      control={control}
                      name={`${basePath}.${index}.schema`}
                      render={({ field: controllerField }) => (
                        <JsonEditorField
                          label="Schema JSON-LD"
                          error={getError(index, "schema")}
                          {...controllerField}
                        />
                      )}
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
            append({ id: "", schema: "{\n  \n}" });
            setExpandedIndex(fields.length);
          }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Add JSON-LD Schema
        </button>
      </div>
    </div>
  );
};

export default SEOJsonLdFields;
