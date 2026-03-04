"use client";

import { useEffect, useRef, useState } from "react";
import { Search, Plus, MoreHorizontal, X } from "lucide-react";
import Link from "next/link";

type Customer = {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    company: string | null;
    status: string;
    createdAt: string;
    _count: { interactions: number };
};

function ActionMenu({
    customer,
    onEdit,
    onDelete,
}: {
    customer: Customer;
    onEdit: (c: Customer) => void;
    onDelete: (c: Customer) => void;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [open]);

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen((v) => !v)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded"
            >
                <MoreHorizontal className="h-5 w-5" />
            </button>
            {open && (
                <div className="absolute right-0 z-10 mt-1 w-40 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                        <Link
                            href={`/customers/${customer.id}`}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setOpen(false)}
                        >
                            Ver detalles
                        </Link>
                        <button
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => { setOpen(false); onEdit(customer); }}
                        >
                            Editar
                        </button>
                        <button
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            onClick={() => { setOpen(false); onDelete(customer); }}
                        >
                            Eliminar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export function CustomerTable() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        company: "",
        phone: "",
    });
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);
    const [editForm, setEditForm] = useState({
        name: "",
        email: "",
        company: "",
        phone: "",
        status: "",
    });

    async function loadCustomers() {
        setLoading(true);
        try {
            const res = await fetch("/api/customers");
            const data = await res.json();
            setCustomers(data);
        } catch (error) {
            console.error("Failed to fetch customers", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadCustomers();
    }, []);

    const filteredCustomers = customers.filter((c) => {
        const q = searchQuery.toLowerCase();
        return (
            c.name.toLowerCase().includes(q) ||
            c.email.toLowerCase().includes(q) ||
            (c.company ?? "").toLowerCase().includes(q)
        );
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/customers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                setIsModalOpen(false);
                setFormData({ name: "", email: "", company: "", phone: "" });
                loadCustomers();
            } else {
                console.error("Failed to create customer");
            }
        } catch (error) {
            console.error("Error creating customer", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditOpen = (customer: Customer) => {
        setEditingCustomer(customer);
        setEditForm({
            name: customer.name,
            email: customer.email,
            company: customer.company ?? "",
            phone: customer.phone ?? "",
            status: customer.status,
        });
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCustomer) return;
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/customers/${editingCustomer.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editForm),
            });
            if (res.ok) {
                setEditingCustomer(null);
                loadCustomers();
            }
        } catch (error) {
            console.error("Error updating customer", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingCustomer) return;
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/customers/${deletingCustomer.id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                setDeletingCustomer(null);
                loadCustomers();
            }
        } catch (error) {
            console.error("Error deleting customer", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "ACTIVE":
                return <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">Activo</span>;
            case "LEAD":
                return <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">Prospecto</span>;
            case "CHURNED":
                return <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">Baja</span>;
            default:
                return <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">{status}</span>;
        }
    };

    return (
        <div className="w-full">
            <div className="flex items-center justify-between py-4">
                <div className="relative w-72">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                        placeholder="Buscar clientes..."
                    />
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                    <Plus className="h-4 w-4" /> Nuevo Cliente
                </button>
            </div>

            <div className="mt-4 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Nombre</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Empresa</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Estado</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Interacciones</th>
                                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                            <span className="sr-only">Opciones</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={5} className="py-12 text-center text-sm text-gray-500">
                                                Cargando clientes...
                                            </td>
                                        </tr>
                                    ) : filteredCustomers.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-12 text-center text-sm text-gray-500">
                                                {searchQuery
                                                    ? "No se encontraron resultados para tu búsqueda."
                                                    : 'No hay clientes registrados. Haz clic en "Nuevo Cliente" para empezar.'}
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredCustomers.map((customer) => (
                                            <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-r from-blue-100 to-blue-200 flex items-center justify-center text-blue-800 font-bold">
                                                            {customer.name.substring(0, 2).toUpperCase()}
                                                        </div>
                                                        <div className="ml-4">
                                                            <Link
                                                                href={`/customers/${customer.id}`}
                                                                className="font-medium text-gray-900 hover:text-blue-600 hover:underline"
                                                            >
                                                                {customer.name}
                                                            </Link>
                                                            <div className="text-gray-500">{customer.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    {customer.company || "—"}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                    {getStatusBadge(customer.status)}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    {customer._count.interactions || 0} registros
                                                </td>
                                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                    <ActionMenu
                                                        customer={customer}
                                                        onEdit={handleEditOpen}
                                                        onDelete={setDeletingCustomer}
                                                    />
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal: Nuevo Cliente */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl relative">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-5 w-5" />
                        </button>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Añadir Nuevo Cliente</h2>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nombre *</label>
                                <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email *</label>
                                <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Empresa</label>
                                <input type="text" value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                                <input type="text" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border" />
                            </div>
                            <div className="mt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-md border bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={isSubmitting} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                                    {isSubmitting ? "Guardando..." : "Guardar Cliente"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Editar Cliente */}
            {editingCustomer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl relative">
                        <button
                            onClick={() => setEditingCustomer(null)}
                            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-5 w-5" />
                        </button>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Editar Cliente</h2>
                        <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nombre *</label>
                                <input required type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email *</label>
                                <input required type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Empresa</label>
                                <input type="text" value={editForm.company} onChange={e => setEditForm({ ...editForm, company: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                                <input type="text" value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Estado</label>
                                <select value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border">
                                    <option value="LEAD">Prospecto</option>
                                    <option value="ACTIVE">Activo</option>
                                    <option value="CHURNED">Baja</option>
                                </select>
                            </div>
                            <div className="mt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setEditingCustomer(null)} className="rounded-md border bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={isSubmitting} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                                    {isSubmitting ? "Guardando..." : "Guardar Cambios"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Confirmar Eliminación */}
            {deletingCustomer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">Eliminar Cliente</h2>
                        <p className="text-sm text-gray-500 mb-6">
                            ¿Estás seguro de que deseas eliminar a{" "}
                            <span className="font-medium text-gray-900">{deletingCustomer.name}</span>?
                            Esta acción no se puede deshacer.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeletingCustomer(null)}
                                className="rounded-md border bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isSubmitting}
                                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                            >
                                {isSubmitting ? "Eliminando..." : "Eliminar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
