# Mini Library Management System

A full stack mini library management system that demonstrates a three-tier architecture with a Node.js/Express backend and a React/Vite frontend. Core features include authentication with role-based access, searchable catalog, borrowing/return workflows with availability checks, admin book management, and activity logging.

## Project Structure
`
lab01/
  backend/   <- Express REST API, PostgreSQL data access, services
  frontend/  <- React client, React Query data fetching, Zustand auth store
  docs/      <- Report covering architecture, diagrams, schema, runbook
`

## Quick Start
1. Clone dependencies for both backend and frontend:
   `ash
   cd backend && npm install
   cd ../frontend && npm install
   `
2. Create the backend environment file:
   `ash
   cd ../backend
   cp .env.example .env
   `
   - Set a secure JWT_SECRET.
   - Optional: set DATABASE_URL to a PostgreSQL instance. If omitted, an in-memory pg-mem database is used.
3. Seed baseline data (admin account + sample books):
   `ash
   npm run seed
   `
4. Run the API and client in separate terminals:
   `ash
   npm run dev           # backend (port 3000)
   cd ../frontend
   npm run dev           # frontend (port 5173)
   `

Default admin credentials after seeding:
- Email: dmin@library.local
- Password: Admin@123

## Documentation
See docs/report.md for the architecture overview, class diagram, database schema, detailed endpoint list, and full run instructions.
