import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const customer = await prisma.customer.findUnique({
            where: { id },
            include: {
                interactions: {
                    orderBy: { date: "desc" },
                },
                _count: { select: { interactions: true } },
            },
        });
        if (!customer) {
            return NextResponse.json({ error: "Customer not found" }, { status: 404 });
        }
        return NextResponse.json(customer);
    } catch (error) {
        console.error("Error fetching customer:", error);
        return NextResponse.json({ error: "Failed to fetch customer" }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const json = await request.json();
        const customer = await prisma.customer.update({
            where: { id },
            data: {
                name: json.name,
                email: json.email,
                phone: json.phone,
                company: json.company,
                status: json.status,
            },
        });
        return NextResponse.json(customer);
    } catch (error) {
        console.error("Error updating customer:", error);
        return NextResponse.json({ error: "Failed to update customer" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        await prisma.customer.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting customer:", error);
        return NextResponse.json({ error: "Failed to delete customer" }, { status: 500 });
    }
}
