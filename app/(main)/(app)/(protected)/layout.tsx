import { ProtectedRoute } from "@/components/protected-route";

/**
 * Wraps only the routes backed by user data — dashboard, documents, chats and
 * settings. The PDF tools deliberately sit outside this group so anonymous
 * visitors arriving from the marketing pages can still use them.
 */
export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <ProtectedRoute>{children}</ProtectedRoute>;
}
