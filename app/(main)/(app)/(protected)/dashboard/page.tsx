"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
    FileText,
    MessageSquare,
    HardDrive,
    Star,
    Upload,
    Wrench,
    Cpu,
    MoreVertical,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { useAuth } from "@/hooks/useAuth";
import { useLibrary } from "@/lib/store";
import { formatRelativeTime } from "@/lib/utils";

const quickActions = [
    { label: "Upload PDF", icon: Upload, href: "/documents" },
    { label: "Tools", icon: Wrench, href: "/tools" },
    { label: "New Chat", icon: MessageSquare, href: "/chats" },
    { label: "AI Tools", icon: Cpu, href: "/tools?category=AI%20Tools" },
];

const STORAGE_QUOTA_GB = 10;

export default function DashboardPage() {
    // Route protection and the loading gate live in the (app) layout.
    const { user, profile } = useAuth();
    const documents = useLibrary((s) => s.documents);
    const chats = useLibrary((s) => s.chats);

    const { storageUsedGb, storagePercent, favouriteCount, recentDocs, recentChats } = useMemo(() => {
        const usedGb = documents.reduce((total, doc) => total + doc.sizeMb, 0) / 1024;

        return {
            storageUsedGb: usedGb,
            storagePercent: Math.min((usedGb / STORAGE_QUOTA_GB) * 100, 100),
            favouriteCount: documents.filter((d) => d.favorite).length,
            recentDocs: [...documents].sort((a, b) => b.timestamp - a.timestamp).slice(0, 3),
            recentChats: [...chats].sort((a, b) => b.timestamp - a.timestamp).slice(0, 2),
        };
    }, [documents, chats]);

    const displayName =
        profile?.fullName || user?.displayName || user?.email?.split("@")[0] || "there";
    const planLabel = profile?.plan === "paid" ? "Paid Plan" : "Free Plan";

    return (
        <div>
            <div className="mb-8 animate-tool-in">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                        <h1 className="text-2xl font-bold text-fg">Welcome back, {displayName} 👋</h1>
                        <p className="text-muted text-sm mt-1">Here&apos;s what&apos;s happening with your documents.</p>
                    </div>
                    <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-red-50 text-[var(--primary)] shrink-0">
                        {planLabel}
                    </span>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard label="Total Documents" value={String(documents.length)} icon={FileText} />
                <StatCard label="Total Chats" value={String(chats.length)} icon={MessageSquare} />
                <StatCard label="Storage Used" value={`${storageUsedGb.toFixed(2)} GB`} icon={HardDrive} />
                <StatCard label="Favorites" value={String(favouriteCount)} icon={Star} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent PDFs */}
                <div className="lg:col-span-2 bg-card border border-card rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-fg">Recent Documents</h2>
                        <Link href="/documents" className="text-sm text-[var(--primary)] font-medium hover:underline">
                            View all
                        </Link>
                    </div>
                    {recentDocs.length === 0 ? (
                        <p className="text-sm text-muted py-6 text-center">
                            No documents yet — upload your first PDF to get started.
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {recentDocs.map((pdf) => (
                                <div
                                    key={pdf.id}
                                    className="flex items-center justify-between p-3 rounded-xl hover:bg-[var(--background-secondary)] transition-colors"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                                            <FileText size={18} className="text-[var(--primary)]" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-fg truncate">{pdf.name}</p>
                                            <p className="text-xs text-muted">
                                                {pdf.size} · {formatRelativeTime(pdf.timestamp)}
                                            </p>
                                        </div>
                                    </div>
                                    <Link
                                        href="/documents"
                                        className="text-muted hover:text-fg p-1"
                                        aria-label={`Manage ${pdf.name}`}
                                    >
                                        <MoreVertical size={16} />
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right column */}
                <div className="space-y-6">
                    {/* Storage Usage */}
                    <div className="bg-card border border-card rounded-2xl p-6">
                        <h2 className="text-lg font-semibold text-fg mb-4">Storage Usage</h2>
                        <div className="w-full h-2 rounded-full bg-[var(--background-secondary)] overflow-hidden mb-2">
                            <div
                                className="h-full rounded-full bg-[var(--primary)] transition-all"
                                style={{ width: `${storagePercent}%` }}
                            />
                        </div>
                        <p className="text-sm text-muted">
                            {storageUsedGb.toFixed(2)} GB of {STORAGE_QUOTA_GB} GB used
                        </p>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-card border border-card rounded-2xl p-6">
                        <h2 className="text-lg font-semibold text-fg mb-4">Quick Actions</h2>
                        <div className="space-y-2">
                            {quickActions.map((action) => {
                                const Icon = action.icon;

                                return (
                                    <Link
                                        key={action.label}
                                        href={action.href}
                                        className="flex items-center gap-3 p-3 rounded-xl border border-card hover:border-[var(--primary)] transition-colors"
                                    >
                                        <Icon size={16} className="text-[var(--primary)]" />
                                        <span className="text-sm font-medium text-fg">{action.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Chats */}
            <div className="mt-6 bg-card border border-card rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-fg">Recent Chats</h2>
                    <Link href="/chats" className="text-sm text-[var(--primary)] font-medium hover:underline">
                        View all
                    </Link>
                </div>
                {recentChats.length === 0 ? (
                    <p className="text-sm text-muted py-6 text-center">
                        No chats yet — start one from any of your documents.
                    </p>
                ) : (
                    <div className="space-y-2">
                        {recentChats.map((chat) => (
                            <Link
                                key={chat.id}
                                href={`/chats/${chat.id}`}
                                className="flex items-center justify-between p-3 rounded-xl hover:bg-[var(--background-secondary)] transition-colors"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center shrink-0">
                                        <MessageSquare size={18} className="text-[var(--primary)]" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-fg truncate">{chat.title}</p>
                                        <p className="text-xs text-muted truncate">{chat.pdfName}</p>
                                    </div>
                                </div>
                                <span className="text-xs text-muted shrink-0 ml-3">
                                    {formatRelativeTime(chat.timestamp)}
                                </span>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
