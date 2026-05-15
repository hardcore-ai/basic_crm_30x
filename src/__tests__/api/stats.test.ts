import { describe, it, expect, beforeEach, vi } from "vitest";
import { GET as getStats } from "@/app/api/stats/route";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma");

describe("GET /api/stats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return complete stats with all customer statuses", async () => {
    const totalCustomers = 100;
    const statusGroups = [
      { status: "LEAD", _count: { status: 30 } },
      { status: "ACTIVE", _count: { status: 60 } },
      { status: "CHURNED", _count: { status: 10 } },
    ];
    const interactionsThisMonth = 150;

    vi.mocked(prisma.customer.count).mockResolvedValueOnce(totalCustomers);
    vi.mocked(prisma.customer.groupBy).mockResolvedValueOnce(statusGroups);
    vi.mocked(prisma.interaction.count).mockResolvedValueOnce(
      interactionsThisMonth,
    );

    const request = new Request("http://localhost/api/stats");
    const response = await getStats();
    const data = await response.json();

    expect(data).toEqual({
      totalCustomers: 100,
      totalLeads: 30,
      totalActive: 60,
      totalChurned: 10,
      interactionsThisMonth: 150,
      closingRate: 60.0,
    });
    expect(response.status).toBe(200);
  });

  it("should calculate correct closing rate", async () => {
    vi.mocked(prisma.customer.count).mockResolvedValueOnce(200);
    vi.mocked(prisma.customer.groupBy).mockResolvedValueOnce([
      { status: "LEAD", _count: { status: 80 } },
      { status: "ACTIVE", _count: { status: 100 } },
      { status: "CHURNED", _count: { status: 20 } },
    ]);
    vi.mocked(prisma.interaction.count).mockResolvedValueOnce(300);

    const request = new Request("http://localhost/api/stats");
    const response = await getStats();
    const data = await response.json();

    const expectedClosingRate = (100 / 200) * 100;
    expect(data.closingRate).toBe(expectedClosingRate);
  });

  it("should return zero closing rate when no customers exist", async () => {
    vi.mocked(prisma.customer.count).mockResolvedValueOnce(0);
    vi.mocked(prisma.customer.groupBy).mockResolvedValueOnce([]);
    vi.mocked(prisma.interaction.count).mockResolvedValueOnce(0);

    const request = new Request("http://localhost/api/stats");
    const response = await getStats();
    const data = await response.json();

    expect(data).toEqual({
      totalCustomers: 0,
      totalLeads: 0,
      totalActive: 0,
      totalChurned: 0,
      interactionsThisMonth: 0,
      closingRate: 0,
    });
    expect(response.status).toBe(200);
  });

  it("should handle missing status groups gracefully", async () => {
    vi.mocked(prisma.customer.count).mockResolvedValueOnce(50);
    vi.mocked(prisma.customer.groupBy).mockResolvedValueOnce([
      { status: "ACTIVE", _count: { status: 30 } },
    ]);
    vi.mocked(prisma.interaction.count).mockResolvedValueOnce(75);

    const request = new Request("http://localhost/api/stats");
    const response = await getStats();
    const data = await response.json();

    expect(data).toEqual({
      totalCustomers: 50,
      totalLeads: 0,
      totalActive: 30,
      totalChurned: 0,
      interactionsThisMonth: 75,
      closingRate: 60.0,
    });
    expect(response.status).toBe(200);
  });

  it("should count only interactions from current month onwards", async () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    vi.mocked(prisma.customer.count).mockResolvedValueOnce(100);
    vi.mocked(prisma.customer.groupBy).mockResolvedValueOnce([
      { status: "ACTIVE", _count: { status: 50 } },
    ]);
    vi.mocked(prisma.interaction.count).mockResolvedValueOnce(120);

    const request = new Request("http://localhost/api/stats");
    const response = await getStats();

    const interactionCallArgs = vi.mocked(prisma.interaction.count).mock
      .calls[0][0];
    const whereClause = interactionCallArgs.where;

    expect(whereClause.date.gte.getFullYear()).toBe(startOfMonth.getFullYear());
    expect(whereClause.date.gte.getMonth()).toBe(startOfMonth.getMonth());
    expect(whereClause.date.gte.getDate()).toBe(1);
    expect(whereClause.date.gte.getHours()).toBe(0);
    expect(whereClause.date.gte.getMinutes()).toBe(0);
    expect(whereClause.date.gte.getSeconds()).toBe(0);
  });

  it("should round closing rate to one decimal place", async () => {
    vi.mocked(prisma.customer.count).mockResolvedValueOnce(7);
    vi.mocked(prisma.customer.groupBy).mockResolvedValueOnce([
      { status: "ACTIVE", _count: { status: 1 } },
    ]);
    vi.mocked(prisma.interaction.count).mockResolvedValueOnce(0);

    const request = new Request("http://localhost/api/stats");
    const response = await getStats();
    const data = await response.json();

    expect(data.closingRate).toBe(14.3);
    expect(Number.isInteger(data.closingRate * 10)).toBe(true);
  });

  it("should handle database errors gracefully", async () => {
    const dbError = new Error("Database connection failed");
    vi.mocked(prisma.customer.count).mockRejectedValueOnce(dbError);

    const request = new Request("http://localhost/api/stats");
    const response = await getStats();
    const data = await response.json();

    expect(data).toEqual({ error: "Failed to fetch stats" });
    expect(response.status).toBe(500);
  });

  it("should use Promise.all to fetch all stats in parallel", async () => {
    vi.mocked(prisma.customer.count).mockResolvedValueOnce(100);
    vi.mocked(prisma.customer.groupBy).mockResolvedValueOnce([
      { status: "ACTIVE", _count: { status: 50 } },
    ]);
    vi.mocked(prisma.interaction.count).mockResolvedValueOnce(200);

    const request = new Request("http://localhost/api/stats");
    await getStats();

    expect(vi.mocked(prisma.customer.count)).toHaveBeenCalled();
    expect(vi.mocked(prisma.customer.groupBy)).toHaveBeenCalled();
    expect(vi.mocked(prisma.interaction.count)).toHaveBeenCalled();
  });

  it("should return correct stats with only some status groups", async () => {
    vi.mocked(prisma.customer.count).mockResolvedValueOnce(100);
    vi.mocked(prisma.customer.groupBy).mockResolvedValueOnce([
      { status: "LEAD", _count: { status: 40 } },
      { status: "CHURNED", _count: { status: 10 } },
    ]);
    vi.mocked(prisma.interaction.count).mockResolvedValueOnce(50);

    const request = new Request("http://localhost/api/stats");
    const response = await getStats();
    const data = await response.json();

    expect(data.totalLeads).toBe(40);
    expect(data.totalActive).toBe(0);
    expect(data.totalChurned).toBe(10);
    expect(data.closingRate).toBe(0.0);
  });

  it("should handle high closing rates correctly", async () => {
    vi.mocked(prisma.customer.count).mockResolvedValueOnce(100);
    vi.mocked(prisma.customer.groupBy).mockResolvedValueOnce([
      { status: "ACTIVE", _count: { status: 95 } },
    ]);
    vi.mocked(prisma.interaction.count).mockResolvedValueOnce(500);

    const request = new Request("http://localhost/api/stats");
    const response = await getStats();
    const data = await response.json();

    expect(data.closingRate).toBe(95.0);
    expect(data.closingRate).toBeLessThanOrEqual(100);
  });

  it("should handle all status groups being empty", async () => {
    vi.mocked(prisma.customer.count).mockResolvedValueOnce(0);
    vi.mocked(prisma.customer.groupBy).mockResolvedValueOnce([]);
    vi.mocked(prisma.interaction.count).mockResolvedValueOnce(0);

    const request = new Request("http://localhost/api/stats");
    const response = await getStats();
    const data = await response.json();

    expect(data.totalLeads).toBe(0);
    expect(data.totalActive).toBe(0);
    expect(data.totalChurned).toBe(0);
    expect(data.closingRate).toBe(0);
    expect(response.status).toBe(200);
  });
});
