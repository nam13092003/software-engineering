import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { ApiError, isApiError } from "../utils/ApiError";

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (isApiError(error)) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }

  if (error instanceof ZodError) {
    res.status(422).json({
      message: "Validation failed",
      details: error.issues.map((issue) => ({ path: issue.path, message: issue.message }))
    });
    return;
  }

  console.error("Unhandled error", error);
  res.status(500).json({ message: "Internal server error" });
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ message: "Resource not found" });
}
