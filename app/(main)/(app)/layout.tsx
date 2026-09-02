import { AppChrome } from "@/components/app-chrome";

/**
 * Chrome for the signed-in app area. The PDF tools live here and stay usable
 * without an account — only the routes under (protected) require sign-in,
 * which is why AppChrome picks the frame from the session rather than this
 * layout assuming everyone here is signed in.
 *
 */
export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <AppChrome>{children}</AppChrome>
        </>
    );
}
