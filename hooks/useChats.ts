"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useDocuments } from "@/hooks/useDocuments";
import { AiError, askAboutDocument, ensureAiFileId } from "@/lib/ai";
import {
    addMessage,
    createChat,
    deleteChat,
    watchChats,
    watchMessages,
    type StoredChat,
    type StoredMessage,
} from "@/lib/firebase/chats";

function friendlyError(err: Error) {
    return err.message.includes("insufficient permissions")
        ? "Your account can't read chats yet — the database rules still need publishing."
        : err.message;
}

/** Live list of the signed-in user's conversations. */
export function useChats() {
    const { user, loading: authLoading } = useAuth();
    const uid = user?.uid ?? null;

    // Tagged with the uid it belongs to, so switching accounts can't briefly
    // show the previous user's chats.
    const [snapshot, setSnapshot] = useState<{
        uid: string | null;
        chats: StoredChat[];
        error: string | null;
    }>({ uid: null, chats: [], error: null });

    useEffect(() => {
        if (!uid) return;

        return watchChats(
            uid,
            (chats) => setSnapshot({ uid, chats, error: null }),
            (err) => setSnapshot({ uid, chats: [], error: friendlyError(err) })
        );
    }, [uid]);

    const ready = snapshot.uid === uid;

    const create = useCallback(
        async (documentId: string, documentName: string, title?: string) => {
            if (!uid) throw new Error("You need to be signed in to start a chat.");
            return createChat(uid, { documentId, documentName, title });
        },
        [uid]
    );

    const remove = useCallback(
        async (chatId: string) => {
            if (!uid) return;
            await deleteChat(uid, chatId);
        },
        [uid]
    );

    return {
        chats: ready ? snapshot.chats : [],
        loading: authLoading || (!!uid && !ready),
        error: ready ? snapshot.error : null,
        create,
        remove,
    };
}

/** Live view of a single conversation and its messages. */
export function useChat(chatId: string) {
    const { user, loading: authLoading } = useAuth();
    const uid = user?.uid ?? null;
    const { chats, loading: chatsLoading } = useChats();
    const { documents } = useDocuments();

    const [snapshot, setSnapshot] = useState<{
        key: string | null;
        messages: StoredMessage[];
        error: string | null;
    }>({ key: null, messages: [], error: null });

    const key = uid ? `${uid}:${chatId}` : null;

    useEffect(() => {
        if (!uid || !chatId) return;

        return watchMessages(
            uid,
            chatId,
            (messages) => setSnapshot({ key: `${uid}:${chatId}`, messages, error: null }),
            (err) => setSnapshot({ key: `${uid}:${chatId}`, messages: [], error: friendlyError(err) })
        );
    }, [uid, chatId]);

    const ready = snapshot.key === key;

    const [thinking, setThinking] = useState(false);

    const send = useCallback(
        async (content: string) => {
            if (!uid) return;

            await addMessage(uid, chatId, "user", content);
            setThinking(true);

            try {
                const chat = chats.find((c) => c.id === chatId);
                const document = documents.find((d) => d.id === chat?.documentId);

                if (!document) {
                    throw new AiError(
                        "The document for this chat is no longer in your library, so I can't read it."
                    );
                }

                const fileId = await ensureAiFileId(uid, document);

                // The prior turns give the model the conversation; the message
                // just written is passed separately as the question.
                const history = snapshot.messages.map((m) => ({ role: m.role, content: m.content }));
                const reply = await askAboutDocument(fileId, content, history);

                await addMessage(uid, chatId, "assistant", reply);
            } catch (err) {
                const message =
                    err instanceof AiError
                        ? err.message
                        : "Something went wrong answering that. Please try again.";
                await addMessage(uid, chatId, "assistant", message);
            } finally {
                setThinking(false);
            }
        },
        [uid, chatId, chats, documents, snapshot.messages]
    );

    return {
        chat: chats.find((c) => c.id === chatId) ?? null,
        messages: ready ? snapshot.messages : [],
        loading: authLoading || chatsLoading || (!!uid && !ready),
        error: ready ? snapshot.error : null,
        thinking,
        send,
    };
}
