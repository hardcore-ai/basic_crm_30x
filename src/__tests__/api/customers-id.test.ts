import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  GET as getCustomerById,
  PUT as updateCustomer,
  DELETE as deleteCustomer,
} from "@/app/api/customers/[id]/route";
import { prisma } from "@/lib/prisma";
import {
  createCustomer as customerFactory,
  createInteractions,
  createCustomerPayload,
} from "../factories";

vi.mock("@/lib/prisma");

const mockParams = (id: string) => Promise.resolve({ id });

describe("GET /api/customers/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return a customer with all interactions", async () => {
    const customerId = "cust-123";
    const mockInteractions = createInteractions(3, customerId);
    const mockCustomer = customerFactory({
      id: customerId,
    });

    vi.mocked(prisma.customer.findUnique).mockResolvedValueOnce({
      ...mockCustomer,
      interactions: mockInteractions,
    });

    const response = await getCustomerById(
      new Request("http://localhost/api/customers/cust-123"),
      { params: mockParams(customerId) },
    );
    const data = await response.json();

    expect(prisma.customer.findUnique).toHaveBeenCalledWith({
      where: { id: customerId },
      include: {
        interactions: {
          orderBy: { date: "desc" },
        },
        _count: { select: { interactions: true } },
      },
    });
    expect(data.id).toBe(customerId);
    expect(response.status).toBe(200);
  });

  it("should return 404 when customer does not exist", async () => {
    const customerId = "nonexistent-id";
    vi.mocked(prisma.customer.findUnique).mockResolvedValueOnce(null);

    const response = await getCustomerById(
      new Request("http://localhost/api/customers/nonexistent-id"),
      { params: mockParams(customerId) },
    );
    const data = await response.json();

    expect(data).toEqual({ error: "Customer not found" });
    expect(response.status).toBe(404);
  });

  it("should include interactions ordered by date descending", async () => {
    const customerId = "cust-456";
    const now = new Date();
    const mockInteractions = [
      {
        id: "int-1",
        customerId,
        type: "CALL",
        notes: "Recent call",
        date: new Date(now.getTime() + 1000),
        createdAt: now,
      },
      {
        id: "int-2",
        customerId,
        type: "EMAIL",
        notes: "Old email",
        date: new Date(now.getTime() - 1000),
        createdAt: now,
      },
    ];
    const mockCustomer = customerFactory({ id: customerId });

    vi.mocked(prisma.customer.findUnique).mockResolvedValueOnce({
      ...mockCustomer,
      interactions: mockInteractions,
    });

    const response = await getCustomerById(
      new Request("http://localhost/api/customers/cust-456"),
      { params: mockParams(customerId) },
    );
    const data = await response.json();

    expect(data.interactions[0].date > data.interactions[1].date).toBe(true);
    expect(response.status).toBe(200);
  });

  it("should handle database errors gracefully", async () => {
    const customerId = "cust-789";
    const dbError = new Error("Database connection failed");
    vi.mocked(prisma.customer.findUnique).mockRejectedValueOnce(dbError);

    const response = await getCustomerById(
      new Request("http://localhost/api/customers/cust-789"),
      { params: mockParams(customerId) },
    );
    const data = await response.json();

    expect(data).toEqual({ error: "Failed to fetch customer" });
    expect(response.status).toBe(500);
  });

  it("should return customer with zero interactions", async () => {
    const customerId = "cust-no-interactions";
    const mockCustomer = customerFactory({
      id: customerId,
      _count: { interactions: 0 },
    });

    vi.mocked(prisma.customer.findUnique).mockResolvedValueOnce({
      ...mockCustomer,
      interactions: [],
    });

    const response = await getCustomerById(
      new Request("http://localhost/api/customers/cust-no-interactions"),
      { params: mockParams(customerId) },
    );
    const data = await response.json();

    expect(data.interactions).toEqual([]);
    expect(response.status).toBe(200);
  });
});

