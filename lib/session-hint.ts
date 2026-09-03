/**
 * A readable flag set beside the httpOnly session cookie, holding only "1".
 *
 * The marketing pages are prerendered. Asking the server who is visiting would
 * make them dynamic and cost them their cache, so the only other way to tell a
 * signed-in visitor from a signed-out one was Firebase Auth in the browser —
 * which put the whole SDK, around 290KB, on every public page to decide the
 * wording of one button.
 *
 * This carries no identity and grants nothing. Forging it changes a link's
 * label; the page it points at still verifies the real session cookie, which
 * stays httpOnly. It is a hint about what to draw, never a credential.
 *
 * Deliberately its own module rather than living beside SESSION_COOKIE in
 * firebase/admin.ts: that file imports firebase-admin, so a client component
 * reading the name from there would drag the Admin SDK into the browser bundle
 * — the exact problem this exists to solve.
 */
export const SESSION_HINT_COOKIE = "pdfai_signed_in";

/** Whether the browser is carrying the hint. False during server rendering. */
export function hasSessionHint(): boolean {
    if (typeof document === "undefined") return false;

    return document.cookie
        .split("; ")
        .some((entry) => entry === `${SESSION_HINT_COOKIE}=1`);
}
