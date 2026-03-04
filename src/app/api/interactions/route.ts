import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");

    try {
        const interactions = await prisma.interaction.findMany({
            where: customerId ? { customerId } : undefined,
            orderBy: { date: "desc" },
            include: customerId
                ? undefined
                : {
                      customer: {
                          select: { id: true, name: true, company: true },
                      },
                  },
        });
        return NextResponse.json(interactions);
    } catch (error) {
        console.error("Error fetching interactions:", error);
        return NextResponse.json({ error: "Failed to fetch interactions" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const json = await request.json();
        const interaction = await prisma.interaction.create({
            data: {
                customerId: json.customerId,
                type: json.type,
                notes: json.notes,
                date: new Date(json.date || Date.now()),
            },
        });
        return NextResponse.json(interaction, { status: 201 });
    } catch (error) {
        console.error("Error creating interaction:", error);
        return NextResponse.json({ error: "Failed to create interaction" }, { status: 500 });
    }
}
