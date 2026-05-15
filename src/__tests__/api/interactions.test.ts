import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  GET as getInteractions,
  POST as createInteraction,
} from "@/app/api/interactions/route";
import { prisma } from "@/lib/prisma";
import {
  createInteraction as interactionFactory,
  createInteractions,
  createInteractionPayload,
  createCustomer as customerFactory,
} from "../factories";

vi.mock("@/lib/prisma");

describe("GET /api/interactions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return all interactions with customer details when no customerId filter", async () => {
    const mockCustomers = Array.from({ length: 2 }, () => customerFactory());
    const mockInteractions = [
      interactionFactory({
        customer: {
          id: mockCustomers[0].id,
          name: mockCustomers[0].name,
          company: mockCustomers[0].company,
        },
      }),
      interactionFactory({
        customer: {
          id: mockCustomers[1].id,
          name: mockCustomers[1].name,
          company: mockCustomers[1].company,
        },
      }),
    ];

    vi.mocked(prisma.interaction.findMany).mockResolvedValueOnce(
      mockInteractions,
    );

    const request = new Request("http://localhost/api/interactions");
    const response = await getInteractions(request);
    const data = await response.json();

    expect(prisma.interaction.findMany).toHaveBeenCalledWith({
      where: undefined,
      orderBy: { date: "desc" },
      include: {
        customer: {
          select: { id: true, name: true, company: true },
        },
      },
    });
    expect(data).toHaveLength(2);
    expect(data[0].customer).toBeDefined();
    expect(response.status).toBe(200);
  });

  it("should filter interactions by customerId when provided", async () => {
    const customerId = "cust-123";
    const mockInteractions = createInteractions(3, customerId);

    vi.mocked(prisma.interaction.findMany).mockResolvedValueOnce(
      mockInteractions,
    );

    const request = new Request(
      `http://localhost/api/interactions?customerId=${customerId}`,
    );
    const response = await getInteractions(request);
    const data = await response.json();

    expect(prisma.interaction.findMany).toHaveBeenCalledWith({
      where: { customerId },
      orderBy: { date: "desc" },
      include: undefined,
    });
    expect(data).toHaveLength(3);
    expect(data.every((i) => i.customerId === customerId)).toBe(true);
    expect(response.status).toBe(200);
  });

  it("should return interactions ordered by date descending", async () => {
    const customerId = "cust-456";
    const now = new Date();
    const mockInteractions = [
      interactionFactory({
        customerId,
        date: new Date(now.getTime() + 2000),
      }),
      interactionFactory({
        customerId,
        date: new Date(now.getTime() + 1000),
      }),
      interactionFactory({
        customerId,
        date: new Date(now.getTime()),
      }),
    ];

    vi.mocked(prisma.interaction.findMany).mockResolvedValueOnce(
      mockInteractions,
    );

    const request = new Request(
      `http://localhost/api/interactions?customerId=${customerId}`,
    );
    const response = await getInteractions(request);
    const data = await response.json();

    expect(data[0].date >= data[1].date).toBe(true);
    expect(data[1].date >= data[2].date).toBe(true);
    expect(response.status).toBe(200);
  });

  it("should return empty array when no interactions exist", async () => {
    vi.mocked(prisma.interaction.findMany).mockResolvedValueOnce([]);

    const request = new Request("http://localhost/api/interactions");
    const response = await getInteractions(request);
    const data = await response.json();

    expect(data).toEqual([]);
    expect(response.status).toBe(200);
  });

  it("should return empty array when customer has no interactions", async () => {
    const customerId = "cust-no-interactions";
    vi.mocked(prisma.interaction.findMany).mockResolvedValueOnce([]);

    const request = new Request(
      `http://localhost/api/interactions?customerId=${customerId}`,
    );
    const response = await getInteractions(request);
    const data = await response.json();

    expect(data).toEqual([]);
    expect(response.status).toBe(200);
  });

  it("should handle database errors gracefully", async () => {
    const dbError = new Error("Database connection failed");
    vi.mocked(prisma.interaction.findMany).mockRejectedValueOnce(dbError);

    const request = new Request("http://localhost/api/interactions");
    const response = await getInteractions(request);
    const data = await response.json();

    expect(data).toEqual({ error: "Failed to fetch interactions" });
    expect(response.status).toBe(500);
  });

  it("should exclude customer details when filtering by customerId", async () => {
    const customerId = "cust-789";
    const mockInteractions = createInteractions(2, customerId);

    vi.mocked(prisma.interaction.findMany).mockResolvedValueOnce(
      mockInteractions,
    );

    const request = new Request(
      `http://localhost/api/interactions?customerId=${customerId}`,
    );
    const response = await getInteractions(request);
    const data = await response.json();

    expect(prisma.interaction.findMany).toHaveBeenCalledWith({
      where: { customerId },
      orderBy: { date: "desc" },
      include: undefined,
    });
    expect(response.status).toBe(200);
  });
});

