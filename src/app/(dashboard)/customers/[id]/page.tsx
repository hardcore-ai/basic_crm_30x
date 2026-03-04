import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, Building2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { InteractionTimeline } from "@/components/InteractionTimeline";

async function getCustomer(id: string) {
    const customer = await prisma.customer.findUnique({
        where: { id },
        include: {
            interactions: { orderBy: { date: "desc" } },
            _count: { select: { interactions: true } },
        },
    });
    return customer;
}

function StatusBadge({ status }: { status: string }) {
    switch (status) {
        case "ACTIVE":
            return <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700 ring-1 ring-inset ring-green-600/20">Activo</span>;
        case "LEAD":
            return <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">Prospecto</span>;
        case "CHURNED":
            return <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-red-700 ring-1 ring-inset ring-red-600/10">Baja</span>;
        default:
            return <span className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 text-sm font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">{status}</span>;
    }
}

export default async function CustomerDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const customer = await getCustomer(id);

    if (!customer) {
        notFound();
    }

    const lastInteraction = customer.interactions[0];
    const lastContactDate = lastInteraction
        ? new Date(lastInteraction.date).toLocaleDateString("es-ES", {
              day: "numeric",
              month: "long",
              year: "numeric",
          })
        : "Sin contacto";

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div>
                <Link
                    href="/customers"
                    className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Volver a Clientes
                </Link>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">{customer.name}</h1>
                <p className="mt-1 text-sm text-gray-500">Perfil detallado del cliente</p>
            </div>

            {/* Profile card + status */}
            <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="flex-1 rounded-xl border bg-white p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="h-16 w-16 flex-shrink-0 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-800 text-xl font-bold">
                            {customer.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 flex-wrap">
                                <h2 className="text-xl font-semibold text-gray-900">{customer.name}</h2>
                                <StatusBadge status={customer.status} />
                            </div>
                            <div className="mt-3 flex flex-col gap-1.5">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                    <a href={`mailto:${customer.email}`} className="hover:text-blue-600">
                                        {customer.email}
                                    </a>
                                </div>
                                {customer.phone && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                        <span>{customer.phone}</span>
                                    </div>
                                )}
                                {customer.company && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Building2 className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                        <span>{customer.company}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content: timeline + stats */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Timeline (2/3) */}
                <div className="lg:col-span-2 rounded-xl border bg-white p-6 shadow-sm">
                    <InteractionTimeline
                        interactions={customer.interactions.map((i) => ({
                            ...i,
                            date: i.date.toISOString(),
                        }))}
                        customerId={customer.id}
                    />
                </div>

                {/* Stats panel (1/3) */}
                <div className="flex flex-col gap-4">
                    <div className="rounded-xl border bg-white p-6 shadow-sm">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                            Resumen
                        </h3>
                        <dl className="flex flex-col gap-4">
                            <div>
                                <dt className="text-xs text-gray-500">Total Interacciones</dt>
                                <dd className="mt-0.5 text-2xl font-bold text-gray-900">
                                    {customer._count.interactions}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs text-gray-500">Último Contacto</dt>
                                <dd className="mt-0.5 text-sm font-medium text-gray-700">{lastContactDate}</dd>
                            </div>
                            <div>
                                <dt className="text-xs text-gray-500">Cliente desde</dt>
                                <dd className="mt-0.5 text-sm font-medium text-gray-700">
                                    {new Date(customer.createdAt).toLocaleDateString("es-ES", {
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                    })}
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    );
}
