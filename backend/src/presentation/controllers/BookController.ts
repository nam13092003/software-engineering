import { Response } from "express";
import { z } from "zod";
import { BookService } from "../../business/services/BookService";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/ApiError";

const createBookSchema = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
  genre: z.string().min(1),
  isbn: z.string().min(6),
  totalCopies: z.number().int().min(0),
  description: z.string().optional()
});

const updateBookSchema = createBookSchema.partial();

export class BookController {
  constructor(private readonly bookService: BookService) {}

  create = asyncHandler(async (req, res: Response) => {
    const actor = req.currentUser;
    if (!actor) {
      throw ApiError.unauthorized();
    }

    const payload = createBookSchema.parse(req.body);
    const book = await this.bookService.createBook(actor, payload);
    res.status(201).json(book);
  });

  update = asyncHandler(async (req, res: Response) => {
    const actor = req.currentUser;
    if (!actor) {
      throw ApiError.unauthorized();
    }

    const payload = updateBookSchema.parse(req.body);
    const book = await this.bookService.updateBook(actor, req.params.id, payload);
    res.status(200).json(book);
  });

  remove = asyncHandler(async (req, res: Response) => {
    const actor = req.currentUser;
    if (!actor) {
      throw ApiError.unauthorized();
    }

    await this.bookService.deleteBook(actor, req.params.id);
    res.status(204).send();
  });

  list = asyncHandler(async (_req, res: Response) => {
    const books = await this.bookService.listBooks();
    res.status(200).json(books);
  });

  search = asyncHandler(async (req, res: Response) => {
    const { term, genre } = req.query;
    const books = await this.bookService.searchBooks(
      typeof term === "string" ? term : undefined,
      typeof genre === "string" ? genre : undefined
    );

    res.status(200).json(books);
  });

  getById = asyncHandler(async (req, res: Response) => {
    const book = await this.bookService.getBook(req.params.id);
    res.status(200).json(book);
  });
}
