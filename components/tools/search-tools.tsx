"use client";

import { Search } from "lucide-react";
import { motion } from "framer-motion";

interface SearchToolProps {
    searchQuery: string;
    setSearchQuery: (value: string) => void;
}

export default function SearchTool({
    searchQuery,
    setSearchQuery,
}: SearchToolProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mx-auto max-w-5xl pb-12"
        >
            <div className="relative">

                <Search
                    className="
                        absolute
                        left-5
                        top-1/2
                        -translate-y-1/2
                        h-5
                        w-5
                        text-muted
                    "
                />

                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tools..."
                    className="
                        w-full
                        h-14
                        rounded-2xl
                        border
                        border-border
                        bg-card
                        pl-14
                        pr-5
                        text-lg
                        outline-none
                        transition-all
                        duration-300
                        placeholder:text-muted
                        focus:border-primary
                        focus:ring-4
                        focus:ring-primary/10
                    "
                />

            </div>
        </motion.div>
    );
}