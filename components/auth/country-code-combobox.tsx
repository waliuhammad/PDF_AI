"use client";

import { useEffect, useRef, useState } from "react";
import { COUNTRY_CODES } from "@/lib/countryCodes";

interface CountryCodeComboboxProps {
    value: string;
    onChange: (dialCode: string) => void;
}

/**
 * Small combobox for the phone dial code field.
 * - Typeable: the user can type any dial code freely (e.g. "+92").
 * - Selectable: a dropdown lists all COUNTRY_CODES; clicking one fills the
 *   input with that country's dial code and closes the dropdown.
 */
export function CountryCodeCombobox({ value, onChange }: CountryCodeComboboxProps) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filtered = COUNTRY_CODES.filter((c) => {
        const query = value.trim().toLowerCase();
        if (!query) return true;
        return (
            c.dialCode.toLowerCase().includes(query) ||
            c.name.toLowerCase().includes(query) ||
            c.code.toLowerCase().includes(query)
        );
    });

    return (
        <div ref={containerRef} className="relative w-16 sm:w-20 shrink-0">
            <input
                type="text"
                aria-label="Country dialling code"
                value={value}
                onChange={(e) => {
                    onChange(e.target.value);
                    setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                placeholder="+1"
              className="w-full py-2.5 px-2 rounded-xl bg-card border border-card text-fg text-sm focus:outline-none focus:border-[var(--primary)] transition-colors"
            />

            {open && filtered.length > 0 && (
                <ul className="absolute z-20 mt-1 max-h-56 w-48 overflow-y-auto rounded-xl border border-card bg-card py-1 text-sm shadow-lg">
                    {filtered.map((c) => (
                        <li key={`${c.code}-${c.dialCode}`}>
                            <button
                                type="button"
                                onClick={() => {
                                    onChange(c.dialCode);
                                    setOpen(false);
                                }}
                                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-fg hover:bg-primary/10 transition-colors"
                            >
                                <span className="truncate">{c.name}</span>
                                <span className="text-muted shrink-0">{c.dialCode}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}