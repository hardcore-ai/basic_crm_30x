import { CustomerTable } from "@/components/CustomerTable";

export default function CustomersPage() {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Directorio de Clientes</h1>
                <p className="mt-2 text-sm text-gray-500">
                    Gestiona todos los clientes, leads y prospectos registrados en tu base de datos CRM.
                </p>
            </div>

            <div className="mt-4 rounded-xl border bg-white shadow-sm p-6">
                <CustomerTable />
            </div>
        </div>
    );
}
