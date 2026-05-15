import { vi } from "vitest";

// Mock de Prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    customer: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
      groupBy: vi.fn(),
    },
    interaction: {
      findMany: vi.fn(),
      create: vi.fn(),
      count: vi.fn(),
    },
  },
}));

// Mock de Next.js NextResponse
global.fetch = vi.fn();
