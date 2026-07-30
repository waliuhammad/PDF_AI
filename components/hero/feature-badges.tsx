"use client";

import { ShieldCheck, Sparkles, Zap } from "lucide-react";
import { motion } from "framer-motion";

const badges = [
    {
        icon: ShieldCheck,
        label: "Secure by Design",
    },
    {
        icon: Zap,
        label: "Lightning Fast",
    },
    {
        icon: Sparkles,
        label: "AI Powered",
    },
];

export function FeatureBadges() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-8 flex flex-wrap items-center gap-3"
        >
            {badges.map((badge) => {
                const Icon = badge.icon;

                return (
                    <div
                        key={badge.label}
                        className="
              flex
              items-center
              gap-2
              rounded-full
              border
              border-default
              bg-surface
              px-4
              py-2
              shadow-soft
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:shadow-medium
            "
                    >
                        <Icon
                            size={16}
                            className="text-[var(--primary)]"
                        />

                        <span className="text-sm font-medium text-fg">
                            {badge.label}
                        </span>
                    </div>
                );
            })}
        </motion.div>
    );
}