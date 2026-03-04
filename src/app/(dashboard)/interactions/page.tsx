import { InteractionsList } from "@/components/InteractionsList";

export default function InteractionsPage() {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Historial de Interacciones</h1>
                <p className="mt-2 text-sm text-gray-500">
                    Revisa el log de llamadas, correos y reuniones con tus clientes.
                </p>
            </div>

            <div className="rounded-xl border bg-white shadow-sm p-6">
                <InteractionsList />
            </div>
        </div>
    );
}
