import type { MetadataRoute } from "next";
import { tools } from "@/lib/tools";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/** Marketing and informational pages, highest priority first. */
const staticPaths: Array<{ path: string; priority: number }> = [
    { path: "/", priority: 1 },
    { path: "/tools", priority: 0.9 },
    { path: "/pricing", priority: 0.8 },
    { path: "/about", priority: 0.6 },
    { path: "/blog", priority: 0.6 },
    { path: "/contact", priority: 0.5 },
    { path: "/security", priority: 0.4 },
    { path: "/privacy", priority: 0.3 },
    { path: "/terms", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
    const lastModified = new Date();

    return [
        ...staticPaths.map(({ path, priority }) => ({
            url: `${siteUrl}${path}`,
            lastModified,
            changeFrequency: "monthly" as const,
            priority,
        })),
        // Every tool that has a page. Anything still marked coming soon has no
        // route to point a crawler at.
        ...tools
            .filter((tool) => !tool.comingSoon)
            .map((tool) => ({
                url: `${siteUrl}${tool.href}`,
                lastModified,
                changeFrequency: "monthly" as const,
                priority: 0.8,
            })),
    ];
}
