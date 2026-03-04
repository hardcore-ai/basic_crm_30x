"use client";

import { useEffect, useState } from "react";
import { Phone, Mail, Users, FileText, Search } from "lucide-react";
import Link from "next/link";

type InteractionWithCustomer = {
    id: string;
    type: string;
    notes: string;
    date: string;
    customerId: string;
    customer: { id: string; name: string; company: string | null };
};

const TYPE_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
    CALL: { label: "Llamada", icon: Phone, color: "text-green-700 bg-green-50 ring-green-600/20" },
    EMAIL: { label: "Correo", icon: Mail, color: "text-blue-700 bg-blue-50 ring-blue-700/10" },
    MEETING: { label: "Reunión", icon: Users, color: "text-purple-700 bg-purple-50 ring-purple-700/10" },
    NOTE: { label: "Nota", icon: FileText, color: "text-gray-600 bg-gray-50 ring-gray-500/10" },
};

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function InteractionsList() {
    const [interactions, setInteractions] = useState<InteractionWithCustomer[]>([]);
    const [loading, setLoading] = useState(true);
    const [typeFilter, setTypeFilter] = useState("");
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetch("/api/interactions")
            .then((r) => r.json())
            .then((data) => setInteractions(data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const filtered = interactions.filter((i) => {
        const matchType = typeFilter ? i.type === typeFilter : true;
        const q = search.toLowerCase();
        const matchSearch = q
            ? i.customer.name.toLowerCase().includes(q) ||
              (i.customer.company ?? "").toLowerCase().includes(q)
            : true;
        return matchType && matchSearch;
    });

    return (
        <div>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative w-full sm:w-72">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar por cliente o empresa..."
                        className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                    />
                </div>
                <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="rounded-md border-0 py-1.5 pl-3 pr-8 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm"
                >
                    <option value="">Todos los tipos</option>
                    <option value="CALL">Llamada</option>
                    <option value="EMAIL">Correo</option>
                    <option value="MEETING">Reunión</option>
                    <option value="NOTE">Nota</option>
                </select>
            </div>

            {/* Table */}
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Tipo</th>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Cliente</th>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 hidden sm:table-cell">Empresa</th>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Notas</th>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 hidden md:table-cell">Fecha</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="py-12 text-center text-sm text-gray-500">
                                    Cargando interacciones...
                                </td>
                            </tr>
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-12 text-center text-sm text-gray-500">
                                    No se encontraron interacciones.
                                </td>
                            </tr>
                        ) : (
                            filtered.map((interaction) => {
                                const config = TYPE_CONFIG[interaction.type] ?? TYPE_CONFIG.NOTE;
                                const Icon = config.icon;
                                return (
                                    <tr
                                        key={interaction.id}
                                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                                        onClick={() => window.location.href = `/customers/${interaction.customerId}`}
                                    >
                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${config.color}`}>
                                                <Icon className="h-3 w-3" />
                                                {config.label}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                                            <Link
                                                href={`/customers/${interaction.customerId}`}
                                                className="font-medium text-gray-900 hover:text-blue-600"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {interaction.customer.name}
                                            </Link>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 hidden sm:table-cell">
                                            {interaction.customer.company || "—"}
                                        </td>
                                        <td className="px-3 py-4 text-sm text-gray-500 max-w-xs">
                                            <p className="truncate">{interaction.notes}</p>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 hidden md:table-cell">
                                            {formatDate(interaction.date)}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
