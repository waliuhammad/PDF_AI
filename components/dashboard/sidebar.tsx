"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
    LayoutDashboard,
    FileText,
    MessageSquare,
    Settings,
    LogOut,
    Sparkles,
    Menu,
    X,
} from "lucide-react";

const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "My Documents", href: "/documents", icon: FileText },
    { label: "Chats", href: "/chats", icon: MessageSquare },
    { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    const content = (
        <>
            <Link href="/" className="text-lg font-bold text-fg px-2 mb-8" onClick={() => setOpen(false)}>
                PDF<span className="text-[var(--primary)]">AI</span>
            </Link>

            <nav className="flex-1 space-y-1">
                {navItems.map((item) => {
                    const active = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${active
                                ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                                : "text-muted hover:bg-[var(--background-secondary)] hover:text-fg"
                                }`}
                        >
                            <item.icon size={18} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="rounded-xl bg-[var(--background-secondary)] p-4 mb-4">
                <div className="flex items-center gap-2 mb-1">
                    <Sparkles size={16} className="text-[var(--primary)]" />
                    <span className="text-sm font-semibold text-fg">Upgrade to Pro</span>
                </div>
                <p className="text-xs text-muted mb-3">Unlock unlimited chats, multi-PDF, and more.</p>
                <Link
                    href="/pricing"
                    onClick={() => setOpen(false)}
                    className="block text-center text-xs font-medium py-2 rounded-lg bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] transition-colors"
                >
                    Upgrade Now
                </Link>
            </div>

            <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted hover:bg-[var(--background-secondary)] hover:text-fg transition-colors">
                <LogOut size={18} />
                Log out
            </button>
        </>
    );

    return (
        <>
            {/* Mobile top bar with hamburger */}
            <div className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 border-b border-card bg-white">
                <Link href="/" className="text-lg font-bold text-fg">
                    PDF<span className="text-[var(--primary)]">AI</span>
                </Link>
                <button onClick={() => setOpen(true)} className="text-fg p-1" aria-label="Open menu">
                    <Menu size={22} />
                </button>
            </div>

            {/* Desktop sidebar */}
            <aside className="hidden md:flex w-64 h-screen sticky top-0 flex-col border-r border-card bg-white px-4 py-6 shrink-0">
                {content}
            </aside>

            {/* Mobile drawer */}
            {open && (
                <div className="md:hidden fixed inset-0 z-50 flex">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
                    <aside className="relative w-72 max-w-[80%] h-full bg-white px-4 py-6 flex flex-col shadow-xl">
                        <button
                            onClick={() => setOpen(false)}
                            className="absolute top-4 right-4 text-muted hover:text-fg"
                            aria-label="Close menu"
                        >
                            <X size={20} />
                        </button>
                        {content}
                    </aside>
                </div>
            )}
        </>
    );
}