describe("POST /api/interactions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create an interaction with valid data", async () => {
    const payload = createInteractionPayload({
      type: "CALL",
      notes: "Customer follow-up call",
    });
    const mockInteraction = interactionFactory(payload);

    vi.mocked(prisma.interaction.create).mockResolvedValueOnce(mockInteraction);

    const request = new Request("http://localhost/api/interactions", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const response = await createInteraction(request);
    const data = await response.json();

    expect(prisma.interaction.create).toHaveBeenCalledWith({
      data: {
        customerId: payload.customerId,
        type: payload.type,
        notes: payload.notes,
        date: new Date(payload.date),
      },
    });
    expect(data.type).toBe("CALL");
    expect(data.notes).toBe("Customer follow-up call");
    expect(response.status).toBe(201);
  });

  it("should create interactions of all types", async () => {
    const types = ["EMAIL", "CALL", "MEETING", "NOTE"];

    for (const type of types) {
      vi.clearAllMocks();
      const payload = createInteractionPayload({ type });
      const mockInteraction = interactionFactory(payload);

      vi.mocked(prisma.interaction.create).mockResolvedValueOnce(
        mockInteraction,
      );

      const request = new Request("http://localhost/api/interactions", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const response = await createInteraction(request);
      const data = await response.json();

      expect(data.type).toBe(type);
      expect(response.status).toBe(201);
    }
  });

  it("should use current date when date is not provided", async () => {
    const payload = {
      customerId: "cust-123",
      type: "CALL",
      notes: "Follow-up call",
    };
    const mockInteraction = interactionFactory(payload);

    vi.mocked(prisma.interaction.create).mockResolvedValueOnce(mockInteraction);

    const request = new Request("http://localhost/api/interactions", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const response = await createInteraction(request);

    const callArgs = vi.mocked(prisma.interaction.create).mock.calls[0][0];
    expect(callArgs.data.date).toBeInstanceOf(Date);
    expect(response.status).toBe(201);
  });

  it("should use provided date when available", async () => {
    const testDate = new Date("2024-01-15T10:30:00Z");
    const payload = createInteractionPayload({
      date: testDate.toISOString(),
    });
    const mockInteraction = interactionFactory(payload);

    vi.mocked(prisma.interaction.create).mockResolvedValueOnce(mockInteraction);

    const request = new Request("http://localhost/api/interactions", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const response = await createInteraction(request);
    const callArgs = vi.mocked(prisma.interaction.create).mock.calls[0][0];

    expect(callArgs.data.date).toEqual(new Date(testDate.toISOString()));
    expect(response.status).toBe(201);
  });

  it("should handle database errors during creation", async () => {
    const payload = createInteractionPayload();
    const dbError = new Error("Foreign key constraint failed");

    vi.mocked(prisma.interaction.create).mockRejectedValueOnce(dbError);

    const request = new Request("http://localhost/api/interactions", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const response = await createInteraction(request);
    const data = await response.json();

    expect(data).toEqual({ error: "Failed to create interaction" });
    expect(response.status).toBe(500);
  });

  it("should handle invalid JSON in request body", async () => {
    const request = new Request("http://localhost/api/interactions", {
      method: "POST",
      body: "invalid json",
    });

    const response = await createInteraction(request);
    const data = await response.json();

    expect(data).toEqual({ error: "Failed to create interaction" });
    expect(response.status).toBe(500);
  });

  it("should accept minimal interaction data", async () => {
    const payload = {
      customerId: "cust-minimal",
      type: "NOTE",
      notes: "Minimal note",
    };
    const mockInteraction = interactionFactory(payload);

    vi.mocked(prisma.interaction.create).mockResolvedValueOnce(mockInteraction);

    const request = new Request("http://localhost/api/interactions", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const response = await createInteraction(request);

    expect(prisma.interaction.create).toHaveBeenCalled();
    expect(response.status).toBe(201);
  });

  it("should create interaction with long notes", async () => {
    const longNotes = "x".repeat(5000);
    const payload = createInteractionPayload({
      notes: longNotes,
    });
    const mockInteraction = interactionFactory(payload);

    vi.mocked(prisma.interaction.create).mockResolvedValueOnce(mockInteraction);

    const request = new Request("http://localhost/api/interactions", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const response = await createInteraction(request);

    const callArgs = vi.mocked(prisma.interaction.create).mock.calls[0][0];
    expect(callArgs.data.notes).toBe(longNotes);
    expect(response.status).toBe(201);
  });
});
