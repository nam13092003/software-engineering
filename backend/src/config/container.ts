import { UserRepository } from "../data/repositories/UserRepository";
import { BookRepository } from "../data/repositories/BookRepository";
import { LoanRepository } from "../data/repositories/LoanRepository";
import { ActivityLogRepository } from "../data/repositories/ActivityLogRepository";
import { AuthService } from "../business/services/AuthService";
import { BookService } from "../business/services/BookService";
import { LoanService } from "../business/services/LoanService";
import { LogService } from "../business/services/LogService";

export const userRepository = new UserRepository();
export const bookRepository = new BookRepository();
export const loanRepository = new LoanRepository();
export const activityLogRepository = new ActivityLogRepository();

export const authService = new AuthService(userRepository, activityLogRepository);
export const bookService = new BookService(bookRepository, activityLogRepository);
export const loanService = new LoanService(loanRepository, bookRepository, userRepository, activityLogRepository);
export const logService = new LogService(activityLogRepository);
