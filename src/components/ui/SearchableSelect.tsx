import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Search, Plus, Check, ChevronDown } from "lucide-react";

export interface SelectOption {
  id: string;
  name: string;
  [key: string]: any;
}

interface SearchableSelectProps {
  options: SelectOption[];
  value: SelectOption | null;
  onChange: (option: SelectOption | null) => void;
  onCreateNew?: (name: string) => Promise<SelectOption> | SelectOption;
  placeholder?: string;
  searchPlaceholder?: string;
  createLabel?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  maxHeight?: string;
  allowClear?: boolean;
  renderOption?: (option: SelectOption) => React.ReactNode;
  renderSelected?: (option: SelectOption) => React.ReactNode;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  onCreateNew,
  placeholder = "Select an option...",
  searchPlaceholder = "Search or type to create...",
  createLabel = "Create",
  disabled = false,
  required = false,
  className = "",
  maxHeight = "240px",
  allowClear = true,
  renderOption,
  renderSelected,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [dropdownStyles, setDropdownStyles] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter((option) =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canCreateNew =
    onCreateNew &&
    searchTerm.trim() &&
    !filteredOptions.some(
      (option) => option.name.toLowerCase() === searchTerm.toLowerCase()
    );

  const totalItems = filteredOptions.length + (canCreateNew ? 1 : 0);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    setHighlightedIndex(-1);
  }, [filteredOptions.length, canCreateNew]);

  const handleToggle = () => {
    if (disabled) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setDropdownStyles({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
    setIsOpen(!isOpen);
    setSearchTerm("");
    setHighlightedIndex(-1);
  };

  const handleOptionSelect = async (option: SelectOption) => {
    console.log("Selected option:", option);
    onChange(option);
    setIsOpen(false);
    setSearchTerm("");
    setHighlightedIndex(-1);
  };

  const handleCreateNew = async () => {
    if (!onCreateNew || !searchTerm.trim() || isCreating) return;
    setIsCreating(true);
    try {
      const newOption = await onCreateNew(searchTerm.trim());
      onChange(newOption);
      setIsOpen(false);
      setSearchTerm("");
      setHighlightedIndex(-1);
    } catch (error) {
      console.error("Failed to create new option:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }
    switch (e.key) {
      case "Escape":
        setIsOpen(false);
        setSearchTerm("");
        setHighlightedIndex(-1);
        break;
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : totalItems - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0) {
          if (highlightedIndex < filteredOptions.length) {
            handleOptionSelect(filteredOptions[highlightedIndex]);
          } else if (canCreateNew) {
            handleCreateNew();
          }
        } else if (canCreateNew) {
          handleCreateNew();
        }
        break;
    }
  };

  useEffect(() => {
    if (dropdownRef.current && highlightedIndex >= 0) {
      const el = dropdownRef.current.children[highlightedIndex] as HTMLElement;
      el?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex]);

  const defaultRenderOption = (option: SelectOption) => (
    <div className="flex items-center">{option.name}</div>
  );
  const defaultRenderSelected = (option: SelectOption) => (
    <span>{option.name}</span>
  );

  const dropdown = (
    <div
      style={{
        position: "absolute",
        top: dropdownStyles.top,
        left: dropdownStyles.left,
        width: dropdownStyles.width,
        zIndex: 9999,
      }}
      className="mt-1 bg-white border border-gray-300 rounded-xl shadow-lg"
    >
      <div className="p-3 border-b border-gray-100">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            ref={searchInputRef}
            type="text"
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>

      <div
        ref={dropdownRef}
        className="overflow-y-auto"
        style={{ maxHeight }}
        role="listbox"
      >
        {filteredOptions.length === 0 && !canCreateNew ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            No options found
          </div>
        ) : (
          <>
            {filteredOptions.map((option, index) => (
              <div
                key={option.id}
                className={`items px-4 py-3 cursor-pointer border-b border-gray-50 last:border-b-0 transition-colors duration-150 ${
                  highlightedIndex === index
                    ? "bg-blue-50 text-blue-700"
                    : "hover:bg-gray-50"
                } ${value?.id === option.id ? "bg-blue-100" : ""}`}
                onClick={() => handleOptionSelect(option)}
                role="option"
                aria-selected={value?.id === option.id}
              >
                <div
                  className="flex items-center justify-between"
                  onClick={() => handleOptionSelect(option)}
                >
                  {renderOption
                    ? renderOption(option)
                    : defaultRenderOption(option)}
                  {value?.id === option.id && (
                    <Check size={16} className="text-blue-600 ml-2" />
                  )}
                </div>
              </div>
            ))}

            {canCreateNew && (
              <div
                className={`px-4 py-3 cursor-pointer border-t border-gray-100 transition-colors duration-150 ${
                  highlightedIndex === filteredOptions.length
                    ? "bg-green-50 text-green-700"
                    : "hover:bg-gray-50"
                } ${isCreating ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={handleCreateNew}
                role="option"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1 bg-green-100 rounded-lg">
                    <Plus size={14} className="text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {createLabel} "{searchTerm}"
                    </div>
                    <div className="text-xs text-gray-500">
                      Add this as a new option
                    </div>
                  </div>
                  {isCreating && <div className="spinner w-4 h-4" />}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div
        className={`form-input cursor-pointer flex items-center justify-between ${
          disabled ? "bg-gray-50 cursor-not-allowed" : "hover:border-gray-400"
        } ${isOpen ? "border-blue-500 ring-2 ring-blue-200" : ""}`}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-required={required}
      >
        <div className="flex-1 min-w-0">
          {value ? (
            renderSelected ? (
              renderSelected(value)
            ) : (
              defaultRenderSelected(value)
            )
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </div>
        <div className="flex items-center gap-2 ml-2">
          {value && allowClear && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 p-1 rounded"
              tabIndex={-1}
            >
              ×
            </button>
          )}
          <ChevronDown
            size={16}
            className={`text-gray-400 transition-transform duration-200 ${
              isOpen ? "transform rotate-180" : ""
            }`}
          />
        </div>
      </div>

      {isOpen && createPortal(dropdown, document.body)}
    </div>
  );
};

export default SearchableSelect;
