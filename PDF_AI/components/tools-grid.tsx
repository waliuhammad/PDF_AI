"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";

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

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-12 text-center"
                >
                    <span className="inline-flex rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-600">
                        PDF Toolkit
                    </span>

                    <h2 className="mt-4 text-4xl font-bold">
                        All PDF Tools
                    </h2>

                    <p className="mt-3 text-muted max-w-2xl mx-auto">
                        Convert, edit, compress, organise and secure your PDF files in one place.
                    </p>
                </motion.div>

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
                        <motion.div
                            key={tool.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <ToolCard {...tool} />
                        </motion.div>
                    ))}
                </div>

            </div>
        </section>
    );
}
