"use client";

import { User, Palette, Bell, Lock, Globe, CreditCard } from "lucide-react";

export type SettingsTab = "profile" | "theme" | "notifications" | "password" | "language" | "billing";

const tabs: { id: SettingsTab; label: string; icon: typeof User }[] = [
    { id: "profile", label: "Profile", icon: User },
    { id: "theme", label: "Theme", icon: Palette },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "password", label: "Password", icon: Lock },
    { id: "language", label: "Language", icon: Globe },
    { id: "billing", label: "Subscription & Billing", icon: CreditCard },
];

export function SettingsTabs({ active, onChange }: { active: SettingsTab; onChange: (tab: SettingsTab) => void }) {
    return (
        <div className="w-full md:w-56 shrink-0 space-y-1">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onChange(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${active === tab.id
                        ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                        : "text-muted hover:bg-[var(--background-secondary)] hover:text-fg"
                        }`}
                >
                    <tab.icon size={17} />
                    {tab.label}
                </button>
            ))}
        </div>
    );
}