describe("PUT /api/customers/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should update a customer with valid data", async () => {
    const customerId = "cust-123";
    const updatePayload = {
      name: "Updated Name",
      email: "updated@example.com",
      phone: "9876543210",
      company: "New Company",
      status: "ACTIVE",
    };
    const mockUpdatedCustomer = customerFactory({
      id: customerId,
      ...updatePayload,
    });

    vi.mocked(prisma.customer.update).mockResolvedValueOnce(
      mockUpdatedCustomer,
    );

    const request = new Request("http://localhost/api/customers/cust-123", {
      method: "PUT",
      body: JSON.stringify(updatePayload),
    });

    const response = await updateCustomer(request, {
      params: mockParams(customerId),
    });
    const data = await response.json();

    expect(prisma.customer.update).toHaveBeenCalledWith({
      where: { id: customerId },
      data: updatePayload,
    });
    expect(data.name).toBe(updatePayload.name);
    expect(data.status).toBe("ACTIVE");
    expect(response.status).toBe(200);
  });

  it("should update only specific fields", async () => {
    const customerId = "cust-456";
    const partialUpdate = {
      name: "New Name",
      email: "newemail@example.com",
      phone: null,
      company: null,
      status: "CHURNED",
    };
    const mockUpdatedCustomer = customerFactory(partialUpdate);

    vi.mocked(prisma.customer.update).mockResolvedValueOnce(
      mockUpdatedCustomer,
    );

    const request = new Request("http://localhost/api/customers/cust-456", {
      method: "PUT",
      body: JSON.stringify(partialUpdate),
    });

    const response = await updateCustomer(request, {
      params: mockParams(customerId),
    });

    expect(prisma.customer.update).toHaveBeenCalledWith({
      where: { id: customerId },
      data: partialUpdate,
    });
    expect(response.status).toBe(200);
  });

  it("should handle database errors during update", async () => {
    const customerId = "cust-789";
    const updatePayload = createCustomerPayload();
    const dbError = new Error("Customer not found");

    vi.mocked(prisma.customer.update).mockRejectedValueOnce(dbError);

    const request = new Request("http://localhost/api/customers/cust-789", {
      method: "PUT",
      body: JSON.stringify(updatePayload),
    });

    const response = await updateCustomer(request, {
      params: mockParams(customerId),
    });
    const data = await response.json();

    expect(data).toEqual({ error: "Failed to update customer" });
    expect(response.status).toBe(500);
  });

  it("should handle null values in update", async () => {
    const customerId = "cust-nulls";
    const updatePayload = {
      name: "Name Only",
      email: "test@example.com",
      phone: null,
      company: null,
      status: "LEAD",
    };
    const mockUpdatedCustomer = customerFactory({
      id: customerId,
      ...updatePayload,
    });

    vi.mocked(prisma.customer.update).mockResolvedValueOnce(
      mockUpdatedCustomer,
    );

    const request = new Request("http://localhost/api/customers/cust-nulls", {
      method: "PUT",
      body: JSON.stringify(updatePayload),
    });

    const response = await updateCustomer(request, {
      params: mockParams(customerId),
    });

    expect(prisma.customer.update).toHaveBeenCalledWith({
      where: { id: customerId },
      data: updatePayload,
    });
    expect(response.status).toBe(200);
  });

  it("should change customer status lifecycle", async () => {
    const customerId = "cust-status-change";
    const statuses = ["LEAD", "ACTIVE", "CHURNED"];

    for (const status of statuses) {
      vi.clearAllMocks();
      const mockCustomer = customerFactory({ id: customerId, status });
      vi.mocked(prisma.customer.update).mockResolvedValueOnce(mockCustomer);

      const request = new Request(
        "http://localhost/api/customers/cust-status-change",
        {
          method: "PUT",
          body: JSON.stringify({
            status,
            name: "Test",
            email: "test@test.com",
            phone: null,
            company: null,
          }),
        },
      );

      const response = await updateCustomer(request, {
        params: mockParams(customerId),
      });
      const data = await response.json();

      expect(data.status).toBe(status);
      expect(response.status).toBe(200);
    }
  });
});

describe("DELETE /api/customers/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should delete a customer successfully", async () => {
    const customerId = "cust-to-delete";
    vi.mocked(prisma.customer.delete).mockResolvedValueOnce(
      customerFactory({ id: customerId }),
    );

    const request = new Request(
      "http://localhost/api/customers/cust-to-delete",
      {
        method: "DELETE",
      },
    );

    const response = await deleteCustomer(request, {
      params: mockParams(customerId),
    });
    const data = await response.json();

    expect(prisma.customer.delete).toHaveBeenCalledWith({
      where: { id: customerId },
    });
    expect(data).toEqual({ success: true });
    expect(response.status).toBe(200);
  });

  it("should handle deletion of non-existent customer", async () => {
    const customerId = "nonexistent-id";
    const dbError = new Error("Customer not found");

    vi.mocked(prisma.customer.delete).mockRejectedValueOnce(dbError);

    const request = new Request(
      "http://localhost/api/customers/nonexistent-id",
      {
        method: "DELETE",
      },
    );

    const response = await deleteCustomer(request, {
      params: mockParams(customerId),
    });
    const data = await response.json();

    expect(data).toEqual({ error: "Failed to delete customer" });
    expect(response.status).toBe(500);
  });

  it("should handle database errors during deletion", async () => {
    const customerId = "cust-error";
    const dbError = new Error("Database connection lost");

    vi.mocked(prisma.customer.delete).mockRejectedValueOnce(dbError);

    const request = new Request("http://localhost/api/customers/cust-error", {
      method: "DELETE",
    });

    const response = await deleteCustomer(request, {
      params: mockParams(customerId),
    });
    const data = await response.json();

    expect(data).toEqual({ error: "Failed to delete customer" });
    expect(response.status).toBe(500);
  });

  it("should cascade delete customer interactions", async () => {
    const customerId = "cust-with-interactions";
    vi.mocked(prisma.customer.delete).mockResolvedValueOnce(
      customerFactory({ id: customerId }),
    );

    const request = new Request(
      "http://localhost/api/customers/cust-with-interactions",
      {
        method: "DELETE",
      },
    );

    const response = await deleteCustomer(request, {
      params: mockParams(customerId),
    });

    expect(prisma.customer.delete).toHaveBeenCalledWith({
      where: { id: customerId },
    });
    expect(response.status).toBe(200);
  });
});
