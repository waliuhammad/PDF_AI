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
 * The row stays empty until it is clicked. It deliberately does not preview on
 * hover: the fill means "this is your rating", and lighting stars up under a
 * passing pointer would spend that meaning on someone who has not chosen yet —
 * and say nothing at all on a touchscreen, where there is no hover to have.
 * What a star will do is in its label; the pointer gets a lift, not a fill.
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
    /** Display only — no clicking, not focusable. */
    readOnly?: boolean;
    size?: number;
    label?: string;
}) {
    // The last star clicked. Only these animate: the fill marks the moment a
    // choice was made, so anything that fills without a click must not use it.
    const [picked, setPicked] = useState(0);

    if (readOnly) {
        return (
            <div className="flex items-center gap-0.5" role="img" aria-label={`${label}: ${value} out of 5`}>
                {STARS.map((star) => (
                    <Star
                        key={star}
                        size={size}
                        aria-hidden="true"
                        className={star <= Math.round(value) ? "fill-yellow-400 text-yellow-400" : "fill-muted-foreground/15 text-muted-foreground/45"}
                    />
                ))}
            </div>
        );
    }

    return (
        <div className="flex items-center gap-1" role="radiogroup" aria-label={label}>
            {STARS.map((star) => {
                const filled = star <= value;
                // Stars up to the click fill in turn rather than together, so
                // the row reads left to right the way it was chosen.
                const animating = picked > 0 && star <= picked;

                return (
                    <button
                        key={star}
                        type="button"
                        role="radio"
                        aria-checked={value === star}
                        aria-label={`${star} ${star === 1 ? "star" : "stars"}`}
                        disabled={disabled}
                        onClick={() => {
                            setPicked(star);
                            onSelect?.(star);
                        }}
                        className="rounded-md p-1 transition-transform hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--primary)] disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        {/* The empty star is always there and the gold one lands
                            on top of it. That is what makes the fill animatable
                            at all — there is nothing to animate between on a
                            single icon that merely changes colour. */}
                        <span className="relative block">
                            <Star size={size} className="fill-muted-foreground/15 text-muted-foreground/45" />
                            {filled && (
                                <Star
                                    size={size}
                                    className={`absolute inset-0 fill-yellow-400 text-yellow-400 ${animating ? "animate-star-fill" : ""
                                        }`}
                                    style={animating ? { animationDelay: `${(star - 1) * 90}ms` } : undefined}
                                />
                            )}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
