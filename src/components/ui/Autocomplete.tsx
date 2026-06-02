"use client";

import { useEffect, useMemo, useRef, useState } from "react";

interface AutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  className?: string;
  maxResults?: number;
}

export function Autocomplete({
  value,
  onChange,
  options,
  placeholder,
  className = "",
  maxResults = 8,
}: AutocompleteProps) {
  const [open, setOpen] = useState(false);

  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const filteredOptions = useMemo(() => {
    const search = value.trim().toLowerCase();

    if (!search) {
      return options.slice(0, maxResults);
    }

    return options
      .filter((item) => item.toLowerCase().includes(search))
      .slice(0, maxResults);
  }, [options, value, maxResults]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="relative"
    >
      <input
        value={value}
        placeholder={placeholder}
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          onChange(event.target.value);
          setOpen(true);
        }}
        className={className}
      />

      {open && filteredOptions.length > 0 && (
        <div
          className="
            absolute
            z-50

            mt-1

            w-full

            overflow-hidden

            rounded-xl

            border
            border-[color:var(--border-soft)]

            bg-white

            shadow-[0_20px_50px_rgba(0,0,0,0.10)]
          "
        >
          {filteredOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
              className="
                block

                w-full

                px-3
                py-2

                text-left
                text-[13px]

                transition-colors

                hover:bg-[color:var(--surface-200)]
              "
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}