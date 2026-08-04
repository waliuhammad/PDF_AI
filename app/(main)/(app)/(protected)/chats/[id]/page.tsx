import { ChatView } from "@/components/chats/chat-view";

// params is a Promise in Next 16, so resolve it here and hand the id to the
// client view that reads the conversation out of the store.
export default async function ChatDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    return <ChatView chatId={id} />;
}
