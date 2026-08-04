import { doc, getDoc, setDoc } from "firebase/firestore";
import { updateProfile, type User } from "firebase/auth";
import { db } from "./client";

export interface UserProfile {
    fullName: string;
    email: string;
    phone: string | null;
    plan: "free" | "paid";
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
        const snap = await getDoc(doc(db, "users", uid));
        if (!snap.exists()) return null;
        return snap.data() as UserProfile;
    } catch (err) {
        // Firestore not available yet (e.g. billing not enabled) — caller falls back gracefully.
        console.warn("Could not fetch user profile from Firestore:", err);
        return null;
    }
}

/**
 * Updates the display name on the Firebase Auth record first — that is what the
 * sidebar and dashboard actually read — then mirrors it to the user document.
 *
 * The Firestore write is best-effort, matching how getUserProfile already
 * tolerates Firestore being unavailable or locked down by security rules.
 * Reporting the whole save as failed would be wrong, since the name has in fact
 * changed, so the caller is told whether the mirror succeeded instead.
 */
export async function updateUserProfile(
    user: User,
    fullName: string
): Promise<{ syncedToDatabase: boolean }> {
    await updateProfile(user, { displayName: fullName });

    try {
        await setDoc(doc(db, "users", user.uid), { fullName }, { merge: true });
        return { syncedToDatabase: true };
    } catch (err) {
        console.warn("Could not mirror the profile to Firestore:", err);
        return { syncedToDatabase: false };
    }
}