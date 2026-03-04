"use client";

import { useState, useEffect } from "react";
import { useAgentProfile } from "@/lib/useAgentProfile";

const TIMEZONES = [
    { value: "America/Mexico_City", label: "Ciudad de México (UTC-6)" },
    { value: "America/Bogota", label: "Bogotá (UTC-5)" },
    { value: "America/Lima", label: "Lima (UTC-5)" },
    { value: "America/Santiago", label: "Santiago (UTC-4)" },
    { value: "America/Buenos_Aires", label: "Buenos Aires (UTC-3)" },
    { value: "America/Sao_Paulo", label: "São Paulo (UTC-3)" },
    { value: "Europe/Madrid", label: "Madrid (UTC+1)" },
];

export function SettingsClient() {
    const { profile, saveProfile, loaded } = useAgentProfile();
    const [profileForm, setProfileForm] = useState({ name: "", email: "" });
    const [timezone, setTimezone] = useState("");
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (loaded) {
            setProfileForm({ name: profile.name, email: profile.email });
            setTimezone(profile.timezone);
        }
    }, [loaded, profile]);

    const handleProfileSave = (e: React.FormEvent) => {
        e.preventDefault();
        saveProfile({ name: profileForm.name, email: profileForm.email });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleTimezoneSave = (e: React.FormEvent) => {
        e.preventDefault();
        saveProfile({ timezone });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    if (!loaded) {
        return <div className="text-sm text-gray-400 py-8 text-center">Cargando configuración...</div>;
    }

    return (
        <div className="flex flex-col gap-6">
            {saved && (
                <div className="rounded-md bg-green-50 p-3 text-sm text-green-700 ring-1 ring-inset ring-green-600/20">
                    Configuración guardada correctamente.
                </div>
            )}

            {/* Mi Perfil */}
            <section className="rounded-xl border bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Mi Perfil</h2>
                <p className="text-sm text-gray-500 mb-4">Información visible en la barra lateral del CRM.</p>
                <form onSubmit={handleProfileSave} className="flex flex-col gap-4 max-w-md">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre</label>
                        <input
                            type="text"
                            value={profileForm.name}
                            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            value={profileForm.email}
                            onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                        />
                    </div>
                    <div>
                        <button
                            type="submit"
                            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                            Guardar Perfil
                        </button>
                    </div>
                </form>
            </section>

            {/* Preferencias */}
            <section className="rounded-xl border bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Preferencias</h2>
                <p className="text-sm text-gray-500 mb-4">Ajustes regionales del sistema.</p>
                <form onSubmit={handleTimezoneSave} className="flex flex-col gap-4 max-w-md">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Zona Horaria</label>
                        <select
                            value={timezone}
                            onChange={(e) => setTimezone(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                        >
                            {TIMEZONES.map((tz) => (
                                <option key={tz.value} value={tz.value}>
                                    {tz.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <button
                            type="submit"
                            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                            Guardar Preferencias
                        </button>
                    </div>
                </form>
            </section>

            {/* Acerca del Sistema */}
            <section className="rounded-xl border bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Acerca del Sistema</h2>
                <p className="text-sm text-gray-500 mb-4">Información técnica de la plataforma.</p>
                <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-sm">
                    <div className="flex gap-2">
                        <dt className="font-medium text-gray-700">Versión:</dt>
                        <dd className="text-gray-500">1.0.0</dd>
                    </div>
                    <div className="flex gap-2">
                        <dt className="font-medium text-gray-700">Framework:</dt>
                        <dd className="text-gray-500">Next.js 16 + React 19</dd>
                    </div>
                    <div className="flex gap-2">
                        <dt className="font-medium text-gray-700">Base de datos:</dt>
                        <dd className="text-gray-500">PostgreSQL (Neon)</dd>
                    </div>
                    <div className="flex gap-2">
                        <dt className="font-medium text-gray-700">ORM:</dt>
                        <dd className="text-gray-500">Prisma 7</dd>
                    </div>
                    <div className="flex gap-2">
                        <dt className="font-medium text-gray-700">Estilos:</dt>
                        <dd className="text-gray-500">Tailwind CSS</dd>
                    </div>
                    <div className="flex gap-2">
                        <dt className="font-medium text-gray-700">Lenguaje:</dt>
                        <dd className="text-gray-500">TypeScript</dd>
                    </div>
                </dl>
            </section>
        </div>
    );
}
