import { Response } from "express";
import { z } from "zod";
import { LogService } from "../../business/services/LogService";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/ApiError";

const listSchema = z.object({
  limit: z.string().transform((value) => Number(value)).optional()
});

export class LogController {
  constructor(private readonly logService: LogService) {}

  list = asyncHandler(async (req, res: Response) => {
    const actor = req.currentUser;
    if (!actor) {
      throw ApiError.unauthorized();
    }

    const parseResult = listSchema.safeParse(req.query);
    const limit = parseResult.success && !Number.isNaN(parseResult.data.limit ?? NaN)
      ? parseResult.data.limit ?? 200
      : 200;

    const logs = await this.logService.listLogs(actor, limit);
    res.status(200).json(logs);
  });
}
