import { Sidebar } from "@/components/dashboard/sidebar";
import { LibraryLoader } from "@/components/library-loader";

/**
 * Chrome for the signed-in app area. The PDF tools live here and stay usable
 * without an account — only the routes under (protected) require sign-in.
 *
 * LibraryLoader keeps the library store in sync with the signed-in user:
 * mounted here (rather than in (protected)) so a signed-in user's history
 * is already loaded even while they're on an open tool page.
 */
export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-full flex flex-col md:flex-row">
            <LibraryLoader />
            <Sidebar />
            <main className="flex-1 w-full min-w-0 px-4 sm:px-6 lg:px-8 py-6">
                {children}
            </main>
        </div>
    );
}