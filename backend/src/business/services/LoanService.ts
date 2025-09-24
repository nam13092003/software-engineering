import { v4 as uuid } from "uuid";
import { LoanRepository } from "../../data/repositories/LoanRepository";
import { BookRepository } from "../../data/repositories/BookRepository";
import { UserRepository } from "../../data/repositories/UserRepository";
import { ActivityLogRepository } from "../../data/repositories/ActivityLogRepository";
import { ApiError } from "../../utils/ApiError";
import { Loan, LoanWithDetails } from "../../domain/models/Loan";
import { AuthUser } from "../../types/auth";

interface BorrowRequest {
  bookId: string;
  dueAt?: Date;
}

export class LoanService {
  constructor(
    private readonly loanRepository: LoanRepository,
    private readonly bookRepository: BookRepository,
    private readonly userRepository: UserRepository,
    private readonly activityLogRepository: ActivityLogRepository
  ) {}

  async borrowBook(currentUser: AuthUser, payload: BorrowRequest): Promise<Loan> {
    const user = await this.userRepository.findById(currentUser.id);
    if (!user) {
      throw ApiError.notFound("User not found");
    }

    const book = await this.bookRepository.findById(payload.bookId);
    if (!book) {
      throw ApiError.notFound("Book not found");
    }

    if (book.availableCopies <= 0) {
      throw ApiError.badRequest("No copies are available for borrowing");
    }

    const existingLoan = await this.loanRepository.findActiveByUserAndBook(currentUser.id, payload.bookId);
    if (existingLoan) {
      throw ApiError.conflict("You already borrowed this book and have not returned it yet");
    }

    const dueAt = payload.dueAt ?? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    if (dueAt.getTime() <= Date.now()) {
      throw ApiError.badRequest("Due date must be in the future");
    }

    const loan = await this.loanRepository.create({
      id: uuid(),
      userId: currentUser.id,
      bookId: payload.bookId,
      status: "BORROWED",
      borrowedAt: new Date(),
      dueAt
    });

    const decremented = await this.bookRepository.decrementAvailableCopies(payload.bookId);
    if (!decremented) {
      throw ApiError.badRequest("Unable to update book availability");
    }

    await this.activityLogRepository.create({
      id: uuid(),
      userId: currentUser.id,
      bookId: payload.bookId,
      action: "BORROW_BOOK",
      message: `${currentUser.email} borrowed ${book.title}`,
      createdAt: new Date()
    });

    return loan;
  }

  async returnBook(currentUser: AuthUser, loanId: string): Promise<Loan> {
    const loan = await this.loanRepository.findById(loanId);
    if (!loan) {
      throw ApiError.notFound("Loan not found");
    }

    if (loan.status !== "BORROWED") {
      throw ApiError.badRequest("Loan has already been closed");
    }

    if (currentUser.role !== "ADMIN" && loan.userId !== currentUser.id) {
      throw ApiError.forbidden("You cannot return a loan that you did not borrow");
    }

    const updatedLoan = await this.loanRepository.markAsReturned(loanId, new Date());
    if (!updatedLoan) {
      throw ApiError.badRequest("Unable to mark loan as returned");
    }

    await this.bookRepository.incrementAvailableCopies(loan.bookId);

    await this.activityLogRepository.create({
      id: uuid(),
      userId: currentUser.id,
      bookId: loan.bookId,
      action: "RETURN_BOOK",
      message: `${currentUser.email} returned loan ${loan.id}`,
      createdAt: new Date()
    });

    return updatedLoan;
  }

  async listMyLoans(currentUser: AuthUser): Promise<LoanWithDetails[]> {
    return this.loanRepository.listByUser(currentUser.id);
  }

  async listAllLoans(currentUser: AuthUser): Promise<LoanWithDetails[]> {
    if (currentUser.role !== "ADMIN") {
      throw ApiError.forbidden();
    }

    return this.loanRepository.listAll();
  }
}
