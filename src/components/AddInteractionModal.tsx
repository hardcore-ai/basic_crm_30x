"use client";

import { useState } from "react";
import { X } from "lucide-react";

type Interaction = {
    id: string;
    type: string;
    notes: string;
    date: string;
    customerId: string;
};

export function AddInteractionModal({
    customerId,
    onClose,
    onAdded,
}: {
    customerId: string;
    onClose: () => void;
    onAdded: (interaction: Interaction) => void;
}) {
    const [form, setForm] = useState({ type: "CALL", notes: "", date: new Date().toISOString().slice(0, 16) });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");
        try {
            const res = await fetch("/api/interactions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, customerId, date: new Date(form.date).toISOString() }),
            });
            if (!res.ok) {
                setError("Error al guardar la interacción. Inténtalo de nuevo.");
                return;
            }
            const data = await res.json();
            onAdded(data);
            onClose();
        } catch {
            setError("Error de red. Inténtalo de nuevo.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl relative">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                >
                    <X className="h-5 w-5" />
                </button>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Registrar Interacción</h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tipo *</label>
                        <select
                            value={form.type}
                            onChange={(e) => setForm({ ...form, type: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                        >
                            <option value="CALL">Llamada</option>
                            <option value="EMAIL">Correo</option>
                            <option value="MEETING">Reunión</option>
                            <option value="NOTE">Nota</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Fecha y hora *</label>
                        <input
                            required
                            type="datetime-local"
                            value={form.date}
                            onChange={(e) => setForm({ ...form, date: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Notas *</label>
                        <textarea
                            required
                            rows={4}
                            value={form.notes}
                            onChange={(e) => setForm({ ...form, notes: e.target.value })}
                            placeholder="Describe el contenido de la interacción..."
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border resize-none"
                        />
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <div className="flex justify-end gap-3 mt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-md border bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            {submitting ? "Guardando..." : "Guardar"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
