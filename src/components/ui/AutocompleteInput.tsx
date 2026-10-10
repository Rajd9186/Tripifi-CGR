"use client";

import { useState, useEffect, useRef, useCallback, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { SearchIcon, XIcon, ChevronDownIcon } from "@/components/icons/BookingIcons";

interface AutocompleteOption {
  id: string;
  label: string;
  sublabel?: string;
  code?: string;
  category?: string;
}

interface UseAutocompleteOptions {
  label?: string;
  options: AutocompleteOption[];
  onSelect: (option: AutocompleteOption) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  searchable?: boolean;
  maxOptions?: number;
  value?: string;
  error?: string;
  id?: string;
  className?: string;
  onFocus?: () => void;
  onBlur?: () => void;
}

export const AutocompleteInput = forwardRef<HTMLInputElement, UseAutocompleteOptions>(function AutocompleteInput({
  label,
  options,
  onSelect,
  onChange,
  placeholder = "Search...",
  searchable = true,
  maxOptions = 10,
  value = "",
  error,
  id,
  className,
  onFocus,
  onBlur,
}, ref) {
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const filteredOptions = options
    .filter((opt) =>
      opt.label.toLowerCase().includes(query.toLowerCase()) ||
      opt.sublabel?.toLowerCase().includes(query.toLowerCase()) ||
      opt.code?.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, maxOptions);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        if (listRef.current && !listRef.current.contains(e.target as Node)) {
          setIsOpen(false);
          setHighlightedIndex(-1);
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen && (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter")) {
        e.preventDefault();
        setIsOpen(true);
        setHighlightedIndex(e.key === "ArrowUp" ? filteredOptions.length - 1 : 0);
        return;
      }

      if (!isOpen) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex((prev) => Math.min(prev + 1, filteredOptions.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((prev) => Math.max(prev - 1, -1));
          break;
        case "Enter":
          e.preventDefault();
          if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
            const option = filteredOptions[highlightedIndex];
            onSelect(option);
            setQuery(option.label);
            setIsOpen(false);
            setHighlightedIndex(-1);
            inputRef.current?.blur();
          }
          break;
        case "Escape":
          setIsOpen(false);
          setHighlightedIndex(-1);
          inputRef.current?.blur();
          break;
      }
    },
    [isOpen, filteredOptions, highlightedIndex, onSelect]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);
    onChange?.(e);
    if (!isOpen && newValue.length > 0) setIsOpen(true);
    setHighlightedIndex(-1);
  };

  const handleSelectOption = (option: AutocompleteOption) => {
    onSelect(option);
    // Keep the selection visible in the field (empty id = cleared).
    setQuery(option.id ? option.label : "");
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    setQuery("");
    onChange?.({ target: { value: "" } } as React.ChangeEvent<HTMLInputElement>);
    onSelect({ id: "", label: "", sublabel: "", code: "" });
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      {label && <label htmlFor={id} className="input-label">{label}</label>}
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400 pointer-events-none" aria-hidden="true" />
        <input
          ref={(node) => {
            inputRef.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) (ref as any).current = node;
          }}
          type="text"
          id={id}
          placeholder={placeholder}
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setIsOpen(true);
            onFocus?.();
          }}
          onBlur={() => onBlur?.()}
          className={cn(
            "field min-h-[52px] pl-10 pr-10",
            query && "pr-20",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500",
            className
          )}
          autoComplete="off"
          aria-autocomplete="list"
          aria-controls="autocomplete-list"
          aria-expanded={isOpen}
          aria-activedescendant={highlightedIndex >= 0 ? `autocomplete-option-${highlightedIndex}` : undefined}
          aria-invalid={error ? "true" : "false"}
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-1 top-1/2 flex min-h-[44px] min-w-[44px] -translate-y-1/2 items-center justify-center text-ink-400 hover:text-ink-700 transition-colors"
            aria-label="Clear search"
          >
            <XIcon className="w-5 h-5" />
          </button>
        )}
        {!query && (
          <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400 pointer-events-none" aria-hidden="true" />
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-600" id={`${id}-error`}>{error}</p>}

      {isOpen && filteredOptions.length > 0 && (
        <ul
          id="autocomplete-list"
          ref={listRef}
          role="listbox"
          className="absolute z-[60] mt-2 max-h-64 w-full overflow-auto rounded-xl border border-border bg-bg-elevated p-1.5 shadow-card-hover"
        >
          {filteredOptions.map((option, index) => (
            <li
              key={option.id}
              id={`autocomplete-option-${index}`}
              role="option"
              aria-selected={index === highlightedIndex}
              onClick={() => handleSelectOption(option)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={cn(
                "cursor-pointer rounded-lg px-3 py-2.5 transition-colors",
                index === highlightedIndex
                  ? "bg-[#FFB454]/15 text-text"
                  : "text-text-muted hover:bg-surface-hover"
              )}
            >
              <div className="flex items-center gap-2">
                {option.code && (
                  <span className="shrink-0 rounded bg-surface-hover px-2 py-0.5 font-mono text-xs text-text-dim">
                    {option.code}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{option.label}</p>
                  {option.sublabel && <p className="truncate text-xs text-text-dim">{option.sublabel}</p>}
                </div>
                {option.category && (
                  <span className="whitespace-nowrap text-xs font-medium text-[#FFB454]">{option.category}</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {isOpen && filteredOptions.length === 0 && query.length > 0 && (
        <div className="absolute z-[60] mt-2 w-full rounded-xl border border-border bg-bg-elevated p-3 text-center text-sm text-text-dim shadow-card-hover">
          No matches found
        </div>
      )}
    </div>
  );
});
AutocompleteInput.displayName = "AutocompleteInput";