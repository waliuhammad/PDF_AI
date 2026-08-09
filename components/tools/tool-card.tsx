"use client";

import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface ToolCardProps {
    name: string;
    description: string;
    icon: LucideIcon;
    href: string;
    color?: string;
    badge?: string;
    comingSoon?: boolean;
}

export default function ToolCard({
    name,
    description,
    icon: Icon,
    href,
    color = "bg-primary/10",
    badge,
    comingSoon = false,
}: ToolCardProps) {
    // The lift on hover was a framer-motion whileHover. This card is on screen
    // twenty-two times on /tools, and the profile put framer among the most
    // expensive scripts there — for a translate and a scale, which CSS does free.
    //
    // Two layouts, one component. On a phone this is a compact horizontal row
    // — icon, then title and description in a column beside it — which is what
    // keeps a stacked list from becoming a column of oversized blocks. From sm
    // it is the original vertical card, unchanged: icon above title above
    // description, min-h-[165px] so a grid row stays even.
    const card = (
        <div
            className={`
                group
                relative
                flex
                h-full
                w-full
                flex-row
                items-start
                gap-3
                overflow-hidden
                rounded-2xl
                border
                border-border
                bg-card
                p-3.5
                transition-all
                duration-200
                hover:border-primary/40
                hover:shadow-xl
                sm:min-h-[165px]
                sm:flex-col
                sm:gap-0
                sm:p-5
                ${comingSoon ? "" : "hover:-translate-y-[5px] hover:scale-[1.02]"}
            `}
        >
            {/* Icon */}
            <div
                className={`
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    sm:mb-4
                    sm:h-12
                    sm:w-12
                    ${color}
                `}
            >
                <Icon
                    size={20}
                    className="text-primary transition-transform duration-300 group-hover:scale-110 sm:size-[22px]"
                />
            </div>

            {/* min-w-0 lets a long name like "PDF to PowerPoint" wrap inside the
                column instead of forcing the flex row wider than the card. */}
            <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold leading-snug text-fg transition-colors duration-300 [overflow-wrap:anywhere] group-hover:text-primary sm:text-base">
                    {name}
                </h3>

                <p className="mt-1 text-xs leading-5 text-muted sm:mt-2 sm:text-sm sm:leading-6">
                    {description}
                </p>
            </div>

            {/* Badge. A third item in the row on a phone, so it can never sit on
                top of the title; the original absolute top-right corner from sm. */}
            {(comingSoon || badge) && (
                <span
                    className="
                        shrink-0
                        self-start
                        rounded-full
                        bg-primary/10
                        px-2
                        py-0.5
                        text-[10px]
                        font-semibold
                        uppercase
                        tracking-wide
                        text-primary
                        sm:absolute
                        sm:right-4
                        sm:top-4
                        sm:px-2.5
                        sm:py-1
                    "
                >
                    {comingSoon ? "Soon" : badge}
                </span>
            )}

            {/* Hover Glow */}
            <div
                className="
                    pointer-events-none
                    absolute
                    inset-0
                    bg-gradient-to-br
                    from-primary/5
                    via-transparent
                    to-primary/5
                    opacity-0
                    transition-opacity
                    duration-300
                    group-hover:opacity-100
                "
            />
        </div>
    );

    // Tools without a page yet render as a plain container so they can't 404.
    return comingSoon ? (
        <div className="block h-full cursor-not-allowed opacity-60">{card}</div>
    ) : (
        // Twenty-two of these sit on /tools, and Next prefetches every link in
        // view: 112 requests for a page where one card gets clicked, several of
        // them fetched repeatedly as the grid re-renders on search. Hover is
        // early enough to prefetch.
        <Link href={href} prefetch={false} className="block h-full">
            {card}
        </Link>
    );
}
