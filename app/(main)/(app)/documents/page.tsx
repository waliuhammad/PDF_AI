"use client";

import { useState, useMemo } from "react";
import {
    Upload,
    Search,
    Grid3x3,
    List,
    ChevronDown,
} from "lucide-react";
import { DocumentCard } from "@/components/documents/document-card";
import { DocumentRow } from "@/components/documents/document-row";
import { UploadModal } from "@/components/documents/upload-modal";

interface Doc {
    id: string;
    name: string;
    size: string;
    sizeBytes: number;
    date: string;
    timestamp: number;
    favorite: boolean;
}

const initialDocs: Doc[] = [
    { id: "1", name: "Research Paper - Neural Networks.pdf", size: "2.4 MB", sizeBytes: 2.4, date: "2 hours ago", timestamp: Date.now() - 2 * 3600000, favorite: true },
    { id: "2", name: "Company Financial Report Q3.pdf", size: "5.1 MB", sizeBytes: 5.1, date: "Yesterday", timestamp: Date.now() - 86400000, favorite: false },
    { id: "3", name: "Contract Agreement Draft.pdf", size: "890 KB", sizeBytes: 0.87, date: "3 days ago", timestamp: Date.now() - 3 * 86400000, favorite: false },
    { id: "4", name: "Product Roadmap 2026.pdf", size: "1.2 MB", sizeBytes: 1.2, date: "5 days ago", timestamp: Date.now() - 5 * 86400000, favorite: true },
    { id: "5", name: "Legal Terms & Conditions.pdf", size: "640 KB", sizeBytes: 0.64, date: "1 week ago", timestamp: Date.now() - 7 * 86400000, favorite: false },
    { id: "6", name: "Marketing Strategy Deck.pdf", size: "3.8 MB", sizeBytes: 3.8, date: "2 weeks ago", timestamp: Date.now() - 14 * 86400000, favorite: false },
];

type SortOption = "newest" | "oldest" | "name" | "size";
type FilterOption = "all" | "favorites";

