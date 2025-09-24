import { Response } from "express";
import { z } from "zod";
import { LoanService } from "../../business/services/LoanService";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/ApiError";

const borrowSchema = z.object({
  bookId: z.string().uuid(),
  dueAt: z.string().datetime().optional()
});

export class LoanController {
  constructor(private readonly loanService: LoanService) {}

  borrow = asyncHandler(async (req, res: Response) => {
    const actor = req.currentUser;
    if (!actor) {
      throw ApiError.unauthorized();
    }

    const payload = borrowSchema.parse(req.body);
    const loan = await this.loanService.borrowBook(actor, {
      bookId: payload.bookId,
      dueAt: payload.dueAt ? new Date(payload.dueAt) : undefined
    });

    res.status(201).json(loan);
  });

  returnLoan = asyncHandler(async (req, res: Response) => {
    const actor = req.currentUser;
    if (!actor) {
      throw ApiError.unauthorized();
    }

    const loan = await this.loanService.returnBook(actor, req.params.id);
    res.status(200).json(loan);
  });

  myLoans = asyncHandler(async (req, res: Response) => {
    const actor = req.currentUser;
    if (!actor) {
      throw ApiError.unauthorized();
    }

    const loans = await this.loanService.listMyLoans(actor);
    res.status(200).json(loans);
  });

  allLoans = asyncHandler(async (req, res: Response) => {
    const actor = req.currentUser;
    if (!actor) {
      throw ApiError.unauthorized();
    }

    const loans = await this.loanService.listAllLoans(actor);
    res.status(200).json(loans);
  });
}
