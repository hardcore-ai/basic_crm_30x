# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Start

```bash
npm install                    # Install dependencies
npx prisma generate          # Generate Prisma client
npx prisma migrate dev       # Run database migrations
npm run dev                  # Start development server (http://localhost:3000)
```

## Stack

- **Runtime**: Node.js 20+ with TypeScript
- **Framework**: Next.js 16 (App Router)
- **Frontend**: React 19 with Server Components (RSC) by default
- **Styling**: Tailwind CSS v4
- **Database**: PostgreSQL (Neon DB) with Prisma 7.x ORM
- **Testing**: Vitest + React Testing Library + Supertest
- **Icons**: Lucide React

## Commands

### Development

- `npm run dev` — Start dev server with hot reload
- `npm run build` — Production build
- `npm start` — Run production server

### Database

- `npx prisma generate` — Generate Prisma client (runs on `npm install`)
- `npx prisma migrate dev` — Create and apply migrations (creates migration files)
- `npx prisma migrate deploy` — Apply migrations in production
- `npx prisma studio` — Open Prisma visual database editor

### Testing

- `npm test` — Run all tests once
- `npm run test:watch` — Watch mode for TDD
- `npm run test:coverage` — Generate coverage report
- `npm test -- src/__tests__/api/customers.test.ts` — Run single test file

### Linting

- `npm run lint` — Run ESLint

## Project Structure

```
src/
├── app/                          # Next.js App Router (pages & API)
│   ├── page.tsx                 # Root page
│   ├── layout.tsx               # Root layout with providers
│   ├── (dashboard)/             # Dashboard route group
│   │   ├── layout.tsx          # Dashboard layout with Sidebar
│   │   ├── dashboard/page.tsx  # Main dashboard / home
│   │   ├── customers/
│   │   │   ├── page.tsx        # Customer list view
│   │   │   └── [id]/page.tsx   # Customer detail view
│   │   ├── interactions/page.tsx # Interactions timeline view
│   │   └── settings/page.tsx    # Settings page
│   └── api/                      # API endpoints
│       ├── customers/
│       │   ├── route.ts         # GET (list), POST (create)
│       │   └── [id]/route.ts   # GET (detail), PATCH, DELETE
│       ├── interactions/route.ts # POST (create interaction)
│       └── stats/route.ts        # GET (dashboard metrics)
├── components/                   # Reusable React components
│   ├── Sidebar.tsx              # Navigation sidebar (client)
│   ├── CustomerTable.tsx        # Customer list table (client)
│   ├── AddInteractionModal.tsx  # Add interaction form (client)
│   ├── InteractionTimeline.tsx  # Timeline view (RSC)
│   ├── InteractionsList.tsx     # Interactions list (RSC)
│   └── SettingsClient.tsx       # Settings form (client)
├── lib/                          # Utilities and helpers
│   ├── prisma.ts                # Prisma client singleton
│   └── useAgentProfile.ts       # Hook for agent profile
└── __tests__/                    # Test files (collocated structure)
    ├── setup.ts                 # Vitest setup & test utilities
    ├── factories.ts             # Test data factories
    └── api/                     # API route tests
        ├── customers.test.ts
        ├── customers-id.test.ts
        ├── interactions.test.ts
        └── stats.test.ts
```

## Architecture & Data Flow

### Component Structure

- **React Server Components (RSC)** are the default. Use `"use client"` only when you need:
  - Event handlers (`onClick`, `onChange`, etc.)
  - React hooks (`useState`, `useEffect`, etc.)
  - Browser APIs (`localStorage`, `navigator`, etc.)
- Timeline/list views are RSC with server-side data fetching
- Forms and tables are client components with controlled state

### Data Flow: Pages → API Routes → Prisma → Database

```
User Action (browser)
    ↓
Client Component (form/state)
    ↓
API Route (validation + business logic)
    ↓
Prisma (ORM query)
    ↓
PostgreSQL (persistence)
    ↓
Response → Client Component → Re-render
```

### Database Schema

**Users** — CRM application users

- `id` (CUID), `email` (unique), `name`, `role` (AGENT|ADMIN)
- Timestamps: `createdAt`, `updatedAt`

**Customers** — Contacts/prospects