export default function DocumentsPage() {
    const [docs, setDocs] = useState<Doc[]>(initialDocs);
    const [view, setView] = useState<"grid" | "list">("grid");
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState<SortOption>("newest");
    const [filter, setFilter] = useState<FilterOption>("all");
    const [sortOpen, setSortOpen] = useState(false);
    const [showUpload, setShowUpload] = useState(false);

    const filteredDocs = useMemo(() => {
        let result = [...docs];

        if (search.trim()) {
            result = result.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()));
        }

        if (filter === "favorites") {
            result = result.filter((d) => d.favorite);
        }

        switch (sort) {
            case "newest":
                result.sort((a, b) => b.timestamp - a.timestamp);
                break;
            case "oldest":
                result.sort((a, b) => a.timestamp - b.timestamp);
                break;
            case "name":
                result.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case "size":
                result.sort((a, b) => b.sizeBytes - a.sizeBytes);
                break;
        }

        return result;
    }, [docs, search, sort, filter]);

    const toggleFavorite = (id: string) => {
        setDocs((prev) => prev.map((d) => (d.id === id ? { ...d, favorite: !d.favorite } : d)));
    };

    const deleteDoc = (id: string) => {
        setDocs((prev) => prev.filter((d) => d.id !== id));
    };

    const addUploadedDocs = (uploaded: { name: string; size: string; bytes: number }[]) => {
        const now = Date.now();
        const newDocs: Doc[] = uploaded.map((f, i) => ({
            id: `${now}-${i}`,
            name: f.name,
            size: f.size,
            // Existing rows store this in MB, so match that unit rather than raw bytes.
            sizeBytes: f.bytes / (1024 * 1024),
            date: "Just now",
            timestamp: now,
            favorite: false,
        }));
        setDocs((prev) => [...newDocs, ...prev]);
    };

    const renameDoc = (id: string) => {
        const newName = prompt("Enter new name:");
        if (!newName) return;
        setDocs((prev) => prev.map((d) => (d.id === id ? { ...d, name: newName } : d)));
    };

    const sortLabels: Record<SortOption, string> = {
        newest: "Newest first",
        oldest: "Oldest first",
        name: "Name (A-Z)",
        size: "Largest first",
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-fg">My Documents</h1>
                    <p className="text-muted text-sm mt-1">{filteredDocs.length} documents</p>
                </div>
                <button
                    onClick={() => setShowUpload(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--primary)] text-white text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors"
                >
                    <Upload size={16} />
                    Upload PDF
                </button>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search documents..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-card text-fg placeholder:text-muted text-sm focus:outline-none focus:border-[var(--primary)] transition-colors bg-card"
                    />
                </div>

                {/* Filter tabs */}
                <div className="flex items-center gap-1 p-1 rounded-xl border border-card bg-card">
                    <button
                        onClick={() => setFilter("all")}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${filter === "all" ? "bg-[var(--primary)] text-white" : "text-muted"
                            }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter("favorites")}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${filter === "favorites" ? "bg-[var(--primary)] text-white" : "text-muted"
                            }`}
                    >
                        Favorites
                    </button>
                </div>

                {/* Sort dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setSortOpen(!sortOpen)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-card text-sm text-fg bg-card whitespace-nowrap"
                    >
                        {sortLabels[sort]}
                        <ChevronDown size={14} className={`transition-transform ${sortOpen ? "rotate-180" : ""}`} />
                    </button>
                    {sortOpen && (
                        <div className="absolute right-0 top-12 z-10 w-40 bg-card border border-card rounded-xl shadow-lg py-1">
                            {(Object.keys(sortLabels) as SortOption[]).map((option) => (
                                <button
                                    key={option}
                                    onClick={() => { setSort(option); setSortOpen(false); }}
                                    className="w-full text-left px-3 py-2 text-sm text-fg hover:bg-[var(--background-secondary)]"
                                >
                                    {sortLabels[option]}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* View toggle */}
                <div className="flex items-center gap-1 p-1 rounded-xl border border-card bg-card">
                    <button
                        onClick={() => setView("grid")}
                        className={`p-2 rounded-lg transition-colors ${view === "grid" ? "bg-[var(--primary)] text-white" : "text-muted"}`}
                    >
                        <Grid3x3 size={16} />
                    </button>
                    <button
                        onClick={() => setView("list")}
                        className={`p-2 rounded-lg transition-colors ${view === "list" ? "bg-[var(--primary)] text-white" : "text-muted"}`}
                    >
                        <List size={16} />
                    </button>
                </div>
            </div>

            {/* Content */}
            {filteredDocs.length === 0 ? (
                <div className="text-center py-16">
                    <p className="text-muted text-sm">No documents found.</p>
                </div>
            ) : view === "grid" ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredDocs.map((doc) => (
                        <DocumentCard
                            key={doc.id}
                            name={doc.name}
                            size={doc.size}
                            date={doc.date}
                            favorite={doc.favorite}
                            onToggleFavorite={() => toggleFavorite(doc.id)}
                            onDelete={() => deleteDoc(doc.id)}
                            onRename={() => renameDoc(doc.id)}
                        />
                    ))}
                </div>
            ) : (
                <div className="bg-card border border-card rounded-2xl p-2">
                    {filteredDocs.map((doc) => (
                        <DocumentRow
                            key={doc.id}
                            name={doc.name}
                            size={doc.size}
                            date={doc.date}
                            favorite={doc.favorite}
                            onToggleFavorite={() => toggleFavorite(doc.id)}
                            onDelete={() => deleteDoc(doc.id)}
                            onRename={() => renameDoc(doc.id)}
                        />
                    ))}
                </div>
            )}

            {showUpload && (
                <UploadModal
                    onClose={() => setShowUpload(false)}
                    onUploadComplete={addUploadedDocs}
                />
            )}
        </div>
    );
}