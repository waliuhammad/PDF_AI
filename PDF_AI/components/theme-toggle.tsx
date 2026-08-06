"use client";

import * as React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle({ className = "" }: { className?: string }) {
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => setMounted(true), []);

    if (!mounted) {
        // Reserve the space so nothing shifts once we know the real theme
        return <div className={`size-8 ${className}`} />;
    }

    const isDark = resolvedTheme === "dark";

    return (
        <button
            type="button"
            aria-label="Toggle theme"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={`relative flex size-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-muted hover:text-foreground ${className}`}
        >
            <Sun className="size-4 scale-100 dark:scale-0 transition-transform" />
            <Moon className="absolute size-4 scale-0 dark:scale-100 transition-transform" />
        </button>
    );
}
