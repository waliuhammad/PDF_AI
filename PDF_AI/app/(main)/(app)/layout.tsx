import { Sidebar } from "@/components/dashboard/sidebar";

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
