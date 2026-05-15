# CRM Application

A modern Customer Relationship Management (CRM) application built with Next.js 16, TypeScript, and PostgreSQL.

## Features

- **User Management**: Create and manage CRM users with role-based access (AGENT, ADMIN)
- **Customer Management**: Track customers/prospects with lifecycle status (LEAD, ACTIVE, CHURNED)
- **Interaction Tracking**: Log all customer engagement activities (EMAIL, CALL, MEETING, NOTE)
- **Dashboard**: Overview of key metrics and customer statistics
- **Responsive UI**: Tailwind CSS v4 for modern, mobile-friendly interface

## Tech Stack

- **Frontend**: React 19, Next.js 16 (App Router), TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: PostgreSQL (Neon DB) with Prisma ORM
- **Testing**: Vitest
- **Runtime**: Node.js 20+

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database (or Neon DB)

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Set up environment variables in `.env.local`:

```
DATABASE_URL="postgresql://..."
```

4. Generate Prisma client:

```bash
npx prisma generate
```

5. Run database migrations:

```bash
npx prisma migrate dev
```

6. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm test` - Run tests with Vitest

## Project Structure

```
src/
├── app/                 # Next.js pages and API routes
│   ├── (dashboard)/    # Dashboard pages
│   └── api/            # API endpoints
├── components/         # React components
├── lib/               # Utility functions and helpers
└── styles/            # Global styles
```

## Database Schema

### Users

- ID, Email (unique), Name, Role, Created/Updated timestamps

### Customers

- ID, Email (unique), Name, Phone, Company, Status, Created/Updated timestamps

### Interactions

- ID, Customer ID (FK), Type, Notes, Date, Created timestamp

Interactions automatically cascade delete when a customer is deleted.

## Development Guidelines

- Use React Server Components (RSC) by default; only use `"use client"` when necessary
- Database mutations via Server Actions or API routes
- Validate user input before database operations
- Never commit `.env.local` or secrets

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Tailwind CSS](https://tailwindcss.com/)
