"use client";

/**
 * Claim one operation from today's allowance before doing work in the browser.
 *
 * The tools that convert in the page never touched a metered route, so they
 * ran without limit while every other tool stopped at the plan's ceiling. They
 * call this first and stop if it refuses.
 *
 * Returns the server's own message on refusal — "Please sign in to use the
 * tools." or the daily-limit wording with the real counts — so these tools say
 * exactly what the metered ones say rather than inventing their own phrasing.
 */
export async function claimOperation(): Promise<{ ok: true } | { ok: false; message: string }> {
    let res: Response;
    try {
        res = await fetch("/api/usage", { method: "POST" });
    } catch {
        // Offline or the request never landed. Refusing here would break a
        // tool that runs perfectly well in the browser, so the work proceeds
        // and the operation goes uncounted — the same outcome as before this
        // check existed, and better than a working tool that will not run.
        return { ok: true };
    }

    if (res.ok) return { ok: true };

    const body = await res.json().catch(() => null);
    return {
        ok: false,
        message:
            body?.message ??
            body?.error ??
            "Could not check your daily allowance. Please try again.",
    };
}
