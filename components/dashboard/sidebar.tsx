"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
import { logout } from "@/lib/firebase/auth";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "My Documents", href: "/documents", icon: FileText },
    { label: "Chats", href: "/chats", icon: MessageSquare },
    { label: "Tools", href: "/tools", icon: Wrench },
    { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user: firebaseUser, profile } = useAuth();
    const [open, setOpen] = useState(false); // Mobile drawer state
    const [collapsed, setCollapsed] = useState(false); // Desktop sidebar collapse state
    const [loggingOut, setLoggingOut] = useState(false);

    const handleLogout = async () => {
        setLoggingOut(true);
        try {
            await logout();
            router.push("/login");
        } finally {
            setLoggingOut(false);
        }
    };

    const displayName = profile?.fullName || firebaseUser?.displayName || firebaseUser?.email?.split("@")[0] || "Guest";
    const displayEmail = firebaseUser?.email || "";
    const initial = displayName.charAt(0).toUpperCase();

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
            {firebaseUser && (
                <div
                    className={`flex items-center gap-2.5 px-2 py-2 mb-2 rounded-xl bg-[var(--background-secondary)] border border-card ${collapsed && !isMobile ? "justify-center px-0" : ""
                        }`}
                >
                    <div className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-sm font-semibold shrink-0">
                        {initial}
                    </div>
                    {(!collapsed || isMobile) && (
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-fg truncate">{displayName}</p>
                            <p className="text-xs text-muted truncate">{displayEmail}</p>
                        </div>
                    )}
                </div>
            )}

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

            <button
                onClick={handleLogout}
                disabled={loggingOut}
                title={collapsed && !isMobile ? "Log out" : undefined}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-base font-medium text-fg hover:bg-[var(--background-secondary)] hover:text-fg transition-all disabled:opacity-60 ${collapsed && !isMobile ? "justify-center px-2" : ""
                    }`}
            >
                <LogOut size={18} className="shrink-0" />
                {(!collapsed || isMobile) && <span>{loggingOut ? "Logging out..." : "Log out"}</span>}
            </button>
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