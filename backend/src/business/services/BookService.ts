import { v4 as uuid } from "uuid";
import { BookRepository } from "../../data/repositories/BookRepository";
import { ActivityLogRepository } from "../../data/repositories/ActivityLogRepository";
import { ApiError } from "../../utils/ApiError";
import { CreateBookInput, UpdateBookInput, Book } from "../../domain/models/Book";
import { AuthUser } from "../../types/auth";

interface CreateBookRequest {
  title: string;
  author: string;
  genre: string;
  isbn: string;
  totalCopies: number;
  description?: string | null;
}

interface UpdateBookRequest {
  title?: string;
  author?: string;
  genre?: string;
  isbn?: string;
  totalCopies?: number;
  description?: string | null;
}

export class BookService {
  constructor(
    private readonly bookRepository: BookRepository,
    private readonly activityLogRepository: ActivityLogRepository
  ) {}

  async createBook(actor: AuthUser, payload: CreateBookRequest): Promise<Book> {
    if (actor.role !== "ADMIN") {
      throw ApiError.forbidden();
    }

    if (payload.totalCopies < 0) {
      throw ApiError.badRequest("Total copies must be zero or greater");
    }

    const existing = await this.bookRepository.findByIsbn(payload.isbn);
    if (existing) {
      throw ApiError.conflict("A book with this ISBN already exists");
    }

    const data: CreateBookInput = {
      id: uuid(),
      title: payload.title,
      author: payload.author,
      genre: payload.genre,
      isbn: payload.isbn,
      totalCopies: payload.totalCopies,
      availableCopies: payload.totalCopies,
      description: payload.description ?? null
    };

    const created = await this.bookRepository.create(data);
    await this.activityLogRepository.create({
      id: uuid(),
      userId: actor.id,
      bookId: created.id,
      action: "CREATE_BOOK",
      message: `Book ${created.title} created by ${actor.email}`,
      createdAt: new Date()
    });

    return created;
  }

  async updateBook(actor: AuthUser, bookId: string, payload: UpdateBookRequest): Promise<Book> {
    if (actor.role !== "ADMIN") {
      throw ApiError.forbidden();
    }

    const existing = await this.bookRepository.findById(bookId);
    if (!existing) {
      throw ApiError.notFound("Book not found");
    }

    if (payload.isbn && payload.isbn !== existing.isbn) {
      const duplicate = await this.bookRepository.findByIsbn(payload.isbn);
      if (duplicate) {
        throw ApiError.conflict("Another book with this ISBN already exists");
      }
    }

    const borrowed = existing.totalCopies - existing.availableCopies;
    const desiredTotal = payload.totalCopies ?? existing.totalCopies;

    if (payload.totalCopies !== undefined && payload.totalCopies < borrowed) {
      throw ApiError.badRequest("Total copies cannot be less than copies currently on loan");
    }

    const newAvailable = desiredTotal - borrowed;

    const updateData: UpdateBookInput = {
      ...payload,
      availableCopies: newAvailable
    };

    const updated = await this.bookRepository.update(bookId, updateData);
    if (!updated) {
      throw ApiError.notFound("Book not found");
    }

    await this.activityLogRepository.create({
      id: uuid(),
      userId: actor.id,
      bookId: updated.id,
      action: "UPDATE_BOOK",
      message: `Book ${updated.title} updated by ${actor.email}`,
      createdAt: new Date()
    });

    return updated;
  }

  async deleteBook(actor: AuthUser, bookId: string): Promise<void> {
    if (actor.role !== "ADMIN") {
      throw ApiError.forbidden();
    }

    const existing = await this.bookRepository.findById(bookId);
    if (!existing) {
      throw ApiError.notFound("Book not found");
    }

    if (existing.availableCopies !== existing.totalCopies) {
      throw ApiError.badRequest("Cannot delete a book that is currently borrowed");
    }

    await this.bookRepository.delete(bookId);
    await this.activityLogRepository.create({
      id: uuid(),
      userId: actor.id,
      bookId,
      action: "DELETE_BOOK",
      message: `Book ${existing.title} deleted by ${actor.email}`,
      createdAt: new Date()
    });
  }

  async listBooks(): Promise<Book[]> {
    return this.bookRepository.listAll();
  }

  async searchBooks(term?: string, genre?: string): Promise<Book[]> {
    return this.bookRepository.search(term, genre);
  }

  async getBook(bookId: string): Promise<Book> {
    const book = await this.bookRepository.findById(bookId);
    if (!book) {
      throw ApiError.notFound("Book not found");
    }

    return book;
  }
}
