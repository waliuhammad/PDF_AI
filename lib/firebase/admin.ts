import { cert, getApp, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";

/**
 * The server half of Firebase, used to verify session cookies.
 *
 * The credentials come from three environment variables rather than a JSON file
 * in the repo. A service account key is a full admin credential — it can read
 * and write every document and mint a token for any user — so it must never be
 * committed, and .gitignore covers .env* for that reason.
 *
 * Set up lazily so a build with no credentials still succeeds; the failure
 * surfaces when something actually asks for auth, with a message saying which
 * variable is missing.
 */

let app: App | null = null;

function credentials() {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    // Railway and Vercel store the key with literal \n, so turn those back into
    // real newlines or the PEM parser rejects it.
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    const missing = [
        !projectId && "FIREBASE_PROJECT_ID",
        !clientEmail && "FIREBASE_CLIENT_EMAIL",
        !privateKey && "FIREBASE_PRIVATE_KEY",
    ].filter(Boolean);

    if (missing.length) {
        throw new Error(`Firebase Admin is not configured: ${missing.join(", ")} missing.`);
    }

    return { projectId: projectId!, clientEmail: clientEmail!, privateKey: privateKey! };
}

export function getAdminApp(): App {
    if (app) return app;
    app = getApps().length ? getApp() : initializeApp({ credential: cert(credentials()) });
    return app;
}

export function getAdminAuth(): Auth {
    return getAuth(getAdminApp());
}

/** True when the credentials are present, so callers can degrade rather than throw. */
export function isAdminConfigured(): boolean {
    return Boolean(
        process.env.FIREBASE_PROJECT_ID &&
            process.env.FIREBASE_CLIENT_EMAIL &&
            process.env.FIREBASE_PRIVATE_KEY
    );
}

export const SESSION_COOKIE = "pdfai_session";

/** Firebase caps session cookies at 14 days. */
export const SESSION_MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;
