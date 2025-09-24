# Mini Library Management System Report

## 1. Overview
This mini library management system is a full stack web application that supports role-based access for members and librarians (admins). It enables readers to search and borrow books, while administrators can maintain catalog data, oversee loans, and audit activity logs. The stack uses a Node.js + Express REST API with a PostgreSQL-compatible persistence layer and a React + Vite client.

## 2. Architecture
The solution follows a three-layer architecture:

`
Client (React, React Query, Zustand)
        |
REST API (Express controllers, Auth/Book/Loan services)
        |
Data Access Layer (PostgreSQL via pg/pg-mem repositories)
`

- **Presentation layer (frontend)**: React SPA with React Router for routing, React Query for data fetching, and Zustand for auth state. It communicates exclusively with the REST API.
- **Business layer (backend)**: Service classes encapsulate business rules (auth, book management, loan workflows, logging) and coordinate repositories.
- **Data layer**: Repository classes interact with the database using parameterised SQL. A PostgreSQL database is expected in production; pg-mem provides an in-memory fallback for local development and automated testing.

### API Surface Summary
| Area      | Endpoint                              | Method | Description |
|-----------|----------------------------------------|--------|-------------|
| Auth      | /api/auth/register                   | POST   | Register member and issue JWT |
|           | /api/auth/login                      | POST   | Login and issue JWT |
|           | /api/auth/me                         | GET    | Get current profile |
|           | /api/auth/users                      | GET    | Admin list users |
|           | /api/auth/users                      | POST   | Admin create member/admin |
| Books     | /api/books                           | GET    | List all books |
|           | /api/books/search                    | GET    | Search by term/genre |
|           | /api/books/:id                       | GET    | Book details |
|           | /api/books                           | POST   | Admin add book |
|           | /api/books/:id                       | PUT    | Admin update book |
|           | /api/books/:id                       | DELETE | Admin delete book |
| Loans     | /api/loans                           | POST   | Borrow a book |
|           | /api/loans/me                        | GET    | Member loan history |
|           | /api/loans/:id/return                | POST   | Return book |
|           | /api/loans                           | GET    | Admin view all loans |
| Logs      | /api/logs                            | GET    | Admin activity feed |

## 3. Class Diagram (key backend classes)
`mermaid
classDiagram
    class AuthService {
      +register(input)
      +login(input)
      +listUsers()
      +createMemberAsAdmin(actor, input)
    }
    class BookService {
      +createBook(actor, data)
      +updateBook(actor, id, data)
      +deleteBook(actor, id)
      +searchBooks(term, genre)
    }
    class LoanService {
      +borrowBook(actor, data)
      +returnBook(actor, loanId)
      +listMyLoans(actor)
      +listAllLoans(actor)
    }
    class LogService {
      +listLogs(actor, limit)
    }
    class UserRepository
    class BookRepository
    class LoanRepository
    class ActivityLogRepository

    AuthService --> UserRepository
    AuthService --> ActivityLogRepository
    BookService --> BookRepository
    BookService --> ActivityLogRepository
    LoanService --> LoanRepository
    LoanService --> BookRepository
    LoanService --> UserRepository
    LoanService --> ActivityLogRepository
    LogService --> ActivityLogRepository
`

## 4. Database Schema
SQL DDL executed during initialisation:
`sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(10) NOT NULL DEFAULT 'USER',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE books (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  genre VARCHAR(120) NOT NULL,
  isbn VARCHAR(64) NOT NULL UNIQUE,
  total_copies INT NOT NULL CHECK (total_copies >= 0),
  available_copies INT NOT NULL CHECK (available_copies >= 0),
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE loans (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  status VARCHAR(15) NOT NULL,
  borrowed_at TIMESTAMP NOT NULL DEFAULT NOW(),
  due_at TIMESTAMP NOT NULL,
  returned_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE activity_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  book_id UUID REFERENCES books(id) ON DELETE SET NULL,
  action VARCHAR(30) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
`

## 5. Running the Project
### Backend
1. Install dependencies:
   `ash
   cd backend
   npm install
   `
2. Copy environment template and adjust values (set JWT_SECRET, DATABASE_URL if using a real PostgreSQL instance):
   `ash
   cp .env.example .env
   `
   If DATABASE_URL is omitted the API falls back to an in-memory pg-mem database.
3. Seed initial data (creates an admin account and sample books):
   `ash
   npm run seed
   `
4. Start the API in development mode:
   `ash
   npm run dev
   `
   The API listens on http://localhost:3000 by default.

### Frontend
1. Install dependencies:
   `ash
   cd frontend
   npm install
   `
2. Start the Vite development server:
   `ash
   npm run dev
   `
   The client is served at http://localhost:5173 and proxies API calls to http://localhost:3000.

### Default Credentials
After seeding, sign in with:
- Email: dmin@library.local
- Password: Admin@123

## 6. Testing Suggestions
- Use the seeded admin account to add books, view activity logs, and manage loans.
- Create a member via the registration page, borrow a book, then return it to confirm stock updates and logging.
- (Optional) Point DATABASE_URL to a PostgreSQL instance to persist data across restarts.
