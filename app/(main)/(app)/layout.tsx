import { Sidebar } from "@/components/dashboard/sidebar";

/**
 * Chrome for the signed-in app area. The PDF tools live here and stay usable
 * without an account — only the routes under (protected) require sign-in.
 */
export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-full flex flex-col md:flex-row">
            <Sidebar />
            <main className="flex-1 w-full min-w-0 px-4 sm:px-6 lg:px-8 py-6">
                {children}
            </main>
        </div>
    );
}
