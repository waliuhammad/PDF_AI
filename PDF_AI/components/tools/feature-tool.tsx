"use client";

import { motion } from "framer-motion";
import { LucideIcon, Sparkles } from "lucide-react";

interface FeaturedToolProps {
    title: string;
    description: string;
    icon: LucideIcon;
    buttonText?: string;
    badge?: string;
}

export default function FeaturedTool({
    title,
    description,
    icon: Icon,
    buttonText = "Try Now",
    badge = "AI Powered",
}: FeaturedToolProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="
                relative
                overflow-hidden
                rounded-2xl
                border
                border-border
                bg-gradient-to-br
                from-primary/10
                via-card
                to-card
                p-6
            "
        >
            {/* Background Glow */}
            <div
                className="
                    absolute
                    -top-16
                    -right-16
                    h-40
                    w-40
                    rounded-full
                    bg-primary/15
                    blur-3xl
                "
            />

            <div className="relative z-10">
                <div className="mb-5 flex items-center justify-between">
                    <div
                        className="
                            flex
                            h-12
                            w-12
                            items-center
                            justify-center
                            rounded-xl
                            bg-primary/15
                        "
                    >
                        <Icon className="h-6 w-6 text-primary" />
                    </div>

                    <span
                        className="
                            inline-flex
                            items-center
                            gap-1
                            rounded-full
                            bg-primary/10
                            px-3
                            py-1
                            text-xs
                            font-medium
                            text-primary
                        "
                    >
                        <Sparkles className="h-3 w-3" />
                        {badge}
                    </span>
                </div>

                <h2 className="text-2xl font-bold text-fg">
                    {title}
                </h2>

                <p className="mt-3 max-w-lg text-sm leading-6 text-muted">
                    {description}
                </p>

                <button
                    className="
                        mt-6
                        rounded-xl
                        bg-primary
                        px-5
                        py-2.5
                        font-medium
                        text-primary-foreground
                        transition
                        hover:opacity-90
                    "
                >
                    {buttonText}
                </button>
            </div>
        </motion.div>
    );
}