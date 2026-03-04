"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, MessageSquareText, Settings, Building2 } from "lucide-react";
import { useAgentProfile } from "@/lib/useAgentProfile";

export function Sidebar() {
    const pathname = usePathname();
    const { profile } = useAgentProfile();

    const initials = profile.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();

    const routes = [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Clientes", href: "/customers", icon: Users },
        { name: "Interacciones", href: "/interactions", icon: MessageSquareText },
        { name: "Configuración", href: "/settings", icon: Settings },
    ];

    return (
        <div className="flex h-screen w-64 flex-col border-r bg-gray-50/40">
            <div className="flex h-14 items-center border-b px-4 font-semibold">
                <Building2 className="mr-2 h-6 w-6 text-blue-600" />
                <span className="text-lg">ShopFlow CRM</span>
            </div>
            <div className="flex-1 overflow-auto py-4">
                <nav className="grid gap-1 px-2">
                    {routes.map((route) => {
                        const Icon = route.icon;
                        const isActive = pathname.startsWith(route.href);
                        return (
                            <Link
                                key={route.href}
                                href={route.href}
                                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive
                                        ? "bg-blue-100 text-blue-900"
                                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                    }`}
                            >
                                <Icon className={`h-4 w-4 ${isActive ? "text-blue-700" : "text-gray-400"}`} />
                                {route.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>
            <div className="border-t p-4">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                        {initials}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium truncate">{profile.name}</span>
                        <span className="text-xs text-gray-500 truncate">{profile.email}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
