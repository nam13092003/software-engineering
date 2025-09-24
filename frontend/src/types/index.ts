export type UserRole = "USER" | "ADMIN";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  isbn: string;
  totalCopies: number;
  availableCopies: number;
  description?: string | null;
  createdAt: string;
}

export interface BookPayload {
  title: string;
  author: string;
  genre: string;
  isbn: string;
  totalCopies: number;
  description?: string | null;
}

export type LoanStatus = "BORROWED" | "RETURNED";

export interface Loan {
  id: string;
  userId: string;
  bookId: string;
  status: LoanStatus;
  borrowedAt: string;
  dueAt: string;
  returnedAt?: string | null;
  createdAt: string;
}

export interface LoanWithDetails extends Loan {
  userName: string;
  userEmail: string;
  bookTitle: string;
  bookAuthor: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  bookId?: string | null;
  action: string;
  message: string;
  createdAt: string;
  userName: string | null;
  userEmail: string | null;
  bookTitle: string | null;
}
