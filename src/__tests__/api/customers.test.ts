import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { NextResponse } from "next/server";
import {
  GET as getCustomers,
  POST as createCustomer,
} from "@/app/api/customers/route";
import { prisma } from "@/lib/prisma";
import {
  createCustomer as customerFactory,
  createCustomers,
  createCustomerPayload,
} from "../factories";

vi.mock("@/lib/prisma");

describe("GET /api/customers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return all customers ordered by most recent first", async () => {
    const mockCustomers = createCustomers(3);
    vi.mocked(prisma.customer.findMany).mockResolvedValueOnce(mockCustomers);

    const response = await getCustomers();
    const data = await response.json();

    expect(prisma.customer.findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { interactions: true },
        },
      },
    });
    expect(data).toEqual(mockCustomers);
    expect(response.status).toBe(200);
  });

  it("should return empty array when no customers exist", async () => {
    vi.mocked(prisma.customer.findMany).mockResolvedValueOnce([]);

    const response = await getCustomers();
    const data = await response.json();

    expect(data).toEqual([]);
    expect(response.status).toBe(200);
  });

  it("should handle database errors gracefully", async () => {
    const dbError = new Error("Database connection failed");
    vi.mocked(prisma.customer.findMany).mockRejectedValueOnce(dbError);

    const response = await getCustomers();
    const data = await response.json();

    expect(data).toEqual({ error: "Failed to fetch customers" });
    expect(response.status).toBe(500);
  });

  it("should include customer interaction counts", async () => {
    const mockCustomers = [
      customerFactory({ _count: { interactions: 5 } }),
      customerFactory({ _count: { interactions: 0 } }),
    ];
    vi.mocked(prisma.customer.findMany).mockResolvedValueOnce(mockCustomers);

    const response = await getCustomers();
    const data = await response.json();

    expect(data[0]._count.interactions).toBe(5);
    expect(data[1]._count.interactions).toBe(0);
  });
});

describe("POST /api/customers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a customer with valid data", async () => {
    const payload = createCustomerPayload({
      name: "John Doe",
      email: "john@example.com",
    });
    const mockCustomer = customerFactory(payload);
    vi.mocked(prisma.customer.create).mockResolvedValueOnce(mockCustomer);

    const request = new Request("http://localhost/api/customers", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const response = await createCustomer(request);
    const data = await response.json();

    expect(prisma.customer.create).toHaveBeenCalledWith({
      data: {
        name: payload.name,
        email: payload.email,
        phone: payload.phone || null,
        company: payload.company || null,
        status: payload.status || "LEAD",
      },
    });
    expect(data).toEqual(mockCustomer);
    expect(response.status).toBe(201);
  });

  it("should set default status to LEAD when not provided", async () => {
    const payload = {
      name: "Jane Doe",
      email: "jane@example.com",
      phone: "1234567890",
      company: "Acme Corp",
    };
    const mockCustomer = customerFactory({
      ...payload,
      status: "LEAD",
    });
    vi.mocked(prisma.customer.create).mockResolvedValueOnce(mockCustomer);

    const request = new Request("http://localhost/api/customers", {
      method: "POST",
      body: JSON.stringify({
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        company: payload.company,
      }),
    });

    const response = await createCustomer(request);

    expect(prisma.customer.create).toHaveBeenCalledWith({
      data: {
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        company: payload.company,
        status: "LEAD",
      },
    });
    expect(response.status).toBe(201);
  });

  it("should return 400 when name is missing", async () => {
    const payload = {
      email: "test@example.com",
      phone: "1234567890",
    };

    const request = new Request("http://localhost/api/customers", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const response = await createCustomer(request);
    const data = await response.json();

    expect(data).toEqual({ error: "Name and email are required" });
    expect(response.status).toBe(400);
    expect(prisma.customer.create).not.toHaveBeenCalled();
  });

  it("should return 400 when email is missing", async () => {
    const payload = {
      name: "John Doe",
      phone: "1234567890",
    };

    const request = new Request("http://localhost/api/customers", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const response = await createCustomer(request);
    const data = await response.json();

    expect(data).toEqual({ error: "Name and email are required" });
    expect(response.status).toBe(400);
    expect(prisma.customer.create).not.toHaveBeenCalled();
  });

  it("should return 400 when both name and email are missing", async () => {
    const payload = {
      phone: "1234567890",
    };

    const request = new Request("http://localhost/api/customers", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const response = await createCustomer(request);
    const data = await response.json();

    expect(data).toEqual({ error: "Name and email are required" });
    expect(response.status).toBe(400);
  });

  it("should handle empty body request", async () => {
    const request = new Request("http://localhost/api/customers", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const response = await createCustomer(request);
    const data = await response.json();

    expect(data).toEqual({ error: "Name and email are required" });
    expect(response.status).toBe(400);
  });

  it("should handle database errors during creation", async () => {
    const payload = createCustomerPayload();
    const dbError = new Error("Unique constraint failed on email");
    vi.mocked(prisma.customer.create).mockRejectedValueOnce(dbError);

    const request = new Request("http://localhost/api/customers", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const response = await createCustomer(request);
    const data = await response.json();

    expect(data).toEqual({ error: "Failed to create customer" });
    expect(response.status).toBe(500);
  });

  it("should accept null values for optional fields", async () => {
    const payload = {
      name: "John Doe",
      email: "john@example.com",
      phone: null,
      company: null,
    };
    const mockCustomer = customerFactory(payload);
    vi.mocked(prisma.customer.create).mockResolvedValueOnce(mockCustomer);

    const request = new Request("http://localhost/api/customers", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const response = await createCustomer(request);

    expect(prisma.customer.create).toHaveBeenCalledWith({
      data: {
        name: payload.name,
        email: payload.email,
        phone: null,
        company: null,
        status: "LEAD",
      },
    });
    expect(response.status).toBe(201);
  });
});
