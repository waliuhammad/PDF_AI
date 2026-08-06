"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
    LayoutDashboard,
    FileText,
    MessageSquare,
    Wrench,
    Settings,
    LogOut,
    Sparkles,
    Menu,
    X,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

// Both come from the same module, so Firebase is fetched once, after hydration,
// and never blocks the first load of a tool page.
const SidebarUser = dynamic(
    () => import("./sidebar-account").then((m) => m.SidebarUser),
    { ssr: false }
);

const SidebarLogout = dynamic(
    () => import("./sidebar-account").then((m) => m.SidebarLogout),
    {
        ssr: false,
        // Hold the button's space so the sidebar does not shift when it arrives.
        loading: () => (
            <div className="flex items-center gap-2.5 px-3 py-2 text-base font-medium text-fg opacity-60">
                <LogOut size={18} className="shrink-0" />
            </div>
        ),
    }
);

const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "My Documents", href: "/documents", icon: FileText },
    { label: "Chats", href: "/chats", icon: MessageSquare },
    { label: "Tools", href: "/tools", icon: Wrench },
    { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false); // Mobile drawer state
    const [collapsed, setCollapsed] = useState(false); // Desktop sidebar collapse state

    const content = (isMobile = false) => (
        <>
            <div className={`flex items-center justify-between px-2 mb-3 ${collapsed && !isMobile ? "px-0 justify-center" : ""}`}>
                {(!collapsed || isMobile) && (
                    <Link href="/" className="text-xl font-bold text-fg truncate" onClick={() => isMobile && setOpen(false)}>
                        PDF<span className="text-fg">AI</span>
                    </Link>
                )}
                {!isMobile && (
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="p-1 rounded-lg text-fg hover:bg-[var(--background-secondary)] hover:text-fg transition-colors"
                        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    </button>
                )}
            </div>

            {/* User info */}
            <SidebarUser compact={collapsed && !isMobile} />

            <nav className="flex-1 space-y-2 overflow-hidden">
                <div className="space-y-1">
                    {navItems.map((item) => {
                        const active = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => isMobile && setOpen(false)}
                                title={collapsed && !isMobile ? item.label : undefined}
                                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-base font-medium transition-all ${active
                                    ? "bg-[var(--primary)] text-white shadow-md"
                                    : "text-fg hover:bg-[var(--background-secondary)] hover:text-fg"
                                    } ${collapsed && !isMobile ? "justify-center px-2" : ""}`}
                            >
                                <item.icon size={18} className="shrink-0" />
                                {(!collapsed || isMobile) && <span className="truncate">{item.label}</span>}
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {(!collapsed || isMobile) && (
                <div className="rounded-xl bg-[var(--background-secondary)] p-2.5 my-2 border border-card">
                    <div className="flex items-center gap-1.5 mb-0.5">
                        <Sparkles size={15} className="text-fg shrink-0" />
                        <span className="text-sm font-semibold text-fg">Upgrade to Pro</span>
                    </div>
                    <p className="text-xs text-muted mb-2">Unlock unlimited chats & more.</p>
                    <Link
                        href="/pricing"
                        onClick={() => isMobile && setOpen(false)}
                        className="block text-center text-xs font-medium py-1.5 rounded-lg bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] transition-colors shadow-sm"
                    >
                        Upgrade Now
                    </Link>
                </div>
            )}

            <SidebarLogout compact={collapsed && !isMobile} />
        </>
    );

    return (
        <>
            <div className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 border-b border-card bg-card">
                <Link href="/" className="text-xl font-bold text-fg">
                    PDF<span>AI</span>
                </Link>
                <button onClick={() => setOpen(true)} className="text-fg p-1" aria-label="Open menu">
                    <Menu size={22} />
                </button>
            </div>

            <aside
                className={`hidden md:flex h-screen sticky top-0 flex-col border-r border-card bg-card py-3 shrink-0 transition-all duration-300 shadow-sm overflow-hidden ${collapsed ? "w-20 px-3" : "w-64 px-3.5"
                    }`}
            >
                {content(false)}
            </aside>

            {open && (
                <div className="md:hidden fixed inset-0 z-50 flex">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setOpen(false)} />
                    <aside className="relative w-72 max-w-[80%] h-full bg-card px-3.5 py-3 flex flex-col shadow-2xl border-r border-card overflow-hidden">
                        <button
                            onClick={() => setOpen(false)}
                            className="absolute top-3 right-3 text-fg"
                            aria-label="Close menu"
                        >
                            <X size={20} />
                        </button>
                        {content(true)}
                    </aside>
                </div>
            )}
        </>
    );
}