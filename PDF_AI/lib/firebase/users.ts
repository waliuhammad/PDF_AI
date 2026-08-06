import { doc, getDoc } from "firebase/firestore";
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