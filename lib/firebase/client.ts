import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Avoid re-initializing on hot reload
export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(firebaseApp);

/**
 * Firestore, fetched on first use.
 *
 * Importing it here meant every page that touched anything under lib/firebase
 * shipped the Firestore SDK — including the password-reset pages, which only
 * ever send an email. Two functions in the whole app write to Firestore; they
 * can wait a moment for it to arrive.
 */
let firestore: Promise<import("firebase/firestore").Firestore> | null = null;

export function getDb() {
    if (!firestore) {
        firestore = import("firebase/firestore").then((m) => m.getFirestore(firebaseApp));
    }
    return firestore;
}