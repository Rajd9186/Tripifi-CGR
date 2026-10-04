"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
}

export function AutocompleteInput({
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
}: UseAutocompleteOptions) {
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
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
            onSelect(filteredOptions[highlightedIndex]);
            setQuery("");
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
    setQuery("");
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
    <div className="relative" ref={inputRef}>
      {label && <label htmlFor={id} className="input-label">{label}</label>}
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400 pointer-events-none" aria-hidden="true" />
        <input
          type="text"
          id={id}
          placeholder={placeholder}
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          className={cn(
            "field min-h-[52px] pl-10 pr-10",
            query && "pr-20",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500"
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
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-ink-400 hover:text-ink-700 transition-colors"
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
          className="absolute z-50 mt-1 w-full max-h-64 overflow-auto rounded-xl border border-ink-200 bg-white shadow-card p-1"
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
                "px-3 py-2.5 rounded-lg cursor-pointer transition-colors",
                index === highlightedIndex ? "bg-saffron-50 text-ink-900" : "text-ink-700 hover:bg-ink-50"
              )}
            >
              <div className="flex items-center gap-2">
                {option.code && (
                  <span className="shrink-0 text-xs font-mono text-ink-500 bg-ink-50 px-2 py-0.5 rounded">
                    {option.code}
                  </span>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{option.label}</p>
                  {option.sublabel && <p className="text-xs text-ink-500 truncate">{option.sublabel}</p>}
                </div>
                {option.category && (
                  <span className="text-xs text-saffron-600 font-medium whitespace-nowrap">{option.category}</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {isOpen && filteredOptions.length === 0 && query.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-ink-200 bg-white shadow-card p-3 text-center text-sm text-ink-500">
          No matches found
        </div>
      )}
    </div>
  );
}