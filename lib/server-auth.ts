import "server-only";
import type { NextRequest } from "next/server";
import { getAdminAuth, isAdminConfigured, SESSION_COOKIE } from "@/lib/firebase/admin";

/**
 * Who is making this request?
 *
 * Reads the same session cookie proxy.ts uses to guard pages and verifies
 * it with the Admin SDK, so API routes can identify the user without
 * trusting anything the browser claims about itself. Returns null for
 * signed-out visitors and for expired or forged cookies — the caller
 * decides whether that means "refuse" (AI tools) or "continue" (open
 * tools).
 */
export async function getRequestUid(req: NextRequest): Promise<string | null> {
    if (!isAdminConfigured()) return null;

    const session = req.cookies.get(SESSION_COOKIE)?.value;
    if (!session) return null;

    try {
        const decoded = await getAdminAuth().verifySessionCookie(session, true);
        return decoded.uid;
    } catch {
        // Expired, revoked or invalid — treat exactly like signed out.
        return null;
    }
}