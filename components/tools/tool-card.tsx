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
    const card = (
        <div
                className={`
          group
          relative
          flex
          h-full
          min-h-[132px]
          sm:min-h-[165px]
          flex-col
          overflow-hidden
          rounded-2xl
          border
          border-border
          bg-card
          p-4
          sm:p-5
          transition-all
          duration-200
          hover:border-primary/40
          hover:shadow-xl
          ${comingSoon ? "" : "hover:-translate-y-[5px] hover:scale-[1.02]"}
        `}
            >
                {/* Badge */}
                {(comingSoon || badge) && (
                    <span
                        className="
              absolute
              right-3
              top-3
              sm:right-4
              sm:top-4
              rounded-full
              bg-primary/10
              px-2
              sm:px-2.5
              py-0.5
              sm:py-1
              text-[10px]
              font-semibold
              uppercase
              tracking-wide
              text-primary
            "
                    >
                        {comingSoon ? "Soon" : badge}
                    </span>
                )}

                {/* Icon */}
                <div
                    className={`
            mb-3
            sm:mb-4
            flex
            h-10
            w-10
            sm:h-12
            sm:w-12
            items-center
            justify-center
            rounded-xl
            ${color}
          `}
                >
                    <Icon
                        size={22}
                        className="
              text-primary
              transition-transform
              duration-300
              group-hover:scale-110
            "
                    />
                </div>

                {/* Title */}
                <h3
                    className="
            text-sm
            sm:text-base
            font-semibold
            text-fg
            leading-snug
            transition-colors
            duration-300
            group-hover:text-primary
          "
                >
                    {name}
                </h3>

                {/* Description */}
                <p
                    className="
            mt-1.5
            text-xs
            sm:text-sm
            leading-5
            sm:leading-6
            text-muted
            line-clamp-2
          "
                >
                    {description}
                </p>

                {/* Hover Glow */}
                <div
                    className="
            absolute
            inset-0
            opacity-0
            transition-opacity
            duration-300
            group-hover:opacity-100
            pointer-events-none
            bg-gradient-to-br
            from-primary/5
            via-transparent
            to-primary/5
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