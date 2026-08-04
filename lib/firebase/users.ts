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
 * Updates the display name on both the Firebase Auth record (so it survives a
 * Firestore outage) and the user document.
 */
export async function updateUserProfile(user: User, fullName: string) {
    await updateProfile(user, { displayName: fullName });
    await setDoc(doc(db, "users", user.uid), { fullName }, { merge: true });
}