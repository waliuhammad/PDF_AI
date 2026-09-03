"use client";

import { useState } from "react";
import { Star } from "lucide-react";

const STARS = [1, 2, 3, 4, 5] as const;

/**
 * Five stars, for choosing a rating or for showing one.
 *
 * Buttons rather than a row of icons with a click handler on the parent: each
 * star is a real control, so it is reachable by keyboard, announced with what
 * it will do, and has a touch target of its own. `readOnly` turns the same
 * component into a display — the CTA and the popup then cannot drift apart in
 * how a filled star looks.
 *
 * Hover is tracked here and only here. Lifting it to the caller would mean
 * every user of this component reimplementing "light up this star and the ones
 * before it", which is the whole behaviour people recognise a star rating by.
 */
export function StarRating({
    value,
    onSelect,
    disabled = false,
    readOnly = false,
    size = 28,
    label = "Rating",
}: {
    /** Stars filled, 0 for none. */
    value: number;
    onSelect?: (rating: number) => void;
    /** Submitting: the choice still shows, but cannot be changed. */
    disabled?: boolean;
    /** Display only — no hover, no clicking, not focusable. */
    readOnly?: boolean;
    size?: number;
    label?: string;
}) {
    const [hovered, setHovered] = useState(0);

    // While the pointer is over the row, the stars follow the pointer rather
    // than the stored value — that preview is what makes the control feel like
    // it is responding before anything is committed.
    const shown = !readOnly && hovered > 0 ? hovered : value;

    if (readOnly) {
        return (
            <div className="flex items-center gap-0.5" role="img" aria-label={`${label}: ${value} out of 5`}>
                {STARS.map((star) => (
                    <Star
                        key={star}
                        size={size}
                        aria-hidden="true"
                        className={star <= Math.round(value) ? "fill-yellow-400 text-yellow-400" : "text-muted/40"}
                    />
                ))}
            </div>
        );
    }

    return (
        <div
            className="flex items-center gap-1"
            role="radiogroup"
            aria-label={label}
            onMouseLeave={() => setHovered(0)}
        >
            {STARS.map((star) => (
                <button
                    key={star}
                    type="button"
                    role="radio"
                    aria-checked={value === star}
                    aria-label={`${star} ${star === 1 ? "star" : "stars"}`}
                    disabled={disabled}
                    onMouseEnter={() => setHovered(star)}
                    // Focus previews too, so someone tabbing through sees the
                    // same thing a mouse user sees.
                    onFocus={() => setHovered(star)}
                    onBlur={() => setHovered(0)}
                    onClick={() => onSelect?.(star)}
                    className="rounded-md p-1 transition-transform hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--primary)] disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                    <Star
                        size={size}
                        className={`transition-colors ${star <= shown ? "fill-yellow-400 text-yellow-400" : "text-muted/40"
                            }`}
                    />
                </button>
            ))}
        </div>
    );
}
