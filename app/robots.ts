import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            // Signed-in areas and auth flows hold nothing a crawler should index,
            // and /api only ever returns files or JSON.
            disallow: [
                "/api/",
                "/dashboard",
                "/documents",
                "/chats",
                "/settings",
                "/login",
                "/register",
                "/forget-password",
                "/reset-password",
                "/verify-otp",
            ],
        },
        sitemap: `${siteUrl}/sitemap.xml`,
    };
}
