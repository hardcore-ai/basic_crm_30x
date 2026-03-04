"use client";

import { useState } from "react";
import { Phone, Mail, Users, FileText, Clock } from "lucide-react";
import { AddInteractionModal } from "./AddInteractionModal";

type Interaction = {
    id: string;
    type: string;
    notes: string;
    date: string;
    customerId: string;
};

const TYPE_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
    CALL: { label: "Llamada", icon: Phone, color: "text-green-600 bg-green-50" },
    EMAIL: { label: "Correo", icon: Mail, color: "text-blue-600 bg-blue-50" },
    MEETING: { label: "Reunión", icon: Users, color: "text-purple-600 bg-purple-50" },
    NOTE: { label: "Nota", icon: FileText, color: "text-gray-600 bg-gray-100" },
};

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function InteractionTimeline({
    interactions: initialInteractions,
    customerId,
}: {
    interactions: Interaction[];
    customerId: string;
}) {
    const [interactions, setInteractions] = useState(initialInteractions);
    const [modalOpen, setModalOpen] = useState(false);

    const handleAdded = (newInteraction: Interaction) => {
        setInteractions((prev) => [newInteraction, ...prev]);
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Historial de Interacciones</h2>
                <button
                    onClick={() => setModalOpen(true)}
                    className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-500"
                >
                    + Registrar Interacción
                </button>
            </div>

            {interactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 py-12 text-center">
                    <Clock className="h-8 w-8 text-gray-300 mb-2" />
                    <p className="text-sm text-gray-500">No hay interacciones registradas.</p>
                    <p className="text-xs text-gray-400 mt-1">Registra la primera interacción con este cliente.</p>
                </div>
            ) : (
                <ol className="relative border-l border-gray-200 ml-3">
                    {interactions.map((interaction) => {
                        const config = TYPE_CONFIG[interaction.type] ?? TYPE_CONFIG.NOTE;
                        const Icon = config.icon;
                        return (
                            <li key={interaction.id} className="mb-6 ml-6">
                                <span className={`absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-white ${config.color}`}>
                                    <Icon className="h-3 w-3" />
                                </span>
                                <div className="rounded-lg border bg-white p-4 shadow-sm">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${config.color}`}>
                                            {config.label}
                                        </span>
                                        <time className="text-xs text-gray-400">{formatDate(interaction.date)}</time>
                                    </div>
                                    <p className="text-sm text-gray-700 mt-2 whitespace-pre-line">{interaction.notes}</p>
                                </div>
                            </li>
                        );
                    })}
                </ol>
            )}

            {modalOpen && (
                <AddInteractionModal
                    customerId={customerId}
                    onClose={() => setModalOpen(false)}
                    onAdded={handleAdded}
                />
            )}
        </div>
    );
}
