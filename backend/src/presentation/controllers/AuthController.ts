import { Response } from "express";
import { z } from "zod";
import { AuthService } from "../../business/services/AuthService";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/ApiError";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

const adminCreateSchema = registerSchema.extend({
  role: z.enum(["USER", "ADMIN"]).optional()
});

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = asyncHandler(async (req, res: Response) => {
    const payload = registerSchema.parse(req.body);
    const result = await this.authService.register(payload);
    res.status(201).json(result);
  });

  login = asyncHandler(async (req, res: Response) => {
    const payload = loginSchema.parse(req.body);
    const result = await this.authService.login(payload);
    res.status(200).json(result);
  });

  profile = asyncHandler(async (req, res: Response) => {
    const user = req.currentUser;
    if (!user) {
      throw ApiError.unauthorized();
    }

    const result = await this.authService.getProfile(user.id);
    res.status(200).json(result);
  });

  listUsers = asyncHandler(async (_req, res: Response) => {
    const users = await this.authService.listUsers();
    res.status(200).json(users);
  });

  createUserByAdmin = asyncHandler(async (req, res: Response) => {
    const actor = req.currentUser;
    if (!actor) {
      throw ApiError.unauthorized();
    }

    const payload = adminCreateSchema.parse(req.body);
    const user = await this.authService.createMemberAsAdmin(actor, payload);
    res.status(201).json(user);
  });
}
