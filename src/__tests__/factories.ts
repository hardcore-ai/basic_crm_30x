import { faker } from "@faker-js/faker";

export interface CustomerData {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  _count: { interactions: number };
}

export interface InteractionData {
  id: string;
  customerId: string;
  type: string;
  notes: string;
  date: Date;
  createdAt: Date;
  customer?: {
    id: string;
    name: string;
    company: string | null;
  };
}

/**
 * Factory para crear datos de prueba de clientes
 */
export function createCustomer(
  overrides?: Partial<CustomerData>,
): CustomerData {
  const id = faker.string.uuid();
  return {
    id,
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number() || null,
    company: faker.company.name() || null,
    status: faker.helpers.arrayElement(["LEAD", "ACTIVE", "CHURNED"]),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    _count: { interactions: faker.number.int({ min: 0, max: 10 }) },
    ...overrides,
  };
}

/**
 * Factory para crear múltiples clientes
 */
export function createCustomers(count: number = 5): CustomerData[] {
  return Array.from({ length: count }, () => createCustomer());
}

/**
 * Factory para crear datos de prueba de interacciones
 */
export function createInteraction(
  overrides?: Partial<InteractionData>,
  customerId?: string,
): InteractionData {
  const id = faker.string.uuid();
  const cId = customerId || faker.string.uuid();

  return {
    id,
    customerId: cId,
    type: faker.helpers.arrayElement(["EMAIL", "CALL", "MEETING", "NOTE"]),
    notes: faker.lorem.paragraph(),
    date: faker.date.recent(),
    createdAt: faker.date.recent(),
    ...overrides,
  };
}

/**
 * Factory para crear múltiples interacciones
 */
export function createInteractions(
  count: number = 5,
  customerId?: string,
): InteractionData[] {
  return Array.from({ length: count }, () =>
    createInteraction(undefined, customerId),
  );
}

/**
 * Factory para crear payloads de solicitudes POST/PUT
 */
export function createCustomerPayload(
  overrides?: Partial<
    Omit<CustomerData, "id" | "createdAt" | "updatedAt" | "_count">
  >,
) {
  return {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number() || null,
    company: faker.company.name() || null,
    status: "LEAD",
    ...overrides,
  };
}

/**
 * Factory para crear payloads de solicitudes de interacciones
 */
export function createInteractionPayload(
  overrides?: Partial<Omit<InteractionData, "id" | "createdAt">>,
) {
  return {
    customerId: faker.string.uuid(),
    type: faker.helpers.arrayElement(["EMAIL", "CALL", "MEETING", "NOTE"]),
    notes: faker.lorem.paragraph(),
    date: faker.date.recent().toISOString(),
    ...overrides,
  };
}
