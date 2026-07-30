"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface ToolCardProps {
    name: string;
    description: string;
    icon: LucideIcon;
    href: string;
    color?: string;
    badge?: string;
}

export default function ToolCard({
    name,
    description,
    icon: Icon,
    href,
    color = "bg-primary/10",
    badge,
}: ToolCardProps) {
    return (
        <Link href={href} className="block h-full">
            <motion.div
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className="
          group
          relative
          flex
          h-full
          min-h-[165px]
          flex-col
          overflow-hidden
          rounded-2xl
          border
          border-border
          bg-card
          p-5
          transition-all
          duration-300
          hover:border-primary/40
          hover:shadow-xl
        "
            >
                {/* Badge */}
                {badge && (
                    <span
                        className="
              absolute
              right-4
              top-4
              rounded-full
              bg-primary/10
              px-2.5
              py-1
              text-[10px]
              font-semibold
              uppercase
              tracking-wide
              text-primary
            "
                    >
                        {badge}
                    </span>
                )}

                {/* Icon */}
                <div
                    className={`
            mb-4
            flex
            h-12
            w-12
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
            text-base
            font-semibold
            text-fg
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
            mt-2
            text-sm
            leading-6
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
            </motion.div>
        </Link>
    );
}