import { Sidebar } from "@/components/Sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen overflow-hidden bg-gray-50/20">
            <Sidebar />
            <main className="flex-1 overflow-y-auto bg-white min-h-screen">
                <div className="mx-auto max-w-6xl w-full p-8">{children}</div>
            </main>
        </div>
    );
}
