"use client";

import { Search } from "lucide-react";

interface SearchToolProps {
    searchQuery: string;
    setSearchQuery: (value: string) => void;
}

export default function SearchTool({
    searchQuery,
    setSearchQuery,
}: SearchToolProps) {
    return (
        <div className="mx-auto max-w-5xl pb-6 sm:pb-12 animate-tool-in">
            <div className="relative">

                <Search
                    className="
                        absolute
                        left-4
                        sm:left-5
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
                        h-12
                        sm:h-14
                        rounded-2xl
                        border
                        border-border
                        bg-card
                        pl-12
                        sm:pl-14
                        pr-5
                        text-base
                        sm:text-lg
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
        </div>
    );
}