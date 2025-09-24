export type LoanStatus = "BORROWED" | "RETURNED";

export interface Loan {
  id: string;
  userId: string;
  bookId: string;
  status: LoanStatus;
  borrowedAt: Date;
  dueAt: Date;
  returnedAt?: Date | null;
  createdAt: Date;
}

export interface LoanWithDetails extends Loan {
  userName: string;
  userEmail: string;
  bookTitle: string;
  bookAuthor: string;
}

export interface CreateLoanInput {
  id: string;
  userId: string;
  bookId: string;
  status: LoanStatus;
  borrowedAt: Date;
  dueAt: Date;
}
