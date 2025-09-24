import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";
import { AuthUser, TokenPayload } from "../types/auth";
import { UserRole } from "../domain/models/User";

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    next(ApiError.unauthorized());
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, env.jwtSecret) as TokenPayload;
    const authUser: AuthUser = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name
    };

    req.currentUser = authUser;
    next();
  } catch (error) {
    next(ApiError.unauthorized("Invalid or expired token"));
  }
}

export function requireRoles(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = req.currentUser;
    if (!user) {
      next(ApiError.unauthorized());
      return;
    }

    if (!roles.includes(user.role)) {
      next(ApiError.forbidden());
      return;
    }

    next();
  };
}
