import { SettingsClient } from "@/components/SettingsClient";

export default function SettingsPage() {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Configuración del CRM</h1>
                <p className="mt-2 text-sm text-gray-500">
                    Administra las preferencias de tu cuenta y del sistema.
                </p>
            </div>
            <SettingsClient />
        </div>
    );
}
