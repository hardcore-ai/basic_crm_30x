import { CustomerTable } from "@/components/CustomerTable";
import { Users, UserPlus, ArrowUpRight, Activity } from "lucide-react";

async function getStats() {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
        const res = await fetch(`${baseUrl}/api/stats`, { cache: "no-store" });
        if (!res.ok) return null;
        return res.json();
    } catch {
        return null;
    }
}

export default async function DashboardPage() {
    const stats = await getStats();

    const statCards = [
        {
            name: "Total Clientes",
            value: stats ? stats.totalCustomers.toLocaleString("es") : "—",
            icon: Users,
            sub: stats ? `${stats.totalActive} activos` : "",
        },
        {
            name: "Nuevos Leads",
            value: stats ? stats.totalLeads.toLocaleString("es") : "—",
            icon: UserPlus,
            sub: stats ? `${stats.totalChurned} bajas` : "",
        },
        {
            name: "Tasa de Cierre",
            value: stats ? `${stats.closingRate}%` : "—",
            icon: ArrowUpRight,
            sub: "activos / total",
        },
        {
            name: "Interacciones (Mes)",
            value: stats ? stats.interactionsThisMonth.toLocaleString("es") : "—",
            icon: Activity,
            sub: "este mes",
        },
    ];

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
                <p className="mt-2 text-sm text-gray-500">
                    Resumen general del rendimiento comercial del CRM.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={stat.name}
                            className="relative overflow-hidden rounded-xl border bg-white px-4 pb-4 pt-5 shadow-sm sm:px-6 sm:pt-6"
                        >
                            <dt>
                                <div className="absolute rounded-md bg-blue-50 p-3">
                                    <Icon className="h-6 w-6 text-blue-600" aria-hidden="true" />
                                </div>
                                <p className="ml-16 truncate text-sm font-medium text-gray-500">
                                    {stat.name}
                                </p>
                            </dt>
                            <dd className="ml-16 flex items-baseline pb-1 sm:pb-2">
                                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                                {stat.sub && (
                                    <p className="ml-2 flex items-baseline text-sm text-gray-500">
                                        {stat.sub}
                                    </p>
                                )}
                            </dd>
                        </div>
                    );
                })}
            </div>

            <div className="mt-8 rounded-xl border bg-white shadow-sm">
                <div className="border-b px-6 py-4">
                    <h2 className="text-lg font-medium text-gray-900">Clientes Recientes</h2>
                    <p className="text-sm text-gray-500">Última actividad detectada en el sistema.</p>
                </div>
                <div className="px-6 pb-6">
                    <CustomerTable />
                </div>
            </div>
        </div>
    );
}
