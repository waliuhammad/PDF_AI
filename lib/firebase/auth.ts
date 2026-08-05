import {
    createUserWithEmailAndPassword,
    updateProfile,
    sendEmailVerification,
    signInWithPopup,
    GoogleAuthProvider,
    FacebookAuthProvider,
    GithubAuthProvider,
    TwitterAuthProvider,
    OAuthProvider,
    type AuthProvider,
    type User,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./client";

export interface RegisterInput {
    fullName: string;
    email: string;
    password: string;
    phoneDialCode: string;
    phoneNumber: string;
}

/**
 * Best-effort: the account already exists in Firebase Auth by the time this
 * runs, so a Firestore failure (rules, quota, offline) must not surface as a
 * failed sign-in. Matches how getUserProfile already tolerates Firestore.
 */
async function createUserDocIfNotExists(user: User, extra?: Record<string, unknown>) {
    try {
        const userRef = doc(db, "users", user.uid);
        const existing = await getDoc(userRef);
        if (!existing.exists()) {
            await setDoc(userRef, {
                fullName: user.displayName ?? extra?.fullName ?? "",
                email: user.email,
                phone: extra?.phone ?? null,
                plan: "free",
                createdAt: serverTimestamp(),
            });
        }
    } catch (err) {
        console.warn("Could not create the user document in Firestore:", err);
    }
}

export async function registerWithEmail(input: RegisterInput) {
    const credential = await createUserWithEmailAndPassword(auth, input.email, input.password);
    await updateProfile(credential.user, { displayName: input.fullName });
    await createUserDocIfNotExists(credential.user, {
        fullName: input.fullName,
        phone: `${input.phoneDialCode}${input.phoneNumber}`,
    });

    // Best-effort: the account exists either way, and a failed send is
    // recoverable from the verification screen's resend button.
    await sendVerificationEmail().catch((err) =>
        console.warn("Could not send the verification email:", err)
    );

    return credential.user;
}

/**
 * Sends Firebase's verification email to the signed-in user.
 *
 * Firebase verifies by emailed link, not by a numeric code — there is no
 * built-in one-time-password flow for email. Supporting a 6-digit code would
 * mean generating and storing codes and running our own mail delivery.
 */
export async function sendVerificationEmail() {
    const user = auth.currentUser;
    if (!user) throw new Error("You need to be signed in to verify your email.");
    if (user.emailVerified) return;

    await sendEmailVerification(user, {
        url: `${window.location.origin}/dashboard`, // where the link lands afterwards
    });
}

/** Re-reads the account so a verification completed elsewhere is picked up. */
export async function refreshEmailVerified() {
    const user = auth.currentUser;
    if (!user) return false;

    await user.reload();
    return auth.currentUser?.emailVerified ?? false;
}

export type SocialProviderId = "google" | "facebook" | "github" | "twitter" | "apple";

function buildProvider(id: SocialProviderId): AuthProvider {
    switch (id) {
        case "google":
            return new GoogleAuthProvider();
        case "facebook":
            return new FacebookAuthProvider();
        case "github":
            return new GithubAuthProvider();
        case "twitter":
            return new TwitterAuthProvider();
        case "apple":
            return new OAuthProvider("apple.com");
    }
}

/**
 * Each provider must also be enabled in the Firebase console; if it isn't,
 * Firebase returns auth/operation-not-allowed, which the caller surfaces.
 */
export async function signInWithSocial(id: SocialProviderId) {
    const credential = await signInWithPopup(auth, buildProvider(id));
    await createUserDocIfNotExists(credential.user);
    return credential.user;
}
import { signInWithEmailAndPassword } from "firebase/auth";

export async function signInWithEmail(email: string, password: string) {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return credential.user;
}
import { signOut as firebaseSignOut } from "firebase/auth";

export async function logout() {
    await firebaseSignOut(auth);
}
import { sendPasswordResetEmail, confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";

export async function sendResetEmail(email: string) {
    await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/login`, // where Firebase sends them after successful reset
    });
}

export async function verifyResetCode(oobCode: string) {
    // Returns the user's email if the code is valid, throws if expired/invalid
    return await verifyPasswordResetCode(auth, oobCode);
}

export async function confirmReset(oobCode: string, newPassword: string) {
    await confirmPasswordReset(auth, oobCode, newPassword);
}

import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";

/** True when the account signs in with a password (rather than only Google/Facebook/Apple). */
export function hasPasswordProvider(user: User | null) {
    return !!user?.providerData.some((provider) => provider.providerId === "password");
}

export async function changePassword(currentPassword: string, newPassword: string) {
    const user = auth.currentUser;
    if (!user?.email) throw new Error("You need to be signed in to change your password.");

    // Firebase requires a recent login before it will accept a password change.
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);
}