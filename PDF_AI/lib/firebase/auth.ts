import {
    createUserWithEmailAndPassword,
    updateProfile,
    signInWithPopup,
    GoogleAuthProvider,
    FacebookAuthProvider,
    OAuthProvider,
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

async function createUserDocIfNotExists(user: User, extra?: Record<string, unknown>) {
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
}

export async function registerWithEmail(input: RegisterInput) {
    const credential = await createUserWithEmailAndPassword(auth, input.email, input.password);
    await updateProfile(credential.user, { displayName: input.fullName });
    await createUserDocIfNotExists(credential.user, {
        fullName: input.fullName,
        phone: `${input.phoneDialCode}${input.phoneNumber}`,
    });
    return credential.user;
}

export async function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    const credential = await signInWithPopup(auth, provider);
    await createUserDocIfNotExists(credential.user);
    return credential.user;
}

export async function signInWithFacebook() {
    const provider = new FacebookAuthProvider();
    const credential = await signInWithPopup(auth, provider);
    await createUserDocIfNotExists(credential.user);
    return credential.user;
}

export async function signInWithApple() {
    const provider = new OAuthProvider("apple.com");
    const credential = await signInWithPopup(auth, provider);
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