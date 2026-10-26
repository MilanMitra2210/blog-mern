import React, { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  delay?: number;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
  delay = 500,
}) => {
  const [localValue, setLocalValue] = useState(value);
  const debouncedValue = useDebounce(localValue, delay);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (debouncedValue !== value && debouncedValue === localValue) {
      onChange(debouncedValue);
    }
  }, [debouncedValue, onChange, value, localValue]);

  const handleClear = () => {
    setLocalValue("");
    onChange("");
  };

  return (
    <div className={`relative flex-1 w-full group ${className}`}>
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-blue/30 group-focus-within:text-primary transition-colors">
        <Search className="w-4 h-4" />
      </div>
      <input
        type="text"
        placeholder={placeholder}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        className="w-full pl-11 pr-4 py-2.5 bg-white/60 border border-gray rounded-xl small-paragraph focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all placeholder:text-dark-blue/20"
      />
      {localValue && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-gray text-dark-blue/30 hover:text-dark-blue/60 transition-all cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
