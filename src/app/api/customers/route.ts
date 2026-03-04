import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const customers = await prisma.customer.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                _count: {
                    select: { interactions: true },
                },
            },
        });
        return NextResponse.json(customers);
    } catch (error) {
        console.error("Error fetching customers:", error);
        return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const json = await request.json();
        const customer = await prisma.customer.create({
            data: {
                name: json.name,
                email: json.email,
                phone: json.phone,
                company: json.company,
                status: json.status || "LEAD",
            },
        });
        return NextResponse.json(customer, { status: 201 });
    } catch (error) {
        console.error("Error creating customer:", error);
        return NextResponse.json({ error: "Failed to create customer" }, { status: 500 });
    }
}
