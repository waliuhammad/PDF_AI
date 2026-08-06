"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, type User } from "firebase/auth";
import { motion } from "framer-motion";
import {
    FileText,
    MessageSquare,
    HardDrive,
    Clock,
    Upload,
    Wrench,
    Cpu,
    MoreVertical,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { auth } from "@/lib/firebase/client";
import { getUserProfile, type UserProfile } from "@/lib/firebase/users";

const recentPdfs = [
    { name: "Research Paper - Neural Networks.pdf", size: "2.4 MB", date: "2 hours ago" },
    { name: "Company Financial Report Q3.pdf", size: "5.1 MB", date: "Yesterday" },
    { name: "Contract Agreement Draft.pdf", size: "890 KB", date: "3 days ago" },
];

const recentChats = [
    { title: "Summarize key findings", pdf: "Research Paper - Neural Networks.pdf", date: "2h ago" },
    { title: "What's the revenue growth?", pdf: "Company Financial Report Q3.pdf", date: "1d ago" },
];

const quickActions = [
    { label: "Upload PDF", icon: Upload, href: "/documents" },
    { label: "Tools", icon: Wrench, href: "/tools" },
    { label: "New Chat", icon: MessageSquare, href: "/chats" },
    { label: "AI Tools", icon: Cpu, href: "/ai-tools" },
];

export default function DashboardPage() {
    const router = useRouter();
    const [authChecked, setAuthChecked] = useState(false);
    const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);

    const storageUsed = 3.2; // GB — mock until real usage tracking is wired up
    const storageTotal = 10; // GB
    const storagePercent = (storageUsed / storageTotal) * 100;

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                router.push("/login");
                return;
            }
            setFirebaseUser(user);
            const fetchedProfile = await getUserProfile(user.uid);
            setProfile(fetchedProfile);
            setAuthChecked(true);
        });
        return () => unsubscribe();
    }, [router]);

    if (!authChecked) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-sm text-muted">Loading your dashboard...</p>
            </div>
        );
    }

    const displayName = profile?.fullName || firebaseUser?.displayName || firebaseUser?.email?.split("@")[0] || "there";
    const planLabel = profile?.plan === "paid" ? "Paid Plan" : "Free Plan";

    return (
        <div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                        <h1 className="text-2xl font-bold text-fg">Welcome back, {displayName} 👋</h1>
                        <p className="text-muted text-sm mt-1">Here's what's happening with your documents.</p>
                    </div>
                    <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-red-50 text-[var(--primary)] shrink-0">
                        {planLabel}
                    </span>
                </div>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard label="Total Documents" value="24" icon={FileText} trend="+3 this week" />
                <StatCard label="Total Chats" value="58" icon={MessageSquare} trend="+12 this week" />
                <StatCard label="Storage Used" value="3.2 GB" icon={HardDrive} />
                <StatCard label="Hours Saved" value="41h" icon={Clock} trend="+6h this week" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent PDFs */}
                <div className="lg:col-span-2 bg-card border border-card rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-fg">Recent Documents</h2>
                        <a href="/documents" className="text-sm text-[var(--primary)] font-medium hover:underline">
                            View all
                        </a>
                    </div>
                    <div className="space-y-2">
                        {recentPdfs.map((pdf) => (
                            <div
                                key={pdf.name}
                                className="flex items-center justify-between p-3 rounded-xl hover:bg-[var(--background-secondary)] transition-colors"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                                        <FileText size={18} className="text-[var(--primary)]" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-fg truncate">{pdf.name}</p>
                                        <p className="text-xs text-muted">{pdf.size} · {pdf.date}</p>
                                    </div>
                                </div>
                                <button className="text-muted hover:text-fg p-1">
                                    <MoreVertical size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right column */}
                <div className="space-y-6">
                    {/* Storage Usage */}
                    <div className="bg-card border border-card rounded-2xl p-6">
                        <h2 className="text-lg font-semibold text-fg mb-4">Storage Usage</h2>
                        <div className="w-full h-2 rounded-full bg-[var(--background-secondary)] overflow-hidden mb-2">
                            <div
                                className="h-full rounded-full bg-[var(--primary)]"
                                style={{ width: `${storagePercent}%` }}
                            />
                        </div>
                        <p className="text-sm text-muted">
                            {storageUsed} GB of {storageTotal} GB used
                        </p>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-card border border-card rounded-2xl p-6">
                        <h2 className="text-lg font-semibold text-fg mb-4">Quick Actions</h2>
                        <div className="space-y-2">
                            {quickActions.map((action) => {
                                const Icon = action.icon;

                                return (
                                    <a
                                        key={action.label}
                                        href={action.href}
                                        className="flex items-center gap-3 p-3 rounded-xl border border-card hover:border-[var(--primary)] transition-colors"
                                    >
                                        <Icon size={16} className="text-[var(--primary)]" />
                                        <span className="text-sm font-medium text-fg">{action.label}</span>
                                    </a>
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
                    <a href="/chats" className="text-sm text-[var(--primary)] font-medium hover:underline">
                        View all
                    </a>
                </div>
                <div className="space-y-2">
                    {recentChats.map((chat) => (
                        <div
                            key={chat.title}
                            className="flex items-center justify-between p-3 rounded-xl hover:bg-[var(--background-secondary)] transition-colors"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center shrink-0">
                                    <MessageSquare size={18} className="text-[var(--primary)]" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-fg truncate">{chat.title}</p>
                                    <p className="text-xs text-muted truncate">{chat.pdf}</p>
                                </div>
                            </div>
                            <span className="text-xs text-muted shrink-0 ml-3">{chat.date}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div >
    );
}