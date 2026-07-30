"use client";

import { useState } from "react";
import { SettingsTabs, SettingsTab } from "@/components/settings/settings-tabs";
import { Sun, Moon, Monitor } from "lucide-react";

export default function SettingsPage() {
    const [tab, setTab] = useState<SettingsTab>("profile");
    const [name, setName] = useState("John Doe");
    const [email, setEmail] = useState("john@example.com");
    const [theme, setTheme] = useState<"light" | "dark" | "system">("light");
    const [language, setLanguage] = useState("en");
    const [notifications, setNotifications] = useState({ email: true, product: true, marketing: false });

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-fg">Settings</h1>
                <p className="text-muted text-sm mt-1">Manage your account and preferences.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                <SettingsTabs active={tab} onChange={setTab} />

                <div className="flex-1 bg-white border border-card rounded-2xl p-6">
                    {tab === "profile" && (
                        <div className="space-y-4 max-w-md">
                            <h2 className="text-lg font-semibold text-fg mb-4">Profile</h2>
                            <div>
                                <label className="block text-sm font-medium text-fg mb-1.5">Full name</label>
                                <input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-card text-fg focus:outline-none focus:border-[var(--primary)] transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-fg mb-1.5">Email</label>
                                <input
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-card text-fg focus:outline-none focus:border-[var(--primary)] transition-colors"
                                />
                            </div>
                            <button className="px-5 py-2.5 rounded-full bg-[var(--primary)] text-white text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors">
                                Save Changes
                            </button>
                        </div>
                    )}

                    {tab === "theme" && (
                        <div className="max-w-md">
                            <h2 className="text-lg font-semibold text-fg mb-4">Theme</h2>
                            <div className="grid grid-cols-3 gap-2 sm:gap-3">
                                {[
                                    { id: "light", label: "Light", icon: Sun },
                                    { id: "dark", label: "Dark", icon: Moon },
                                    { id: "system", label: "System", icon: Monitor },
                                ].map((opt) => (
                                    <button
                                        key={opt.id}
                                        onClick={() => setTheme(opt.id as "light" | "dark" | "system")}
                                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-colors ${theme === opt.id ? "border-[var(--primary)] bg-[var(--primary)]/5" : "border-card"
                                            }`}
                                    >
                                        <opt.icon size={20} className={theme === opt.id ? "text-[var(--primary)]" : "text-muted"} />
                                        <span className="text-sm text-fg">{opt.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {tab === "notifications" && (
                        <div className="max-w-md space-y-4">
                            <h2 className="text-lg font-semibold text-fg mb-4">Notifications</h2>
                            {[
                                { key: "email", label: "Email notifications", desc: "Receive updates about your chats and documents" },
                                { key: "product", label: "Product updates", desc: "New features and improvements" },
                                { key: "marketing", label: "Marketing emails", desc: "Tips, offers, and promotions" },
                            ].map((item) => (
                                <div key={item.key} className="flex items-center justify-between py-2">
                                    <div>
                                        <p className="text-sm font-medium text-fg">{item.label}</p>
                                        <p className="text-xs text-muted">{item.desc}</p>
                                    </div>
                                    <button
                                        onClick={() =>
                                            setNotifications((prev) => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))
                                        }
                                        className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${notifications[item.key as keyof typeof notifications] ? "bg-[var(--primary)]" : "bg-[var(--card-border)]"
                                            }`}
                                    >
                                        <span
                                            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${notifications[item.key as keyof typeof notifications] ? "translate-x-5" : "translate-x-0"
                                                }`}
                                        />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {tab === "password" && (
                        <div className="space-y-4 max-w-md">
                            <h2 className="text-lg font-semibold text-fg mb-4">Change Password</h2>
                            <div>
                                <label className="block text-sm font-medium text-fg mb-1.5">Current password</label>
                                <input type="password" className="w-full px-4 py-2.5 rounded-xl border border-card text-fg focus:outline-none focus:border-[var(--primary)] transition-colors" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-fg mb-1.5">New password</label>
                                <input type="password" className="w-full px-4 py-2.5 rounded-xl border border-card text-fg focus:outline-none focus:border-[var(--primary)] transition-colors" />
                            </div>
                            <button className="px-5 py-2.5 rounded-full bg-[var(--primary)] text-white text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors">
                                Update Password
                            </button>
                        </div>
                    )}

                    {tab === "language" && (
                        <div className="max-w-md">
                            <h2 className="text-lg font-semibold text-fg mb-4">Language</h2>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-card text-fg focus:outline-none focus:border-[var(--primary)] transition-colors"
                            >
                                <option value="en">English</option>
                                <option value="ur">Urdu</option>
                                <option value="es">Spanish</option>
                                <option value="fr">French</option>
                            </select>
                        </div>
                    )}
                    {tab === "billing" && (
                        <div className="max-w-md">
                            <h2 className="text-lg font-semibold text-fg mb-4">Subscription & Billing</h2>
                            <div className="p-4 rounded-xl border border-card mb-4">
                                <p className="text-sm text-muted">Current plan</p>
                                <p className="text-lg font-semibold text-fg">Free</p>
                            </div>
                            <a
                                href="/pricing"
                                className="inline-block px-5 py-2.5 rounded-full bg-[var(--primary)] text-white text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors"
                            >
                                Upgrade Plan
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}