- `id` (CUID), `email` (unique), `name`, `phone`, `company`
- `status` (LEAD|ACTIVE|CHURNED) — lifecycle tracking
- Timestamps: `createdAt`, `updatedAt`
- Relation: `interactions` (one-to-many, cascade delete)

**Interactions** — Engagement log

- `id` (CUID), `customerId` (FK), `type` (EMAIL|CALL|MEETING|NOTE), `notes` (text), `date`
- Timestamps: `createdAt`
- Relation: `customer` (many-to-one, FK with cascade delete)

**Key Constraint**: Deleting a customer cascades to delete all interactions.

## Conventions

### React & Next.js

- Use RSC by default in pages; only add `"use client"` when necessary
- Server Actions are **not used** — API routes handle all mutations
- All data mutations go through dedicated API routes (`/api/customers`, `/api/interactions`, etc.)
- API routes validate input and return typed responses

### Database & Prisma

- Always use `prisma generate` after schema changes
- Migrations are **not committed** (`.gitignore` includes `/prisma/migrations`)
- Never return raw Prisma objects to the frontend — filter sensitive fields
- Use `lib/prisma.ts` for the Prisma client singleton

### File Organization

- Components go in `src/components/` (Lucide React for icons)
- API logic in `src/app/api/` (organized by resource)
- Page components in `src/app/(dashboard)/`
- Utilities/helpers in `src/lib/`
- Tests colocated in `src/__tests__/` with factories and setup

### Naming

- Components: PascalCase (e.g., `CustomerTable.tsx`)
- Functions/hooks: camelCase (e.g., `useAgentProfile()`)
- API routes: lowercase resource names (e.g., `/api/customers/[id]/route.ts`)

## Adding a New Feature

### 1. Add database schema

Edit `prisma/schema.prisma`:

```prisma
model NewEntity {
  id String @id @default(cuid())
  name String
  createdAt DateTime @default(now())
}
```

### 2. Create migration

```bash
npx prisma migrate dev --name add_new_entity
```

### 3. Add API route

Create `src/app/api/newentity/route.ts`:

- `GET` → list/fetch
- `POST` → create with validation
- `PATCH/DELETE` → update/delete in `[id]/route.ts`

### 4. Add page/component

- Page: `src/app/(dashboard)/newentity/page.tsx` (RSC for display)
- Form: `src/components/NewEntityForm.tsx` (client component with `"use client"`)

### 5. Write tests

Create `src/__tests__/api/newentity.test.ts`:

- Test happy path (success case)
- Test validation errors
- Test edge cases (not found, unauthorized, etc.)
- Use factories for test data

## Testing

### Test Structure

All tests use **Vitest** + **Supertest** (for API routes):

- Test happy paths (success cases)
- Test error scenarios (validation, not found, bad input)
- Test edge cases
- Use test factories (`src/__tests__/factories.ts`) for consistent data

### Running Tests

```bash
npm test                              # Run all once
npm run test:watch                    # Watch mode
npm run test:coverage                 # Coverage report
npm test -- api/customers.test.ts    # Single file
```

### Example Test Pattern

```typescript
import { describe, it, expect } from "vitest";
import request from "supertest";
import { createCustomer } from "../factories";

describe("GET /api/customers", () => {
  it("should return list of customers", async () => {
    const res = await request("http://localhost:3000").get("/api/customers");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("should return 404 when customer not found", async () => {
    const res = await request("http://localhost:3000").get(
      "/api/customers/invalid-id",
    );
    expect(res.status).toBe(404);
  });
});
```

## Security

- **Never commit** `.env.local`, `.env.production.local`, or any secrets
- **Never return** raw Prisma objects — always filter sensitive data before sending to client
- **Always validate** user input before database operations
- Use parameterized queries (Prisma does this automatically)
- No hardcoded API keys in source code

## Environment Variables

Required in `.env.local`:

```
DATABASE_URL="postgresql://user:password@host/dbname"
```

Get the connection string from Neon console or contact the database owner.

## Debugging

### Prisma Studio

```bash
npx prisma studio
```

Visual database explorer at `http://localhost:5555`

### Next.js Debugging

Dev server logs appear in terminal — watch for:

- Prisma query errors
- API validation errors
- Type errors (TypeScript)

### Test Debugging

```bash
npm run test:watch
# Edit test, watch reruns automatically
```

## Links

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React 19 Docs](https://react.dev)
- [Vitest Docs](https://vitest.dev/)
