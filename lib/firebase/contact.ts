"use client";

import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./client";

export interface ContactMessage {
    name: string;
    email: string;
    subject: string;
    message: string;
}

/**
 * Records a message from the public contact form.
 *
 * Writes straight to Firestore rather than through an email service, so this
 * works with the infrastructure already in place and needs no extra key. The
 * matching rule allows create only — messages can't be read back from the
 * client, so the collection isn't a public mailbox.
 */
export async function submitContactMessage(input: ContactMessage) {
    // Trimmed and capped here too: the rule enforces these limits, and a write
    // that violates them is rejected with a permissions error that would read
    // as a bug rather than as "your message was too long".
    await addDoc(collection(db, "contactMessages"), {
        name: input.name.trim().slice(0, 100),
        email: input.email.trim().slice(0, 200),
        subject: input.subject.trim().slice(0, 200),
        message: input.message.trim().slice(0, 5000),
        createdAt: serverTimestamp(),
    });
}
