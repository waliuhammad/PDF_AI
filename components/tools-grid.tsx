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
        <section id="tools" className="py-16 px-6">
            <div className="mx-auto max-w-7xl">

                {/* Heading */}

                <Reveal>
<div className="mb-12 text-center">
                    <span className="inline-flex rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-600">
                        PDF Toolkit
                    </span>

                    <h2 className="mt-4 text-4xl font-bold">
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

                <div className="flex justify-center mb-14">
                    <CategoryFilter
                        activeCategory={activeCategory}
                        setActiveCategory={setActiveCategory}
                    />
                </div>

                {/* Cards */}

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
