import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const [totalCustomers, statusGroups, interactionsThisMonth] = await Promise.all([
            prisma.customer.count(),
            prisma.customer.groupBy({
                by: ["status"],
                _count: { status: true },
            }),
            prisma.interaction.count({
                where: { date: { gte: startOfMonth } },
            }),
        ]);

        const totalLeads = statusGroups.find((g) => g.status === "LEAD")?._count.status ?? 0;
        const totalActive = statusGroups.find((g) => g.status === "ACTIVE")?._count.status ?? 0;
        const totalChurned = statusGroups.find((g) => g.status === "CHURNED")?._count.status ?? 0;

        const closingRate =
            totalCustomers > 0
                ? Math.round((totalActive / totalCustomers) * 100 * 10) / 10
                : 0;

        return NextResponse.json({
            totalCustomers,
            totalLeads,
            totalActive,
            totalChurned,
            interactionsThisMonth,
            closingRate,
        });
    } catch (error) {
        console.error("Error fetching stats:", error);
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }
}
