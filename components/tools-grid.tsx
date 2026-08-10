"use client";

import { useMemo, useState } from "react";
import { Reveal } from "@/components/reveal";

import ToolCard from "./tools/tool-card";
import SearchTool from "./tools/search-tools";
import CategoryFilter from "./tools/category-filter";

import { tools } from "@/lib/tools";

export function ToolsGrid() {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("All Tools");

    const filteredTools = useMemo(() => {
        return tools.filter((tool) => {
            const matchesSearch =
                tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                tool.description.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesCategory =
                activeCategory === "All Tools" ||
                tool.category === activeCategory;

            return matchesSearch && matchesCategory;
        });
    }, [searchQuery, activeCategory]);

    return (
        <section id="tools" className="py-10 sm:py-16 px-4 sm:px-6">
            <div className="mx-auto max-w-7xl">

                {/* Heading */}

                <Reveal>
<div className="mb-8 sm:mb-12 text-center">
                    <span className="inline-flex rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-600">
                        PDF Toolkit
                    </span>

                    <h2 className="mt-3 sm:mt-4 text-2xl sm:text-4xl font-bold">
                        All PDF Tools
                    </h2>

                    <p className="mt-3 text-muted max-w-2xl mx-auto">
                        Convert, edit, compress, organise and secure your PDF files in one place.
                    </p>
                </div>
</Reveal>

                {/* Search */}

                <SearchTool
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                />

                {/* Categories */}

                {/* Not flex/justify-center any more: the filter row scrolls
                    horizontally on mobile and needs the full width to do it. It
                    centres itself from sm up. */}
                <div className="mb-8 sm:mb-14">
                    <CategoryFilter
                        activeCategory={activeCategory}
                        setActiveCategory={setActiveCategory}
                    />
                </div>

                {/* Cards */}

                {/* Three per row on phones. The card centres its content and
                    drops to small type at that width so a ~110px track still
                    reads. */}
                <div className="grid grid-cols-3 gap-2.5 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredTools.map((tool, index) => (
                        <Reveal key={tool.name} delay={index * 50} className="h-full">
<div className="h-full">
                            <ToolCard {...tool} />
                        </div>
</Reveal>
                    ))}
                </div>

            </div>
        </section>
    );
}
