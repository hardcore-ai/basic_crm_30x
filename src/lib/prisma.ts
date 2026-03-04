import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

// Evita que se instancien múltiples clientes de Prisma y Pools en desarrollo
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

// Crear pool y adapter nativo de PG (requerido por Prisma 7+)
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        adapter,
    });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
